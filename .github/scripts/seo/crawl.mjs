/**
 * Fetches the live site the way a crawler sees it: sitemap, llms.txt and the
 * homepage as seeds, then every internal page they link to. Internal assets
 * get a status check; external links only on weekly runs, to stay polite.
 */

import { SITE, USER_AGENT, LIMITS } from './config.mjs';
import { parsePage, parseSitemap, normalizeUrl, isInternal, isExcluded } from './checks.mjs';

export async function pool(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }));
  return out;
}

/* status 0 = network failure or timeout. Bodies are read only for text. */
export async function fetchUrl(url, { method = 'GET', timeoutMs = LIMITS.timeoutMs } = {}) {
  try {
    const res = await fetch(url, {
      method, redirect: 'follow',
      headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml,*/*;q=0.8' },
      signal: AbortSignal.timeout(timeoutMs)
    });
    const type = res.headers.get('content-type') || '';
    let body = '';
    if (method === 'GET' && /text|xml|json/.test(type)) body = await res.text();
    else await res.body?.cancel();
    return { status: res.status, finalUrl: res.url, type, body };
  } catch (e) {
    return { status: 0, error: e.cause?.code || e.name || e.message, type: '', body: '' };
  }
}

/* HEAD first; plenty of servers refuse or mishandle it, so retry with GET. */
async function probeStatus(url) {
  const h = await fetchUrl(url, { method: 'HEAD', timeoutMs: 15000 });
  if (h.status && h.status < 400) return h.status;
  const g = await fetchUrl(url, { method: 'GET', timeoutMs: 15000 });
  return g.status;
}

const isPageLike = (u) => /(\/|\.html?|\/[^./]+)$/.test(new URL(u).pathname);

export async function crawlSite({ externals = false, log = () => {} } = {}) {
  const fixed = ['/sitemap.xml', '/llms.txt', '/robots.txt', '/feed.xml'];
  const [sm, ll, rb, fd] = await Promise.all(fixed.map(p => fetchUrl(SITE + p)));
  const statuses = new Map(fixed.map((p, i) => [SITE + p, [sm, ll, rb, fd][i].status]));
  const sitemap = sm.status === 200 ? parseSitemap(sm.body) : [];
  const llmsUrls = [...ll.body.matchAll(/\]\((https:\/\/[^)\s]+)\)/g)].map(m => m[1]).filter(isInternal);

  const pages = new Map();
  const seen = new Set();
  const queue = [];
  const enqueue = (u) => {
    const key = normalizeUrl(u);
    if (seen.has(key) || isExcluded(key) || !isPageLike(key)) return;
    seen.add(key);
    queue.push(key);
  };
  [SITE + '/', ...sitemap.map(e => e.loc), ...llmsUrls].forEach(enqueue);

  while (queue.length && pages.size < LIMITS.maxPages) {
    const batch = queue.splice(0, LIMITS.maxPages - pages.size);
    await pool(batch, LIMITS.concurrency, async (key) => {
      const r = await fetchUrl(key);
      statuses.set(key, r.status);
      const pg = { url: key, status: r.status, error: r.error };
      if (r.status === 200 && /text\/html/.test(r.type)) {
        pg.html = r.body;
        pg.parsed = parsePage(key, r.body);
        for (const a of pg.parsed.anchors) if (isInternal(a.abs)) enqueue(a.abs);
      }
      pages.set(key, pg);
    });
  }
  log(`  crawled ${pages.size} pages`);

  /* internal assets and non-page links (images, css, js, .md, .txt, pdf) */
  const assets = new Set();
  for (const pg of pages.values()) {
    if (!pg.parsed) continue;
    pg.parsed.assets.filter(isInternal).forEach(a => assets.add(a));
    pg.parsed.anchors.map(a => a.abs).filter(u => isInternal(u) && !isPageLike(u) && !isExcluded(u)).forEach(a => assets.add(a));
    if (pg.parsed.og.image && isInternal(pg.parsed.og.image)) assets.add(pg.parsed.og.image);
  }
  const assetList = [...assets].filter(a => !statuses.has(a));
  const assetStatus = await pool(assetList, LIMITS.concurrency, probeStatus);
  assetList.forEach((a, i) => statuses.set(a, assetStatus[i]));
  log(`  checked ${assetList.length} internal assets`);

  let external = null;
  if (externals) {
    const ext = new Set();
    for (const pg of pages.values()) pg.parsed?.anchors.filter(a => !isInternal(a.abs)).forEach(a => ext.add(a.abs));
    const list = [...ext].slice(0, LIMITS.maxExternal);
    const res = await pool(list, 4, probeStatus);
    external = new Map(list.map((u, i) => [u, res[i]]));
    log(`  checked ${list.length} external links${ext.size > list.length ? ` (of ${ext.size})` : ''}`);
  }

  return {
    pages, statuses, external, sitemap,
    llms: ll.body, robots: rb.body, feed: fd.body,
    today: new Date().toISOString().slice(0, 10)
  };
}
