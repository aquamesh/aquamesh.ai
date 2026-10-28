/**
 * The one thing the agent is allowed to change on the site: when committed
 * sources and committed output disagree (someone edited blog/posts/*.md, or
 * the generator, without rebuilding), rebuild and commit the generated files.
 *
 * Guardrails, all enforced here rather than trusted to a prompt:
 *  - only paths matching config.GENERATED may be committed, never deleted
 *  - a rebuilt HTML page may not have more errors than the committed one
 *  - every internal link in a rebuilt page must resolve to a file in the tree
 *  - the sitemap may not lose URLs, and llms.txt must list every post
 *  - after deploy, a changed page that stops returning 200 is reverted
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE, GENERATED, TIMESTAMP_LINE, LIMITS } from './config.mjs';
import { parsePage, pageFindings, parseSitemap, isInternal, isPost } from './checks.mjs';
import { fetchUrl } from './crawl.mjs';

const git = (root, args, opts = {}) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();

export const isGenerated = (path) => GENERATED.some(re => re.test(path));

/* true when every changed line in a unified diff is a build timestamp */
export function timestampOnly(diff) {
  const lines = diff.split('\n').filter(l => /^[+-]/.test(l) && !/^(\+\+\+|---)/.test(l));
  return lines.length > 0 && lines.every(l => TIMESTAMP_LINE.test(l.slice(1)));
}

/** Rebuild, discard timestamp-only churn, report what really changed. */
export function detectDrift(root) {
  execFileSync('node', [join(root, 'scripts', 'build-blog.mjs')], { cwd: root, stdio: 'pipe' });
  const changed = [], added = [], deleted = [];
  /* untrimmed: the two status columns can start with a space */
  const status = execFileSync('git', ['status', '--porcelain=v1', '-uall'], { cwd: root, encoding: 'utf8' });
  for (const line of status.split('\n').filter(Boolean)) {
    const code = line.slice(0, 2), path = line.slice(3);
    if (code === '??') added.push(path);
    else if (code.includes('D')) deleted.push(path);
    else if (timestampOnly(git(root, ['diff', '--unified=0', '--', path]))) git(root, ['checkout', '--', path]);
    else changed.push(path);
  }
  return { changed, added, deleted };
}

function fileForPath(root, pathname) {
  const p = decodeURIComponent(pathname).replace(/^\//, '');
  return join(root, p === '' || p.endsWith('/') ? `${p}index.html` : p);
}

/** Decide whether a rebuild is safe to commit. Returns { ok, reasons }. */
export function gateFix(root, drift) {
  const reasons = [];
  const files = [...drift.changed, ...drift.added];
  if (drift.deleted.length) reasons.push(`rebuild deletes files: ${drift.deleted.join(', ')}`);
  const outside = files.filter(p => !isGenerated(p));
  if (outside.length) reasons.push(`rebuild touches files the agent may not commit: ${outside.join(', ')}`);
  if (files.length > LIMITS.maxFixFiles) reasons.push(`rebuild changes ${files.length} files (cap ${LIMITS.maxFixFiles})`);

  for (const path of files.filter(p => p.endsWith('.html'))) {
    const url = `${SITE}/${path}`;
    const now = parsePage(url, readFileSync(join(root, path), 'utf8'));
    let before = [];
    try { before = pageFindings(parsePage(url, git(root, ['show', `HEAD:${path}`]))); } catch { /* new file */ }
    const errs = (fs) => fs.filter(x => x.sev === 'error').map(x => x.id);
    const regressed = errs(pageFindings(now)).filter(id => !errs(before).includes(id));
    if (regressed.length) reasons.push(`${path}: rebuild introduces ${regressed.join(', ')}`);
    for (const a of now.anchors.filter(a => isInternal(a.abs))) {
      if (!existsSync(fileForPath(root, new URL(a.abs).pathname))) reasons.push(`${path}: link to ${a.abs} has no file behind it`);
    }
  }

  if (files.includes('sitemap.xml')) {
    const now = parseSitemap(readFileSync(join(root, 'sitemap.xml'), 'utf8')).map(e => e.loc);
    const before = parseSitemap(git(root, ['show', 'HEAD:sitemap.xml'])).map(e => e.loc);
    const lost = before.filter(u => !now.includes(u));
    if (lost.length) reasons.push(`sitemap would lose ${lost.join(', ')}`);
  }
  const sitemapNow = parseSitemap(readFileSync(join(root, 'sitemap.xml'), 'utf8')).map(e => e.loc);
  const llms = readFileSync(join(root, 'llms.txt'), 'utf8');
  const unlisted = sitemapNow.filter(isPost).filter(u => !llms.includes(u));
  if (unlisted.length) reasons.push(`llms.txt would not list ${unlisted.join(', ')}`);

  return { ok: reasons.length === 0, reasons, files };
}

/** Commit the generated files and push, rebuilding on top of any newer main. */
export function commitAndPush(root, { log = () => {} } = {}) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    git(root, ['fetch', '-q', 'origin', 'main']);
    git(root, ['reset', '-q', '--hard', 'origin/main']);
    const drift = detectDrift(root);
    const files = [...drift.changed, ...drift.added];
    if (!files.length) return { pushed: false, reason: 'main already matches its sources' };
    const gate = gateFix(root, drift);
    if (!gate.ok) return { pushed: false, refused: true, reasons: gate.reasons, files };
    git(root, ['add', '--', ...files]);
    git(root, ['-c', 'user.name=AquaMesh SEO Agent', '-c', 'user.email=actions@users.noreply.github.com',
      'commit', '-q', '-m', `SEO agent: rebuild ${files.length} generated file(s) from committed sources\n\n${files.join('\n')}`]);
    try {
      git(root, ['push', '-q', 'origin', 'HEAD:main']);
      return { pushed: true, sha: git(root, ['rev-parse', 'HEAD']), files, changed: drift.changed, added: drift.added };
    } catch (e) {
      log(`  push rejected (attempt ${attempt}), main moved; rebuilding on the new tip`);
    }
  }
  return { pushed: false, reason: 'push rejected three times; another agent is pushing, will retry next run' };
}

const pageUrl = (path) => `${SITE}/${path.replace(/(^|\/)index\.html$/, '$1')}`;

/**
 * Wait for GitHub Pages to serve the new files. "Deployed" means at least one
 * pushed file is live byte-for-byte; until then nothing is judged, because
 * Pages lag is not breakage. Once deployed, a page that answered 200 before
 * the push and does not now is a breaking change, and the commit is reverted.
 */
export async function verifyDeploy(root, sha, { changed, added }, { log = () => {}, timeoutMs = 10 * 60e3 } = {}) {
  const probe = [...changed, ...added].filter(p => /\.(xml|txt|html)$/.test(p));
  const deadline = Date.now() + timeoutMs;
  let deployed = false;
  while (!deployed && Date.now() < deadline) {
    for (const path of probe) {
      const r = await fetchUrl(`${pageUrl(path)}?v=${Date.now()}`);
      if (r.status === 200 && r.body === readFileSync(join(root, path), 'utf8')) { deployed = true; break; }
    }
    if (!deployed) await new Promise(r => setTimeout(r, 20000));
  }
  if (!deployed) return { verified: false, pending: true, broken: [] };

  const broken = [];
  for (const path of changed.filter(p => p.endsWith('.html'))) {
    const r = await fetchUrl(`${pageUrl(path)}?v=${Date.now()}`);
    if (r.status !== 200) broken.push(`${pageUrl(path)} (${r.status})`);
  }
  if (broken.length) {
    log(`  deployed pages are broken, reverting ${sha.slice(0, 7)}: ${broken.join(', ')}`);
    git(root, ['fetch', '-q', 'origin', 'main']);
    git(root, ['reset', '-q', '--hard', 'origin/main']);
    git(root, ['-c', 'user.name=AquaMesh SEO Agent', '-c', 'user.email=actions@users.noreply.github.com',
      'revert', '--no-edit', sha]);
    git(root, ['push', '-q', 'origin', 'HEAD:main']);
    return { verified: false, reverted: true, broken };
  }
  return { verified: true, broken };
}
