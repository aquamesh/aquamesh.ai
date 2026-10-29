/**
 * AI search visibility: ask an answer engine the questions buyers ask, and
 * record whether aquamesh.ai was retrieved and whether it was cited. This is
 * the measurement "AI SEO" services sell; it has to exist before any change
 * aimed at AI answers can be judged.
 *
 * One engine for now (Claude with web search, on the repo's API key). The
 * model only answers questions here; it never writes to the site.
 */

import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { MODEL } from '../lib/models.mjs';
import { HOST, AI_QUERIES, LIMITS, NOT_ANSWER_PAGES, COMPETITORS } from './config.mjs';
import { isPost, normalizeUrl } from './checks.mjs';

const SYSTEM = `You are an AI search assistant. Answer the user's question the way a careful
answer engine does: search the web, read what you find, and give a concise answer
(under 250 words) that cites the sources you relied on.`;

/* Sonnet 5.5 list prices; web search is billed per search. */
const PRICE = { input: 2 / 1e6, output: 10 / 1e6, cacheRead: 0.2 / 1e6, search: 0.01 };

export const domainOf = (u) => { try { return new URL(u).host.replace(/^www\./, ''); } catch { return ''; } };
const ours = (u) => domainOf(u) === HOST || domainOf(u).endsWith(`.${HOST}`);

/**
 * Walk any response content and pull out search results (retrieved) and the
 * citations attached to answer text (cited). Walking the whole tree instead
 * of fixed paths keeps this working when results arrive inside other blocks.
 */
export function collectSources(content) {
  const retrieved = [], cited = [], titles = {};
  const link = (n) => n.url || n.source;
  const walk = (node, inCitations = false) => {
    if (Array.isArray(node)) return node.forEach(n => walk(n, inCitations));
    if (!node || typeof node !== 'object') return;
    /* plain web search gives web_search_result{url}; dynamic filtering can
       hand back search_result{source}. Citations mirror the same split. */
    const isResult = /^(web_)?search_result$/.test(node.type) && link(node);
    const isCite = (/search_result_location$/.test(node.type) || inCitations) && /^https?:/.test(link(node) || '');
    if (isResult) retrieved.push(link(node));
    if (isCite) cited.push(link(node));
    if ((isResult || isCite) && node.title && !titles[link(node)]) titles[link(node)] = node.title;
    for (const [k, v] of Object.entries(node)) if (v && typeof v === 'object') walk(v, k === 'citations');
  };
  walk(content);
  return { retrieved: [...new Set(retrieved)], cited: [...new Set(cited)], titles };
}

/* The answer is the text after the last tool round; earlier text is the
   model talking to itself between searches. */
export function finalAnswer(content) {
  const blocks = Array.isArray(content) ? content : [];
  const lastTool = blocks.findLastIndex(b => b.type !== 'text' && b.type !== 'thinking');
  return blocks.slice(lastTool + 1).filter(b => b.type === 'text').map(b => b.text).join('').trim();
}

export function summarize(query, content) {
  const { retrieved, cited, titles } = collectSources(content);
  const rank = retrieved.findIndex(ours);
  const domains = {};
  for (const u of cited) domains[domainOf(u)] = (domains[domainOf(u)] || 0) + 1;
  const answer = finalAnswer(content);
  const blockTypes = {};
  for (const b of Array.isArray(content) ? content : []) blockTypes[b.type] = (blockTypes[b.type] || 0) + 1;
  return {
    query,
    retrievedCount: retrieved.length,
    citedCount: cited.length,
    aquameshRetrievedRank: rank === -1 ? null : rank + 1,
    aquameshCited: cited.some(ours),
    aquameshUrls: [...new Set([...retrieved, ...cited].filter(ours))],
    topCitedDomains: Object.entries(domains).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([d]) => d),
    citedSources: cited.filter(u => !ours(u)).slice(0, 10).map(u => ({ url: u, title: titles[u] || '' })),
    answer: answer.slice(0, 700),
    blockTypes
  };
}

/* ── diagnosis: why did aquamesh.ai lose this question? ────────────────── */

const STOP = new Set(('a an and are at be by can do does for from has have how i in is it its of on or our should '
  + 'than that the their them they this to up use was what when where which who why will with without your').split(' '));
export const terms = (s) => [...new Set((s.toLowerCase().match(/[a-z0-9]+/g) || []).filter(w => w.length > 2 && !STOP.has(w)))];

/** The site's pages most likely to answer a question, by term overlap. */
export function matchPages(question, pages, n = 3) {
  const q = terms(question).filter(w => w !== 'aquamesh');
  if (!q.length) return [];
  return pages
    .filter(p => p.parsed && !NOT_ANSWER_PAGES.test(p.url))
    .map(p => {
      const t = p.parsed.title.toLowerCase(), d = p.parsed.description.toLowerCase(), x = p.parsed.text.toLowerCase();
      const score = q.reduce((s, w) => s + (t.includes(w) ? 3 : 0) + (d.includes(w) ? 2 : 0) + (x.includes(w) ? 1 : 0), 0) / (6 * q.length);
      return { url: p.url, score: +score.toFixed(2), page: p };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

const Diagnosis = z.object({
  verdict: z.enum(['missing_page', 'weak_page', 'crawl_problem', 'third_party'])
    .describe('missing_page: no aquamesh.ai page really answers this. weak_page: a page exists but does not answer it directly or credibly. crawl_problem: the right page exists but is broken, blocked, slow or unlisted. third_party: our page is fine; the answer leans on outside sources that do not mention AquaMesh.'),
  target_page: z.string().describe('the aquamesh.ai URL that should win this question, or empty if none exists yet'),
  why: z.string().describe('one sentence on why aquamesh.ai lost this answer'),
  change: z.string().describe('the ONE most specific change to make next, imperative, under 35 words'),
  owner: z.enum(['seo_pod', 'alex'])
    .describe('seo_pod only for blog work: writing a new post or improving an existing /blog/ post. alex for everything else: homepage, case studies, industry pages, profiles, listings, communities, press'),
  sources: z.array(z.object({
    url: z.string(),
    kind: z.enum(['reddit', 'forum', 'review_site', 'directory', 'media', 'government', 'academic', 'vendor', 'other']),
    action: z.enum(['OWN', 'CLAIM', 'EARN', 'CONTEST', 'REFERENCE']),
    note: z.string().describe('under 15 words: what to do about this source, or why nothing')
  })).describe('every cited outside source, classified')
});

const DIAGNOSE_SYSTEM = `You diagnose why aquamesh.ai lost an AI search answer, the way a careful
answer-engine-optimisation lead would. Diagnose before prescribing: decide whether the
right page is missing, exists but is weak, exists but has a crawl or index problem, or
whether the answer simply leans on outside sources. Improve an existing page before
proposing a new one. Prescribe exactly one change.

Classify each outside source the answer cited:
- OWN: a page AquaMesh controls (its site, its GitHub pages, its own posts elsewhere).
- CLAIM: a profile or listing AquaMesh could create or take over (directories, review
  sites, marketplaces, company databases).
- EARN: editorial mentions, community threads, reviews and roundups it would have to
  deserve. Reddit and forum participation must be genuine, by a named person, disclosed.
- CONTEST: outdated or wrong information about AquaMesh or its category to get corrected.
- REFERENCE: regulators, standards bodies and papers to cite, not to influence.

Rules: AquaMesh recommends and operators decide; it does not actuate equipment. BOD is
the only parameter it calibrates; everything else is spectral change analysis. Never
suggest naming competitors, customers or prospects, fake reviews, buying or trading
links, or mass-produced pages.`;

export async function diagnose(client, result, candidates, siteSummary) {
  const facts = candidates.map((c, i) => {
    const p = c.page.parsed;
    return `Candidate ${i + 1} (match ${c.score}): ${c.url}
  status ${c.page.status}; in sitemap: ${c.inSitemap ? 'yes' : 'no'}; robots: ${p.robots || 'index'}; words: ${p.words}
  title: ${p.title}
  description: ${p.description}
  technical findings on this page: ${c.findings.length ? c.findings.map(f => `${f.id} (${f.msg})`).join('; ') : 'none'}
  opening text: ${p.text.slice(0, 1200)}`;
  }).join('\n\n');
  const sources = result.citedSources.map(s => `- ${s.url}${s.title ? ` ("${s.title}")` : ''}`).join('\n') || '(none)';
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    output_config: { effort: 'medium', format: zodOutputFormat(Diagnosis) },
    system: DIAGNOSE_SYSTEM,
    messages: [{ role: 'user', content: `What AquaMesh is:\n${siteSummary}

Buyer question: "${result.query}"
aquamesh.ai in the search results: ${result.aquameshRetrievedRank ? `yes, #${result.aquameshRetrievedRank}` : 'no'}. Cited in the answer: no.

The answer engine's answer began:
${result.answer.slice(0, 600)}

Sources the answer cited:
${sources}

aquamesh.ai pages that best match the question:
${facts || '(no page on the site matches this question)'}` }]
  });
  if (msg.stop_reason === 'refusal') throw new Error('diagnosis refused');
  const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
  const d = Diagnosis.parse(JSON.parse(text));
  /* the site rule is never to name competitors, even in an internal to-do */
  for (const k of ['why', 'change']) for (const name of COMPETITORS) d[k] = d[k].replace(new RegExp(`\\b${name}\\b`, 'g'), 'a competitor');
  if (d.owner === 'seo_pod' && d.target_page && !isPost(d.target_page) && d.verdict !== 'missing_page') d.owner = 'alex';
  return { ...d, usd: +cost(msg.usage || {}).toFixed(4) };
}

function cost(usage) {
  return (usage.input_tokens || 0) * PRICE.input + (usage.output_tokens || 0) * PRICE.output
    + (usage.cache_read_input_tokens || 0) * PRICE.cacheRead
    + (usage.server_tool_use?.web_search_requests || 0) * PRICE.search;
}

/* Plain web search on purpose. The newer dynamic-filtering variant reads
   results through code execution, so its answers carry no citations, and
   "was aquamesh.ai cited" is the number this probe exists to track. If the
   API ever rejects the plain variant, fall back and mark citations n/a. */
const PLAIN = 'web_search_20250305', DYNAMIC = 'web_search_20260209';
let searchTool = PLAIN;

async function ask(client, query) {
  const content = [];
  let spent = 0;
  let messages = [{ role: 'user', content: query }];
  for (let turn = 0; turn < 3; turn++) {
    let msg;
    try {
      msg = await client.messages.create({
        model: MODEL,
        max_tokens: 8000,
        output_config: { effort: 'low' },
        system: SYSTEM,
        tools: [{ type: searchTool, name: 'web_search', max_uses: 4 }],
        messages
      });
    } catch (e) {
      if (searchTool === PLAIN && e.status === 400 && /web_search|tool/i.test(e.message)) {
        searchTool = DYNAMIC;
        turn--;
        continue;
      }
      throw e;
    }
    content.push(...msg.content);
    spent += cost(msg.usage || {});
    if (msg.stop_reason === 'refusal') return { content, spent, refused: true, tool: searchTool };
    if (msg.stop_reason !== 'pause_turn') break;
    messages = [{ role: 'user', content: query }, { role: 'assistant', content }];
  }
  return { content, spent, tool: searchTool };
}

/**
 * crawl and findings are optional; with them, every lost question also gets
 * a diagnosis and one prescribed change.
 */
export async function probeAiSearch({ log = () => {}, queries = AI_QUERIES, crawl = null, findings = [] } = {}) {
  const client = new Anthropic();
  const results = [];
  let spent = 0;
  for (const q of queries) {
    if (spent >= LIMITS.aiBudgetUsd) {
      results.push({ query: q, skipped: `run budget of $${LIMITS.aiBudgetUsd} reached` });
      continue;
    }
    try {
      const r = await ask(client, q);
      spent += r.spent;
      results.push({ ...summarize(q, r.content), refused: Boolean(r.refused), citable: r.tool === PLAIN, tool: r.tool, usd: +r.spent.toFixed(4) });
      const last = results.at(-1);
      log(`  "${q.slice(0, 60)}": retrieved ${last.aquameshRetrievedRank ? `#${last.aquameshRetrievedRank}` : 'no'}, cited ${last.citable ? (last.aquameshCited ? 'yes' : 'no') : 'n/a'} (${last.citedCount} citations)`);
    } catch (e) {
      results.push({ query: q, error: `${e.status || ''} ${e.message}`.trim() });
      log(`  "${q.slice(0, 60)}": error ${e.message}`);
    }
  }

  if (crawl) {
    const listed = new Set(crawl.sitemap.map(e => normalizeUrl(e.loc)));
    const pages = [...crawl.pages.values()];
    const siteSummary = (crawl.llms || '').split('\n## ')[0].slice(0, 1500);
    for (const r of results.filter(r => !r.error && !r.skipped && r.citable && !r.aquameshCited)) {
      if (spent >= LIMITS.aiBudgetUsd) { r.diagnosis = { skipped: 'run budget reached' }; continue; }
      const candidates = matchPages(r.query, pages).map(c => ({
        ...c, inSitemap: listed.has(c.url), findings: findings.filter(f => f.url === c.url && f.sev !== 'info')
      }));
      try {
        r.diagnosis = await diagnose(client, r, candidates, siteSummary);
        spent += r.diagnosis.usd;
        log(`  diagnosed "${r.query.slice(0, 50)}": ${r.diagnosis.verdict}`);
      } catch (e) {
        r.diagnosis = { error: e.message.slice(0, 200) };
      }
    }
  }
  return { engine: 'Claude web search', results, usd: +spent.toFixed(3) };
}
