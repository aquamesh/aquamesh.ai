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

const VERDICT = { crawl_problem: 'crawl problem', weak_page: 'weak page', missing_page: 'missing page', third_party: 'outside sources' };
const ORDER = ['crawl_problem', 'weak_page', 'missing_page', 'third_party'];
const OWNER = { seo_pod: 'SEO pod', alex: 'Alex' };

/** One prescribed change per lost question, most fixable first. */
export function actionList(ai, max = 8) {
  return (ai?.results || [])
    .filter(r => r.diagnosis?.verdict)
    .sort((a, b) => ORDER.indexOf(a.diagnosis.verdict) - ORDER.indexOf(b.diagnosis.verdict))
    .slice(0, max)
    .map(r => ({ query: r.query, ...r.diagnosis }));
}

const trend = (hist = []) => hist.slice(-4).map(h => (h.cited ? 'yes' : 'no')).join(' → ') || 'new';

export function buildReport(run) {
  const { at, crawl, findings, diff, actions, lighthouse, ai, aiHistory = {}, weekly, dryRun } = run;
  const errors = findings.filter(x => x.sev === 'error');
  const warns = findings.filter(x => x.sev === 'warn');
  const infos = findings.filter(x => x.sev === 'info');
  const todo = actionList(ai);
  const buyerPages = new Set(todo.map(a => a.target_page).filter(Boolean));
  const L = [];

  /* the top of the report is the part to act on; everything below is evidence */
  L.push(`# SEO report, ${at.slice(0, 10)}`);
  L.push('');
  const ok = (ai?.results || []).filter(r => !r.error && !r.skipped && r.citable !== false);
  if (ai) L.push(`**AI answers that cite aquamesh.ai: ${ok.filter(r => r.aquameshCited).length} of ${ok.length}** (checked ${ai.at.slice(0, 10)}). Site errors: ${errors.length}.` + (dryRun ? ' _Dry run._' : ''));
  else L.push(`Site errors: ${errors.length}.` + (dryRun ? ' _Dry run._' : ''));
  L.push('');

  L.push('## Do this week');
  if (!todo.length) L.push(ai ? 'Nothing: every tracked question already cites aquamesh.ai, or none was diagnosed.' : 'The first AI-search check has not run yet.');
  const drafts = Object.fromEntries((ai?.drafts || []).filter(d => d.url || d.skipped).map(d => [d.query, d]));
  todo.forEach((a, i) => {
    const d = drafts[a.query];
    const ready = d?.url ? ` **[Ready to merge: review the change](${d.url})**` : d?.skipped ? ' (a drafted fix is waiting for your review)' : '';
    L.push(`${i + 1}. **${OWNER[a.owner]}** · ${VERDICT[a.verdict]}${a.target_page ? ` · \`${short(a.target_page)}\`` : ''}: ${a.change}${ready}`);
    L.push(`   <sub>Lost: "${a.query}". ${a.why}</sub>`);
  });
  for (const e of errors.filter(e => buyerPages.has(e.url))) L.push(`- **Fix first** (buyer page): \`${short(e.url)}\` ${e.msg}`);
  L.push('');

  if (ai) {
    L.push(`## AI search, question by question`);
    L.push('| Buyer question | Cited | Last checks | Diagnosis |');
    L.push('|---|---|---|---|');
    for (const r of ai.results) {
      if (r.error || r.skipped) { L.push(`| ${esc(r.query)} | n/a | | ${esc(r.error || r.skipped)} |`); continue; }
      const cited = r.citable === false ? 'n/a' : r.aquameshCited ? '**yes**' : (r.refused ? 'refused' : 'no');
      L.push(`| ${esc(r.query)} | ${cited} | ${trend(aiHistory[r.query])} | ${r.diagnosis?.verdict ? VERDICT[r.diagnosis.verdict] : (r.aquameshCited ? 'won' : '')} |`);
    }
    L.push('');

    const sources = {};
    for (const r of ai.results) for (const s of r.diagnosis?.sources || []) {
      if (s.action === 'REFERENCE') continue;
      (sources[s.action] ||= new Map()).set(s.url, s);
    }
    const label = { CLAIM: 'profiles and listings to create or take over', EARN: 'mentions, threads and reviews to deserve', CONTEST: 'wrong or outdated information to correct', OWN: 'pages AquaMesh controls' };
    if (Object.keys(sources).length) {
      L.push('## Sources AI trusts instead');
      for (const k of ['CLAIM', 'EARN', 'CONTEST', 'OWN']) {
        if (!sources[k]) continue;
        L.push(`**${k}**: ${label[k]}`);
        for (const s of [...sources[k].values()].slice(0, 8)) L.push(`- ${s.url} (${s.kind}): ${s.note}`);
      }
      L.push('');
    }
    L.push('<details><summary>AI search details</summary>');
    L.push('');
    L.push('| Buyer question | Retrieved | Sources the answer cited |');
    L.push('|---|---|---|');
    for (const r of ai.results.filter(r => !r.error && !r.skipped)) {
      L.push(`| ${esc(r.query)} | ${r.aquameshRetrievedRank ? `#${r.aquameshRetrievedRank}` : 'no'} | ${esc(r.topCitedDomains.join(', ') || 'none')} |`);
    }
    const brand = ai.results[0];
    if (brand?.answer) {
      L.push('');
      L.push(`How the engine describes AquaMesh when asked "${brand.query}":`);
      L.push('');
      L.push(brand.answer.split('\n').map(l => `> ${l}`).join('\n'));
    }
    L.push('');
    L.push('</details>');
    L.push('');
  }

  L.push(`## Site health (${crawl.pages} pages crawled)`);
  L.push(errors.length ? list(errors) : 'No errors.');
  if (diff && (diff.added.length || diff.resolved.length)) {
    L.push('');
    L.push(`Since the last run: ${diff.added.length} new, ${diff.resolved.length} resolved.`);
  }
  L.push('');
  if (lighthouse?.results?.length) {
    L.push(`<details><summary>Core Web Vitals, lab, mobile (${lighthouse.at.slice(0, 10)})</summary>\n`);
    L.push('| Page | Perf | SEO | A11y | LCP | CLS | TBT |');
    L.push('|---|---|---|---|---|---|---|');
    for (const r of lighthouse.results) {
      if (r.error) { L.push(`| \`${short(r.url)}\` | error: ${esc(r.error)} | | | | | |`); continue; }
      L.push(`| \`${short(r.url)}\` | ${r.performance} | ${r.seo} | ${r.accessibility} | ${(r.lcpMs / 1000).toFixed(1)}s | ${r.cls} | ${r.tbtMs} ms |`);
    }
    L.push('\n</details>\n');
  }
  if (warns.length) {
    /* warnings on pages that answer buyer questions first */
    const ranked = [...warns.filter(w => buyerPages.has(w.url)), ...warns.filter(w => !buyerPages.has(w.url))];
    L.push(`<details><summary>${warns.length} warnings</summary>\n\n${list(ranked)}\n\n</details>`);
    L.push('');
  }
  if (infos.length) {
    L.push(`<details><summary>Opportunities</summary>\n\n${list(infos)}\n\n</details>`);
    L.push('');
  }

  L.push('<details><summary>What the agent did this run</summary>\n');
  for (const a of actions) L.push(`- ${a}`);
  L.push('\n</details>\n');

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
    const ok = ai.results.filter(r => !r.error && !r.skipped && r.citable !== false);
    const todo = actionList(ai, 3);
    lines.push(`Weekly: AI answers cite aquamesh.ai for ${ok.filter(r => r.aquameshCited).length} of ${ok.length} buyer questions.` +
      (todo.length ? ` Top fixes:\n${todo.map((a, i) => `${i + 1}. **${OWNER[a.owner]}**: ${a.change}`).join('\n')}` : ''));
  }
  return lines.join('\n\n');
}
