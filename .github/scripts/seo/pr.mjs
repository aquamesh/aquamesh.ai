/**
 * Ready-to-merge page fixes. When the diagnosis says a hand-made page is the
 * right answer to a buyer question but does not answer it directly, draft the
 * one prescribed change as an inserted block, check it hard, and put it on
 * its own branch with a pull request. Nothing reaches main until Alex merges.
 *
 * If Actions may not open pull requests in this repo, the branch is still
 * pushed and the report links GitHub's compare page, one click from a PR.
 *
 * Checks a draft must pass (validateDraft): it only inserts, never deletes;
 * plain content tags only, no scripts, styles or images; only CSS classes the
 * page already uses; only internal links that resolve; every number already
 * appears on the page (no invented figures); no competitor names.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { MODEL } from '../lib/models.mjs';
import { SITE, COMPETITORS, PR_PAGES, LIMITS } from './config.mjs';
import { parsePage, pageFindings, attrs, decode } from './checks.mjs';
import { fileForPath } from './fix.mjs';

const git = (cwd, args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

export const pagePath = (url) => {
  const p = new URL(url).pathname.replace(/^\//, '');
  return p === '' || p.endsWith('/') ? `${p}index.html` : p;
};
export const canDraft = (url) => { try { return PR_PAGES.test(pagePath(url)); } catch { return false; } };
export const branchFor = (path) => `seo-agent/${path.replace(/\.html$/, '').replace(/[^a-z0-9]+/g, '-')}`;

const ALLOWED_TAGS = new Set(['section', 'div', 'h2', 'h3', 'p', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'span', 'br']);
const ALLOWED_ATTRS = new Set(['class', 'href', 'id', 'aria-label']);
const VOID = new Set(['br']);
const textOf = (html) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const numbers = (s) => (s.match(/\d[\d,.]*\d|\d/g) || []).map(n => n.replace(/[.,]$/, ''));

export function validateDraft(root, path, original, draft) {
  const fail = [];
  const { insert_after: anchor, html } = draft;
  const count = anchor ? original.split(anchor).length - 1 : 0;
  if (count !== 1) fail.push(`insertion point must occur exactly once in the page (found ${count})`);

  const stack = [];
  for (const m of html.matchAll(/<(\/?)([a-z0-9]+)\b([^>]*)>/gi)) {
    const [, close, tag, rest] = m, t = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(t)) { fail.push(`tag <${t}> is not allowed`); continue; }
    if (close) { if (stack.pop() !== t) fail.push(`unbalanced </${t}>`); continue; }
    for (const name of Object.keys(attrs(rest))) if (!ALLOWED_ATTRS.has(name)) fail.push(`attribute ${name} is not allowed`);
    if (!VOID.has(t) && !/\/\s*$/.test(rest)) stack.push(t);
  }
  if (stack.length) fail.push(`unclosed tags: ${stack.join(', ')}`);
  if (/javascript:|<script|<style|\son\w+\s*=/i.test(html)) fail.push('scripts and inline handlers are not allowed');

  const pageClasses = new Set([...original.matchAll(/class="([^"]*)"/g)].flatMap(m => m[1].split(/\s+/)));
  for (const m of html.matchAll(/class="([^"]*)"/g)) {
    for (const c of m[1].split(/\s+/).filter(Boolean)) if (!pageClasses.has(c)) fail.push(`class "${c}" is not used anywhere on this page`);
  }
  const base = `${SITE}/${path}`;
  for (const m of html.matchAll(/href="([^"]*)"/g)) {
    let u;
    try { u = new URL(m[1], base); } catch { fail.push(`bad link ${m[1]}`); continue; }
    if (u.host !== new URL(SITE).host) fail.push(`external link ${m[1]}: drafts may only link inside the site`);
    else if (!existsSync(fileForPath(root, u.pathname))) fail.push(`link ${m[1]} has no page behind it`);
  }

  const pageText = textOf(original), added = textOf(html);
  const invented = [...new Set(numbers(added))].filter(n => !pageText.includes(n));
  if (invented.length) fail.push(`figures not already on the page: ${invented.join(', ')}`);
  for (const name of COMPETITORS) if (new RegExp(`\\b${name}\\b`).test(added)) fail.push(`names ${name}`);
  const words = added.split(/\s+/).filter(Boolean).length;
  if (words < 40 || words > 400) fail.push(`${words} words (want 40 to 400)`);

  if (!fail.length) {
    const next = original.replace(anchor, anchor + '\n' + html);
    const errs = (h) => pageFindings(parsePage(base, h)).filter(x => x.sev === 'error').map(x => x.id);
    const gained = errs(next).filter(id => !errs(original).includes(id));
    if (gained.length) fail.push(`the edited page gains errors: ${gained.join(', ')}`);
  }
  return fail;
}

const Draft = z.object({
  insert_after: z.string().describe('an exact substring of the page HTML, copied character for character, after which the new block goes; usually a closing </section> or </p> plus enough of what precedes it to occur only once'),
  html: z.string().describe('the block to insert, in the page\'s own markup style'),
  summary: z.string().describe('one sentence for the pull request: what the block adds and which buyer question it answers')
});

const SYSTEM = `You edit one page of aquamesh.ai so it directly answers a buyer's question, by
inserting a single new block. You never rewrite or remove anything that is there.

Write like the rest of the site: plain declarative sentences for a plant manager or an
executive, the answer first, specific, no marketing throat-clearing, no rhetorical
questions. Lead with a heading that states the question or its answer.

Hard rules, each checked by code before anyone sees your draft:
- Allowed tags: section, div, h2, h3, p, ul, ol, li, a, strong, em, span, br. No images,
  scripts, styles or inline handlers. Attributes: class, href, id, aria-label only.
- Use only CSS classes that already appear on this page, ideally copying the markup of a
  neighbouring section.
- Links only to pages on aquamesh.ai that already exist.
- Every number you write must already appear on this page. If the answer needs a figure
  the page does not have, say it qualitatively instead.
- AquaMesh recommends and operators decide; it does not actuate equipment. BOD is the
  only parameter it calibrates; the rest is spectral change analysis. Never name
  competitors, customers or prospects.`;

export async function draftChange(client, root, action) {
  const path = pagePath(action.target_page);
  const original = readFileSync(join(root, path), 'utf8');
  const main = (original.match(/<main\b[\s\S]*<\/main>/i) || [original])[0];
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    output_config: { effort: 'high', format: zodOutputFormat(Draft) },
    system: SYSTEM,
    messages: [{ role: 'user', content: `Page: ${SITE}/${path}

Buyer question it should answer: "${action.query}"
Why it loses today: ${action.why}
The change to make: ${action.change}

The page's <main> HTML (insert_after must be copied exactly from it):
${main}` }]
  });
  if (msg.stop_reason === 'refusal') throw new Error('draft refused');
  const draft = Draft.parse(JSON.parse(msg.content.filter(b => b.type === 'text').map(b => b.text).join('')));
  return { path, original, draft };
}

async function github(repo, path, { method = 'GET', body } = {}) {
  const res = await fetch(`https://api.github.com/repos/${repo}${path}`, {
    method,
    headers: { authorization: `Bearer ${process.env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28' },
    body: body ? JSON.stringify(body) : undefined
  });
  return { ok: res.ok, status: res.status, json: res.ok ? await res.json() : null, text: res.ok ? '' : await res.text() };
}

/** Push the edit on its own branch from origin/main, then open a PR or hand back a compare link. */
export async function publishDraft(root, repo, action, { path, original, draft }) {
  const branch = branchFor(path);
  const dir = mkdtempSync(join(tmpdir(), 'seo-pr-'));
  try {
    git(root, ['fetch', '-q', 'origin', 'main']);
    git(root, ['worktree', 'add', '-q', '-B', branch, dir, 'origin/main']);
    const current = readFileSync(join(dir, path), 'utf8');
    if (current !== original) throw new Error(`${path} changed on main while drafting; next week's run will redraft`);
    writeFileSync(join(dir, path), original.replace(draft.insert_after, draft.insert_after + '\n' + draft.html));
    git(dir, ['add', path]);
    git(dir, ['-c', 'user.name=AquaMesh SEO Agent', '-c', 'user.email=actions@users.noreply.github.com',
      'commit', '-q', '-m', `SEO: answer "${action.query}" on /${path}\n\n${draft.summary}`]);
    git(dir, ['push', '-q', 'origin', `HEAD:refs/heads/${branch}`]);
  } finally {
    try { git(root, ['worktree', 'remove', '--force', dir]); } catch { rmSync(dir, { recursive: true, force: true }); }
  }
  const compare = `https://github.com/${repo}/compare/main...${encodeURIComponent(branch)}?expand=1`;
  const body = [
    `**Buyer question:** ${action.query}`,
    `**Why the page loses it today:** ${action.why}`,
    `**What this adds:** ${draft.summary}`,
    '',
    'Drafted by the SEO agent. It only inserts; nothing on the page is removed. Every figure in it was already on the page, and it links only to existing pages. Merging publishes it; closing it is fine, and next week\'s check will show whether answers change.'
  ].join('\n');
  const pr = await github(repo, '/pulls', { method: 'POST', body: { title: `SEO: answer "${action.query.slice(0, 80)}" on /${path}`, head: branch, base: 'main', body } });
  return pr.ok ? { branch, url: pr.json.html_url, number: pr.json.number } : { branch, url: compare, note: `PR not opened (${pr.status}); compare link instead` };
}

export async function draftPageFixes(client, root, repo, actions, { dry = false, log = () => {} } = {}) {
  const out = [];
  const remoteBranches = dry ? '' : git(root, ['ls-remote', '--heads', 'origin', 'seo-agent/*']);
  const pending = new Set([...remoteBranches.matchAll(/refs\/heads\/(\S+)/g)].map(m => m[1]));
  for (const a of actions.filter(a => a.owner === 'alex' && a.verdict === 'weak_page' && canDraft(a.target_page))) {
    if (out.filter(o => o.url || o.wouldPublish).length >= LIMITS.maxDraftsPerRun) break;
    if (pending.size >= LIMITS.maxOpenDrafts) { log('  drafts: open limit reached'); break; }
    const branch = branchFor(pagePath(a.target_page));
    if (pending.has(branch)) { out.push({ query: a.query, page: a.target_page, branch, skipped: 'a draft for this page is still waiting for review' }); continue; }
    try {
      const d = await draftChange(client, root, a);
      const fail = validateDraft(root, d.path, d.original, d.draft);
      if (fail.length) { out.push({ query: a.query, page: a.target_page, rejected: fail }); log(`  draft for ${d.path} rejected: ${fail.join('; ')}`); continue; }
      if (dry) { out.push({ query: a.query, page: a.target_page, wouldPublish: true, summary: d.draft.summary }); continue; }
      const pub = await publishDraft(root, repo, a, d);
      pending.add(pub.branch);
      out.push({ query: a.query, page: a.target_page, summary: d.draft.summary, ...pub });
      log(`  drafted ${d.path}: ${pub.url}`);
    } catch (e) {
      out.push({ query: a.query, page: a.target_page, error: e.message.slice(0, 200) });
    }
  }
  return out;
}
