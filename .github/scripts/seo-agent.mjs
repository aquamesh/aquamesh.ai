#!/usr/bin/env node
/**
 * AquaMesh SEO agent: the SEO work the blog agents leave undone.
 *
 * Daily
 *   1. Drift: rebuild from committed sources. If the generated files differ,
 *      commit them (guarded, see seo/fix.mjs) and verify the deploy.
 *   2. Crawl the LIVE site and check every page: status, titles, meta,
 *      canonicals, JSON-LD, Open Graph, internal links and assets, sitemap,
 *      robots, llms.txt, feed, homepage regressions, case-study figures.
 *   3. IndexNow: tell Bing and friends which URLs changed since last run.
 * Weekly
 *   4. Lighthouse Core Web Vitals on key pages.
 *   5. AI search probe: is aquamesh.ai retrieved and cited for buyer questions?
 *   6. External link check.
 * Then a report: job summary, a rolling GitHub issue (comment only when
 * something changed), and history on the seo-agent-data branch.
 *
 * It never writes content, never edits hand-made pages, and commits only
 * files scripts/build-blog.mjs generates. Posts, keywords and rankings belong
 * to the SEO pod on the AWS box; this agent reports problems in them.
 *
 * Usage:
 *   node .github/scripts/seo-agent.mjs [--weekly] [--dry-run] [--drift] [--data-dir DIR]
 *   --weekly   run the weekly checks now regardless of schedule
 *   --dry-run  no commits, no IndexNow, no GitHub issue; report to stdout and data dir
 *   --drift    run the drift check outside CI (it rebuilds in this checkout)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { SITE, LIMITS, LIGHTHOUSE_PAGES, USER_AGENT } from './seo/config.mjs';
import { siteFindings, diffFindings, isPost } from './seo/checks.mjs';
import { crawlSite, fetchUrl } from './seo/crawl.mjs';
import { detectDrift, commitAndPush, verifyDeploy } from './seo/fix.mjs';
import { changedUrls, submitIndexNow } from './seo/indexnow.mjs';
import { lighthouse, vitalsFindings } from './seo/lighthouse.mjs';
import { probeAiSearch } from './seo/ai-search.mjs';
import { buildReport, buildNotice } from './seo/report.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const argv = process.argv.slice(2);
const opt = (name) => { const i = argv.indexOf(name); return i === -1 ? null : argv[i + 1]; };
const DRY = argv.includes('--dry-run');
const CI = process.env.GITHUB_ACTIONS === 'true';
const DATA = opt('--data-dir') || join(ROOT, '_growth', 'seo');
const REPO = process.env.GITHUB_REPOSITORY || 'aquamesh/aquamesh.ai';
const AUTOFIX = CI && !DRY && (process.env.SEO_AGENT_AUTOFIX || '').toLowerCase() !== 'off';
const log = (...a) => console.log(...a);
const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

function loadState() {
  try { return JSON.parse(readFileSync(join(DATA, 'state.json'), 'utf8')); } catch { return {}; }
}

async function github(path, { method = 'GET', body } = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28', 'user-agent': USER_AGENT
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) throw new Error(`GitHub ${method} ${path}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res.status === 204 ? null : res.json();
}

async function publishIssue(report, notice) {
  const title = 'SEO agent: live site report';
  const body = report.length > 60000 ? `${report.slice(0, 60000)}\n\n(truncated; full report on the seo-agent-data branch)` : report;
  const open = await github('/issues?labels=seo-agent&state=open&per_page=5');
  let issue = open.find(i => i.title === title);
  if (issue) await github(`/issues/${issue.number}`, { method: 'PATCH', body: { body } });
  else issue = await github('/issues', { method: 'POST', body: { title, body, labels: ['seo-agent'] } });
  if (notice) await github(`/issues/${issue.number}/comments`, { method: 'POST', body: { body: notice } });
  return issue.html_url;
}

/* GitHub Pages builds from main, but a push made with the Actions token may
   not start a build on its own. Asking twice is harmless. */
async function requestPagesBuild() {
  try { await github('/pages/builds', { method: 'POST' }); return true; } catch (e) { log(`  pages build request: ${e.message}`); return false; }
}

async function main() {
  const at = new Date().toISOString();
  const state = loadState();
  const weekly = argv.includes('--weekly') || !state.weeklyAt || (Date.now() - Date.parse(state.weeklyAt)) / 864e5 >= LIMITS.weeklyEveryDays;
  const actions = [];
  const extra = [];
  let fix = null;

  /* 1. drift. It rebuilds in this checkout, so it only runs on a clean tree:
     never on top of someone's uncommitted work. */
  const dirty = (CI || argv.includes('--drift')) && git(['status', '--porcelain']) !== '';
  if (dirty) actions.push('Skipped the drift check: this checkout has uncommitted changes.');
  else if (CI || argv.includes('--drift')) {
    log('drift check...');
    const drift = detectDrift(ROOT);
    const files = [...drift.changed, ...drift.added];
    if (!files.length && !drift.deleted.length) {
      actions.push('Rebuilt the blog from committed sources: output already matches, nothing to commit.');
    } else if (AUTOFIX) {
      fix = commitAndPush(ROOT, { log });
      if (fix.pushed) {
        await requestPagesBuild();
        log(`  pushed ${fix.sha.slice(0, 7)}, waiting for the deploy...`);
        fix.verify = await verifyDeploy(ROOT, fix.sha, fix, { log });
        const how = fix.verify.reverted ? `**reverted** because the deploy broke ${fix.verify.broken.join(', ')}`
          : fix.verify.verified ? 'verified live' : 'deploy still pending after 10 minutes; next run re-checks';
        actions.push(`Committed ${fix.files.length} regenerated file(s) whose sources had changed without a rebuild ([${fix.sha.slice(0, 7)}](https://github.com/${REPO}/commit/${fix.sha})): ${fix.files.join(', ')}. ${how}.`);
      } else if (fix.refused) {
        extra.push({ sev: 'error', id: 'drift-unfixable', url: `${SITE}/`, msg: `generated files are stale but the rebuild failed a guardrail: ${fix.reasons.join('; ')}` });
        actions.push('Found stale generated files; the rebuild failed a guardrail, so I committed nothing.');
      } else actions.push(`Found stale generated files; did not commit: ${fix.reason}.`);
    } else {
      extra.push({ sev: 'warn', id: 'drift', url: `${SITE}/`, msg: `generated files are stale relative to their sources: ${files.join(', ')}` });
      actions.push(`Found ${files.length} stale generated file(s); auto-fix is off for this run, so I only report them.`);
      if (drift.changed.length) git(['checkout', '--', ...drift.changed]);
      for (const p of drift.added) execFileSync('rm', ['-f', join(ROOT, p)]);
    }
  }

  /* 2. live crawl */
  log(`crawling ${SITE}${weekly ? ' (with external links)' : ''}...`);
  const crawl = await crawlSite({ externals: weekly, log });
  let findings = [...siteFindings(crawl), ...extra];
  actions.push(`Crawled ${crawl.pages.size} live pages and ${[...crawl.statuses.keys()].length - crawl.pages.size} assets and files${crawl.external ? `, plus ${crawl.external.size} external links` : ''}.`);

  /* is GitHub Pages serving what main says? */
  try {
    const age = (Date.now() - Date.parse(git(['log', '-1', '--format=%cI', '--', 'sitemap.xml']))) / 60e3;
    const live = await fetchUrl(`${SITE}/sitemap.xml?v=${Date.now()}`);
    const head = git(['show', 'HEAD:sitemap.xml']);
    if (age > 30 && live.status === 200 && live.body.trim() !== head.trim()) {
      findings.push({ sev: 'warn', id: 'deploy-stale', url: `${SITE}/sitemap.xml`, msg: `live sitemap differs from main's, committed ${Math.round(age)} min ago; the Pages deploy may have failed` });
    }
  } catch { /* not a git checkout */ }

  /* 3. IndexNow */
  const { hashes, changed } = changedUrls(crawl.pages, crawl.sitemap, state.pageHashes);
  let indexnow = state.indexnow || null;
  let pageHashes = state.pageHashes || {};
  if (DRY) actions.push(`IndexNow: ${changed.length} changed URL(s) would be submitted (dry run).`);
  else if (changed.length) {
    indexnow = { at, ...(await submitIndexNow(changed)) };
    if (indexnow.ok) pageHashes = hashes;
    actions.push(indexnow.ok
      ? `Told IndexNow (Bing, Copilot, Yandex) about ${indexnow.sent} new or changed URL(s) (HTTP ${indexnow.status}).`
      : `IndexNow submission failed (HTTP ${indexnow.status}): ${indexnow.note}. Will retry next run.`);
    if (!indexnow.ok) findings.push({ sev: 'warn', id: 'indexnow-failed', url: `${SITE}/`, msg: `IndexNow returned ${indexnow.status}: ${indexnow.note}` });
  } else actions.push('IndexNow: no page content changed since the last run, nothing to submit.');

  /* 4-5. weekly */
  let lh = state.lighthouse || null, ai = state.ai || null;
  const aiHistory = { ...(state.aiHistory || {}) };
  if (weekly) {
    log('lighthouse...');
    const newest = crawl.sitemap.filter(e => isPost(e.loc)).sort((a, b) => (a.lastmod < b.lastmod ? 1 : -1))[0]?.loc;
    const urls = LIGHTHOUSE_PAGES.map(p => (p === '{newest-post}' ? newest : SITE + p)).filter(Boolean);
    const prev = Object.fromEntries((state.lighthouse?.results || []).map(r => [r.url, r]));
    const results = [];
    for (const u of urls) {
      try {
        const r = await lighthouse(u);
        results.push(r);
        findings.push(...vitalsFindings(r, prev[u]));
        log(`  ${u}: perf ${r.performance}, LCP ${r.lcpMs} ms`);
      } catch (e) {
        results.push({ url: u, error: e.message.split('\n')[0].slice(0, 160) });
      }
    }
    lh = { at, results };
    actions.push(`Ran Lighthouse (mobile) on ${results.length} pages.`);

    if (process.env.ANTHROPIC_API_KEY) {
      log('AI search probe...');
      ai = { at, ...(await probeAiSearch({ log, crawl, findings })) };
      /* the rerun loop: remember each question's result so movement shows */
      for (const r of ai.results.filter(r => !r.error && !r.skipped && r.citable)) {
        aiHistory[r.query] = [...(aiHistory[r.query] || []), { at, cited: r.aquameshCited, rank: r.aquameshRetrievedRank, verdict: r.diagnosis?.verdict || null }].slice(-26);
      }
      const ok = ai.results.filter(r => !r.error && !r.skipped && r.citable !== false);
      actions.push(`Asked an AI answer engine ${ok.length} buyer questions; aquamesh.ai was cited in ${ok.filter(r => r.aquameshCited).length} ($${ai.usd}).`);
    } else actions.push('AI search probe skipped: ANTHROPIC_API_KEY is not set.');
  } else {
    /* carry last week's vitals findings forward so they do not flap */
    for (const r of lh?.results || []) if (!r.error) findings.push(...vitalsFindings(r));
  }

  /* 6. report */
  const prevFindings = state.findings || null;
  const diff = prevFindings ? diffFindings(prevFindings, findings) : null;
  const run = { at, crawl: { pages: crawl.pages.size }, findings, diff, actions, lighthouse: lh, ai, aiHistory, weekly, dryRun: DRY, fix };
  const report = buildReport(run);
  const notice = prevFindings ? buildNotice(run) : 'First run of the SEO agent. The report above is the baseline.';

  mkdirSync(join(DATA, 'reports'), { recursive: true });
  writeFileSync(join(DATA, 'latest.md'), report + '\n');
  writeFileSync(join(DATA, 'latest.json'), JSON.stringify({ at, findings, actions, lighthouse: lh, ai, indexnow, fix }, null, 2) + '\n');
  writeFileSync(join(DATA, 'reports', `${at.slice(0, 10)}.md`), report + '\n');
  const hist = join(DATA, 'history.csv');
  if (!existsSync(hist)) writeFileSync(hist, 'date,errors,warnings,pages,indexnow_sent,fix_files,ai_cited,ai_asked,home_perf,home_lcp_ms\n');
  const home = lh?.results?.find(r => r.url === `${SITE}/`);
  const okAi = weekly && ai ? ai.results.filter(r => !r.error && !r.skipped && r.citable !== false) : null;
  appendFileSync(hist, [at.slice(0, 10), findings.filter(x => x.sev === 'error').length, findings.filter(x => x.sev === 'warn').length,
    crawl.pages.size, (!DRY && changed.length && indexnow?.ok) ? indexnow.sent : 0, fix?.pushed ? fix.files.length : 0,
    okAi ? okAi.filter(r => r.aquameshCited).length : '', okAi ? okAi.length : '',
    weekly ? (home?.performance ?? '') : '', weekly ? (home?.lcpMs ?? '') : ''].join(',') + '\n');

  if (!DRY) {
    writeFileSync(join(DATA, 'state.json'), JSON.stringify({
      version: 1, lastRunAt: at, weeklyAt: weekly ? at : state.weeklyAt,
      findings, pageHashes, indexnow, lighthouse: lh, ai, aiHistory,
      fixes: [...(state.fixes || []), ...(fix?.pushed ? [{ at, sha: fix.sha, files: fix.files, verify: fix.verify }] : [])].slice(-30)
    }, null, 2) + '\n');
  }

  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n');
  if (!DRY && process.env.GITHUB_TOKEN) {
    const url = await publishIssue(report, notice);
    log(`report: ${url}`);
  } else {
    log('\n' + report);
  }
}

main().catch(err => {
  console.error('SEO agent failed:', err.stack || err.message);
  process.exit(1);
});
