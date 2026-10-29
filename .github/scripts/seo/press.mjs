/**
 * Trade-press articles AquaMesh people wrote (press.json at the repo root).
 * Weekly: is each still up, does it link back to aquamesh.ai, does the
 * company page list it, and did any AI answer cite it.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { SITE, HOST } from './config.mjs';
import { fetchUrl } from './crawl.mjs';
import { normalizeUrl } from './checks.mjs';

export function loadPress(root) {
  const f = join(root, 'press.json');
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : [];
}

const LINK_BACK = new RegExp(`href=["']https?://(www\\.)?${HOST.replace('.', '\\.')}(?=[/"'?#:])`, 'i');
export const linksBack = (html) => LINK_BACK.test(html || '');

/* status 401/403/429 means the publisher blocks robots, not that the page is gone */
const BLOCKED = new Set([401, 403, 429]);

export function pressFindings(results, companyHtml) {
  const out = [];
  for (const r of results) {
    if (r.status !== 200 && !BLOCKED.has(r.status)) out.push({ sev: 'warn', id: 'press-down', url: r.url, msg: `${r.publication} article returned HTTP ${r.status || r.error}` });
    if (r.status === 200 && !r.linksBack) out.push({ sev: 'info', id: 'press-no-link', url: r.url, msg: `${r.publication} article does not link to aquamesh.ai; ask the editor to link it in the author bio` });
    if (companyHtml && !companyHtml.includes(r.url)) out.push({ sev: 'warn', id: 'press-not-listed', url: `${SITE}/company.html`, msg: `company page does not list the ${r.publication} article` });
  }
  return out;
}

export async function checkPress(root, crawl) {
  const press = loadPress(root);
  const results = [];
  for (const x of press) {
    const r = await fetchUrl(x.url);
    results.push({ ...x, status: r.status, error: r.error, linksBack: r.status === 200 ? linksBack(r.body) : null });
  }
  const company = crawl.pages.get(normalizeUrl(`${SITE}/company.html`))?.html || '';
  return { results, findings: pressFindings(results, company) };
}

/* Which tracked buyer questions an AI answer answered by citing one of our articles. */
export function pressCitations(ai, press) {
  const urls = new Set(press.map(x => normalizeUrl(x.url)));
  const hits = [];
  for (const r of ai?.results || []) {
    for (const s of r.citedSources || []) if (urls.has(normalizeUrl(s.url))) hits.push({ query: r.query, url: s.url });
  }
  return hits;
}
