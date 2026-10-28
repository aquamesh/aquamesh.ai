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
import { MODEL } from '../lib/models.mjs';
import { HOST, AI_QUERIES, LIMITS } from './config.mjs';

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
  const retrieved = [], cited = [];
  const link = (n) => n.url || n.source;
  const walk = (node, inCitations = false) => {
    if (Array.isArray(node)) return node.forEach(n => walk(n, inCitations));
    if (!node || typeof node !== 'object') return;
    /* plain web search gives web_search_result{url}; dynamic filtering can
       hand back search_result{source}. Citations mirror the same split. */
    if (/^(web_)?search_result$/.test(node.type) && link(node)) retrieved.push(link(node));
    if ((/search_result_location$/.test(node.type) || inCitations) && /^https?:/.test(link(node) || '')) cited.push(link(node));
    for (const [k, v] of Object.entries(node)) if (v && typeof v === 'object') walk(v, k === 'citations');
  };
  walk(content);
  return { retrieved: [...new Set(retrieved)], cited: [...new Set(cited)] };
}

/* The answer is the text after the last tool round; earlier text is the
   model talking to itself between searches. */
export function finalAnswer(content) {
  const blocks = Array.isArray(content) ? content : [];
  const lastTool = blocks.findLastIndex(b => b.type !== 'text' && b.type !== 'thinking');
  return blocks.slice(lastTool + 1).filter(b => b.type === 'text').map(b => b.text).join('').trim();
}

export function summarize(query, content) {
  const { retrieved, cited } = collectSources(content);
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
    answer: answer.slice(0, 700),
    blockTypes
  };
}

function cost(usage) {
  return (usage.input_tokens || 0) * PRICE.input + (usage.output_tokens || 0) * PRICE.output
    + (usage.cache_read_input_tokens || 0) * PRICE.cacheRead
    + (usage.server_tool_use?.web_search_requests || 0) * PRICE.search;
}

async function ask(client, query) {
  const content = [];
  let spent = 0;
  let messages = [{ role: 'user', content: query }];
  for (let turn = 0; turn < 3; turn++) {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      output_config: { effort: 'low' },
      system: SYSTEM,
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 4 }],
      messages
    });
    content.push(...msg.content);
    spent += cost(msg.usage || {});
    if (msg.stop_reason === 'refusal') return { content, spent, refused: true };
    if (msg.stop_reason !== 'pause_turn') break;
    messages = [{ role: 'user', content: query }, { role: 'assistant', content }];
  }
  return { content, spent };
}

export async function probeAiSearch({ log = () => {}, queries = AI_QUERIES } = {}) {
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
      results.push({ ...summarize(q, r.content), refused: Boolean(r.refused), usd: +r.spent.toFixed(4) });
      const last = results.at(-1);
      log(`  "${q.slice(0, 60)}": retrieved ${last.aquameshRetrievedRank ? `#${last.aquameshRetrievedRank}` : 'no'}, cited ${last.aquameshCited ? 'yes' : 'no'}`);
    } catch (e) {
      results.push({ query: q, error: `${e.status || ''} ${e.message}`.trim() });
      log(`  "${q.slice(0, 60)}": error ${e.message}`);
    }
  }
  return { engine: 'Claude web search', results, usd: +spent.toFixed(3) };
}
