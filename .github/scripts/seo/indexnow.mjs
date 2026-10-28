/**
 * IndexNow tells Bing (and Yandex, Seznam, Naver) the moment a URL changes,
 * instead of waiting for a recrawl. Bing's index also feeds Copilot and
 * ChatGPT search, so for a young site this is the cheapest AI-search lever
 * there is. Google does not use IndexNow; it reads the sitemap.
 *
 * Only URLs whose content actually changed since the last run are sent,
 * judged by a hash of title + description + body text.
 */

import { createHash } from 'node:crypto';
import { SITE, HOST, INDEXNOW_KEY, LIMITS } from './config.mjs';
import { fetchUrl } from './crawl.mjs';

export const contentHash = (p) => createHash('sha256').update(`${p.title}\n${p.description}\n${p.text}`).digest('hex').slice(0, 16);

export function changedUrls(pages, sitemap, previous = {}) {
  const listed = new Set(sitemap.map(e => e.loc));
  const hashes = {}, changed = [];
  for (const pg of pages.values()) {
    if (!pg.parsed || /noindex/.test(pg.parsed.robots)) continue;
    const loc = [...listed].find(l => l === pg.url || l === pg.url.replace(/\/$/, '/index.html'));
    if (!loc) continue;
    hashes[loc] = contentHash(pg.parsed);
    if (previous[loc] !== hashes[loc]) changed.push(loc);
  }
  return { hashes, changed };
}

export async function submitIndexNow(urls) {
  const keyLocation = `${SITE}/${INDEXNOW_KEY}.txt`;
  const key = await fetchUrl(keyLocation);
  if (key.status !== 200 || key.body.trim() !== INDEXNOW_KEY) {
    return { ok: false, status: key.status, note: `key file ${keyLocation} is not live yet` };
  }
  const urlList = urls.slice(0, LIMITS.maxIndexNowUrls);
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation, urlList }),
    signal: AbortSignal.timeout(30000)
  }).catch(e => ({ status: 0, text: async () => e.message }));
  /* 200 = accepted, 202 = accepted while the key is being validated */
  return { ok: res.status === 200 || res.status === 202, status: res.status, sent: urlList.length, note: res.ok ? '' : (await res.text()).slice(0, 200) };
}
