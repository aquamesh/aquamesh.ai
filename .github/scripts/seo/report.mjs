/**
 * Turns one run into markdown: what the agent did, what needs a human, and
 * the weekly numbers. The same text goes to the job summary, the rolling
 * GitHub issue, and latest.md on the seo-agent-data branch.
 */

import { SITE } from './config.mjs';

const short = (u) => (u || '').replace(SITE, '') || '/';
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

function group(findings) {
  const by = new Map();
  for (const x of findings) by.set(x.id, [...(by.get(x.id) || []), x]);
  return [...by.entries()].sort((a, b) => b[1].length - a[1].length);
}

function list(findings, max = 12) {
  const lines = [];
  for (const [id, xs] of group(findings)) {
    lines.push(`- **${id}** (${xs.length})`);
    for (const x of xs.slice(0, max)) lines.push(`  - \`${short(x.url)}\`: ${x.msg}`);
    if (xs.length > max) lines.push(`  - and ${xs.length - max} more`);
  }
  return lines.join('\n');
}

export function buildReport(run) {
  const { at, crawl, findings, diff, actions, lighthouse, ai, weekly, dryRun } = run;
  const errors = findings.filter(x => x.sev === 'error');
  const warns = findings.filter(x => x.sev === 'warn');
  const infos = findings.filter(x => x.sev === 'info');
  const L = [];

  L.push(`# SEO agent report, ${at.slice(0, 10)}`);
  L.push('');
  const n = (k, w) => `${k} ${w}${k === 1 ? '' : 's'}`;
  L.push(`**${n(errors.length, 'error')}, ${n(warns.length, 'warning')}** on ${crawl.pages} pages of ${SITE}.` +
    (diff ? ` Since the last run: ${diff.added.length} new, ${diff.resolved.length} resolved.` : ' First run.') +
    (dryRun ? ' _Dry run: nothing was committed, pinged or posted._' : ''));
  L.push('');

  L.push('## What I did');
  for (const a of actions) L.push(`- ${a}`);
  L.push('');

  if (diff && (diff.added.length || diff.resolved.length)) {
    L.push('## Changed since last run');
    if (diff.added.length) L.push(`New:\n${list(diff.added, 8)}`);
    if (diff.resolved.length) L.push(`Resolved:\n${list(diff.resolved, 8)}`);
    L.push('');
  }

  L.push('## Errors');
  L.push(errors.length ? list(errors) : 'None.');
  L.push('');

  if (ai) {
    L.push(`## AI search visibility (${ai.engine}, ${ai.at.slice(0, 10)})`);
    const ok = ai.results.filter(r => !r.error && !r.skipped);
    const cited = ok.filter(r => r.aquameshCited).length, seen = ok.filter(r => r.aquameshRetrievedRank).length;
    L.push(`aquamesh.ai was **cited in ${cited} of ${ok.length}** answers and retrieved in ${seen}. Cost $${ai.usd}.`);
    L.push('');
    L.push('| Buyer question | Retrieved | Cited | Sources the answer cited |');
    L.push('|---|---|---|---|');
    for (const r of ai.results) {
      if (r.error || r.skipped) { L.push(`| ${esc(r.query)} | n/a | n/a | ${esc(r.error || r.skipped)} |`); continue; }
      L.push(`| ${esc(r.query)} | ${r.aquameshRetrievedRank ? `#${r.aquameshRetrievedRank}` : 'no'} | ${r.aquameshCited ? '**yes**' : (r.refused ? 'refused' : 'no')} | ${esc(r.topCitedDomains.join(', ') || 'none')} |`);
    }
    const brand = ai.results[0];
    if (brand?.answer) {
      L.push('');
      L.push(`How the engine describes AquaMesh when asked "${brand.query}":`);
      L.push('');
      L.push(brand.answer.split('\n').map(l => `> ${l}`).join('\n'));
    }
    L.push('');
  }

  if (lighthouse?.results?.length) {
    L.push(`## Core Web Vitals, lab (mobile, ${lighthouse.at.slice(0, 10)})`);
    L.push('| Page | Perf | SEO | A11y | LCP | CLS | TBT |');
    L.push('|---|---|---|---|---|---|---|');
    for (const r of lighthouse.results) {
      if (r.error) { L.push(`| \`${short(r.url)}\` | error: ${esc(r.error)} | | | | | |`); continue; }
      L.push(`| \`${short(r.url)}\` | ${r.performance} | ${r.seo} | ${r.accessibility} | ${(r.lcpMs / 1000).toFixed(1)}s | ${r.cls} | ${r.tbtMs} ms |`);
    }
    L.push('');
  }

  if (warns.length) {
    L.push(`<details><summary><b>${warns.length} warnings</b></summary>\n\n${list(warns)}\n\n</details>`);
    L.push('');
  }
  if (infos.length) {
    L.push('## Opportunities');
    L.push(list(infos));
    L.push('');
  }

  L.push('---');
  L.push(`Daily at 13:40 UTC from \`.github/workflows/seo-agent.yml\`; weekly checks (Lighthouse, AI search, external links) ${weekly ? 'ran this time' : 'run every 7 days'}. ` +
    'It only ever commits files that `scripts/build-blog.mjs` generates. Off switch: repository variable `SEO_AGENT=off`; report-only: `SEO_AGENT_AUTOFIX=off`. History lives on the `seo-agent-data` branch.');
  return L.join('\n');
}

/* A short comment for the issue, only when something worth a notification happened. */
export function buildNotice(run) {
  const { diff, fix, weekly, ai } = run;
  const lines = [];
  if (fix?.pushed) lines.push(`Rebuilt ${fix.files.length} generated file(s) from committed sources: ${fix.sha.slice(0, 7)}${fix.verify?.reverted ? ' (**reverted**: the deploy broke pages)' : fix.verify?.verified ? ', verified live' : ', deploy pending'}.`);
  if (fix?.refused) lines.push(`Sources and generated files disagree, but the rebuild failed a guardrail, so nothing was committed: ${fix.reasons.join('; ')}`);
  const newErrors = (diff?.added || []).filter(x => x.sev === 'error');
  if (newErrors.length) lines.push(`New errors:\n${list(newErrors, 6)}`);
  const fixedErrors = (diff?.resolved || []).filter(x => x.sev === 'error');
  if (fixedErrors.length) lines.push(`${fixedErrors.length} error(s) resolved since the last run.`);
  if (weekly && ai) {
    const ok = ai.results.filter(r => !r.error && !r.skipped);
    lines.push(`Weekly: aquamesh.ai cited in ${ok.filter(r => r.aquameshCited).length} of ${ok.length} AI answers; Lighthouse and external links re-checked.`);
  }
  return lines.join('\n\n');
}
