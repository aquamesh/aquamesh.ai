/**
 * Page parsing and SEO rules. Pure: no network, no filesystem. The agent
 * fetches, this decides, and every rule is unit-tested against fixtures.
 *
 * A finding is { sev: 'error' | 'warn' | 'info', id, url, msg }. Its key
 * (id + url) is what run-to-run diffs compare, so msg can carry counts.
 */

import { SITE, EXCLUDE, HOMEPAGE, FIGURES, COMPETITORS } from './config.mjs';

/* ── parsing ──────────────────────────────────────────────────────────── */

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘',
  ldquo: '“', rdquo: '”', mdash: '—', ndash: '–', middot: '·', hellip: '…', copy: '©'
};

export function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

export function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
    out[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? '');
  }
  return out;
}

const plainText = (html) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

/* /blog/index.html and /blog/ are one page on GitHub Pages; key them once. */
export function normalizeUrl(u) {
  const url = new URL(u);
  url.hash = '';
  if (url.pathname.endsWith('/index.html')) url.pathname = url.pathname.slice(0, -'index.html'.length);
  return url.toString();
}

export function resolve(href, base) {
  if (!href || /^(mailto:|tel:|javascript:|data:|#)/i.test(href)) return null;
  try { return new URL(href, base).toString(); } catch { return null; }
}

function ldTypes(node, out = []) {
  if (Array.isArray(node)) node.forEach(n => ldTypes(n, out));
  else if (node && typeof node === 'object') {
    const t = node['@type'];
    if (t) out.push(...(Array.isArray(t) ? t : [t]));
    if (node['@graph']) ldTypes(node['@graph'], out);
  }
  return out;
}

function ldNodes(node, out = []) {
  if (Array.isArray(node)) node.forEach(n => ldNodes(n, out));
  else if (node && typeof node === 'object') {
    if (node['@type']) out.push(node);
    if (node['@graph']) ldNodes(node['@graph'], out);
  }
  return out;
}

export function parsePage(url, html) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const jsonld = scripts.filter(m => /application\/ld\+json/i.test(m[1])).map(m => {
    try {
      const data = JSON.parse(m[2]);
      return { ok: true, types: ldTypes(data), nodes: ldNodes(data) };
    } catch (e) {
      return { ok: false, error: e.message, types: [], nodes: [] };
    }
  });
  const scriptSrcs = scripts.map(m => attrs(m[1]).src).filter(Boolean);

  const bare = html.replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
  const headHtml = (bare.match(/<head\b[\s\S]*?<\/head>/i) || [''])[0];
  const bodyHtml = (bare.match(/<body\b[\s\S]*<\/body>/i) || [bare])[0];

  const metas = [...headHtml.matchAll(/<meta\b[^>]*>/gi)].map(m => attrs(m[0]));
  const meta = (k) => metas.find(a => (a.name || a.property || '').toLowerCase() === k)?.content;
  const headLinks = [...headHtml.matchAll(/<link\b[^>]*>/gi)].map(m => attrs(m[0]));
  const titles = [...headHtml.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map(m => plainText(m[1]));
  const htmlTag = attrs((html.match(/<html\b[^>]*>/i) || [''])[0]);

  const anchors = [...bodyHtml.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map(m => {
    const a = attrs(m[1]);
    return { href: a.href, abs: resolve(a.href, url), rel: a.rel || '', text: plainText(m[2]) };
  }).filter(a => a.abs && /^https?:/.test(a.abs));

  const images = [...bodyHtml.matchAll(/<img\b[^>]*>/gi)].map(m => {
    const a = attrs(m[0]);
    return { src: a.src, abs: resolve(a.src, url), hasAlt: 'alt' in a };
  });

  const assets = [
    ...images.map(i => i.abs),
    ...headLinks.filter(l => /stylesheet|icon|preload/i.test(l.rel || '')).map(l => resolve(l.href, url)),
    ...scriptSrcs.map(s => resolve(s, url))
  ].filter(u => u && /^https?:/.test(u));

  const text = plainText(bodyHtml);
  return {
    url,
    titles,
    title: titles[0] || '',
    description: meta('description') || '',
    robots: (meta('robots') || '').toLowerCase(),
    canonical: headLinks.find(l => (l.rel || '').toLowerCase() === 'canonical')?.href || '',
    lang: htmlTag.lang || '',
    viewport: Boolean(meta('viewport')),
    og: { title: meta('og:title'), description: meta('og:description'), image: meta('og:image'), url: meta('og:url') },
    h1: [...bodyHtml.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => plainText(m[1])),
    jsonld,
    anchors,
    images,
    assets: [...new Set(assets)],
    text,
    words: text ? text.split(/\s+/).length : 0,
    bytes: Buffer.byteLength(html)
  };
}

/* ── helpers ──────────────────────────────────────────────────────────── */

export const isInternal = (u) => { try { return new URL(u).host === new URL(SITE).host; } catch { return false; } };
export const isExcluded = (u) => EXCLUDE.some(re => re.test(new URL(u).pathname));
export const isPost = (u) => /^\/blog\/(?!index\.html)[a-z0-9-]+\.html$/.test(new URL(u).pathname);
const pathOf = (u) => new URL(u).pathname;
const f = (sev, id, url, msg) => ({ sev, id, url, msg });

/* ── page rules ───────────────────────────────────────────────────────── */

/**
 * Rules that need only the page itself. Also used offline by the auto-fix
 * gate to compare a rebuilt file against the committed one.
 */
export function pageFindings(p, { inSitemap = true } = {}) {
  const out = [];
  const u = p.url;
  const noindex = /noindex/.test(p.robots);

  if (!p.title) out.push(f('error', 'title-missing', u, 'no <title>'));
  else {
    if (p.titles.length > 1) out.push(f('warn', 'title-multiple', u, `${p.titles.length} <title> tags`));
    if (p.title.length > 65) out.push(f('warn', 'title-length', u, `title is ${p.title.length} chars; Google truncates near 60: "${p.title}"`));
    if (p.title.length < 20) out.push(f('warn', 'title-length', u, `title is only ${p.title.length} chars: "${p.title}"`));
  }

  if (!p.description) out.push(f('error', 'desc-missing', u, 'no meta description'));
  else if (p.description.length > 170 || p.description.length < 70) {
    out.push(f('warn', 'desc-length', u, `meta description is ${p.description.length} chars (aim for 70 to 160)`));
  }

  if (!p.canonical) out.push(f('warn', 'canonical-missing', u, 'no rel=canonical'));
  else if (!/^https:\/\//.test(p.canonical)) out.push(f('error', 'canonical-relative', u, `canonical is not absolute https: ${p.canonical}`));
  else if (inSitemap && normalizeUrl(p.canonical) !== normalizeUrl(u)) {
    out.push(f('warn', 'canonical-mismatch', u, `sitemap lists this URL but its canonical points to ${p.canonical}`));
  }

  if (noindex && inSitemap) out.push(f('error', 'noindex-in-sitemap', u, `robots meta "${p.robots}" on a page the sitemap asks engines to index`));
  if (!p.viewport) out.push(f('error', 'viewport-missing', u, 'no viewport meta; fails mobile-friendly'));
  if (!p.lang) out.push(f('warn', 'lang-missing', u, 'no <html lang>'));
  if (p.h1.length !== 1) out.push(f('warn', 'h1-count', u, `${p.h1.length} <h1> elements (want exactly one)`));

  if (!p.jsonld.length) out.push(f('warn', 'jsonld-missing', u, 'no JSON-LD structured data'));
  for (const j of p.jsonld.filter(j => !j.ok)) out.push(f('error', 'jsonld-invalid', u, `JSON-LD does not parse: ${j.error}`));
  for (const node of p.jsonld.flatMap(j => j.nodes)) {
    if (['BlogPosting', 'Article', 'NewsArticle'].includes(node['@type'])) {
      const missing = ['headline', 'datePublished', 'dateModified', 'image', 'author', 'publisher'].filter(k => !node[k]);
      if (missing.length) out.push(f('warn', 'jsonld-article-fields', u, `${node['@type']} missing ${missing.join(', ')}`));
    }
  }

  const ogMissing = ['title', 'description', 'image'].filter(k => !p.og[k]);
  if (ogMissing.length) out.push(f('warn', 'og-missing', u, `missing og:${ogMissing.join(', og:')}; link previews degrade`));

  const noAlt = p.images.filter(i => !i.hasAlt).length;
  if (noAlt) out.push(f('warn', 'img-alt-missing', u, `${noAlt} <img> without an alt attribute`));

  const insecure = p.assets.filter(a => a.startsWith('http://'));
  if (insecure.length) out.push(f('warn', 'mixed-content', u, `http:// resources on an https page: ${insecure.slice(0, 3).join(', ')}`));

  if (p.bytes > 600 * 1024) out.push(f('warn', 'html-weight', u, `HTML is ${Math.round(p.bytes / 1024)} KB`));
  if (!noindex && p.words < 200) out.push(f('warn', 'thin-content', u, `only ${p.words} words of text`));

  for (const name of COMPETITORS) {
    if (new RegExp(`\\b${name}\\b`).test(p.text)) out.push(f('warn', 'competitor-mention', u, `names ${name}; site rule is to never name competitors`));
  }
  for (const fig of FIGURES.forbidden) {
    if (p.text.includes(fig)) out.push(f('error', 'figure-superseded', u, `contains ${fig}, a superseded v1 audit figure`));
  }
  const required = FIGURES.required[pathOf(u)] || [];
  const lost = required.filter(fig => !p.text.includes(fig));
  if (lost.length) out.push(f('error', 'figure-missing', u, `no longer shows ${lost.join(', ')} (v2 audit figures)`));

  if (isPost(u)) {
    const sources = new Set(p.anchors.filter(a => !isInternal(a.abs)).map(a => new URL(a.abs).host)).size;
    if (sources < 2) out.push(f('info', 'geo-few-sources', u, `cites ${sources} outside source(s); AI answer engines favour pages that cite primary sources`));
  }
  return out;
}

export function homepageFindings(url, html) {
  const out = [];
  for (const c of HOMEPAGE.mustContain) if (!c.re.test(html)) out.push(f('error', 'homepage-regression', url, `homepage lost: ${c.what}`));
  for (const c of HOMEPAGE.mustNotContain) if (c.re.test(html)) out.push(f('error', 'homepage-regression', url, `homepage has: ${c.what}`));
  return out;
}

/* ── site rules ───────────────────────────────────────────────────────── */

export function parseSitemap(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m => ({
    loc: (m[1].match(/<loc>([^<]+)<\/loc>/) || [])[1]?.trim(),
    lastmod: (m[1].match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1]?.trim() || ''
  })).filter(e => e.loc);
}

export function parseRobots(txt) {
  const groups = [];
  let cur = null;
  for (const raw of txt.split('\n')) {
    const line = raw.replace(/#.*/, '').trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const [k, v] = [m[1].toLowerCase(), m[2].trim()];
    if (k === 'user-agent') {
      if (!cur || cur.rules.length) groups.push(cur = { agents: [], rules: [] });
      cur.agents.push(v.toLowerCase());
    } else if ((k === 'allow' || k === 'disallow') && cur) cur.rules.push({ k, v });
  }
  return { groups, sitemaps: [...txt.matchAll(/^\s*sitemap\s*:\s*(\S+)/gim)].map(m => m[1]) };
}

/**
 * crawl: {
 *   pages: Map<normUrl, { url, status, html?, parsed? }>,
 *   statuses: Map<url, number>      every internal URL and asset fetched
 *   external: Map<url, number> | null   null when externals were not checked
 *   sitemap: [{loc,lastmod}], llms: string, robots: string, feed: string, today
 * }
 */
export function siteFindings(crawl) {
  const out = [];
  const { pages, statuses, external, sitemap, llms, robots, feed, today } = crawl;
  const inSitemap = new Set(sitemap.map(e => normalizeUrl(e.loc)));
  const status = (u) => statuses.get(u) ?? statuses.get(normalizeUrl(u)) ?? pages.get(normalizeUrl(u))?.status;

  /* sitemap */
  if (!sitemap.length) out.push(f('error', 'sitemap-empty', `${SITE}/sitemap.xml`, 'sitemap has no URLs'));
  for (const e of sitemap) {
    const s = status(e.loc);
    if (s !== 200) out.push(f('error', 'sitemap-url-status', e.loc, `sitemap URL returns ${s ?? 'nothing'}`));
    if (e.lastmod && e.lastmod > today) out.push(f('error', 'sitemap-lastmod-future', e.loc, `lastmod ${e.lastmod} is in the future`));
  }
  const byDate = {};
  for (const e of sitemap) byDate[e.lastmod] = (byDate[e.lastmod] || 0) + 1;
  const [topDate, topCount] = Object.entries(byDate).sort((a, b) => b[1] - a[1])[0] || ['', 0];
  if (sitemap.length >= 10 && topCount / sitemap.length >= 0.6) {
    out.push(f('warn', 'sitemap-lastmod-uniform', `${SITE}/sitemap.xml`,
      `${topCount} of ${sitemap.length} URLs share lastmod ${topDate}; Google ignores lastmod it cannot trust`));
  }

  /* robots */
  const r = parseRobots(robots || '');
  const star = r.groups.find(g => g.agents.includes('*'));
  if (star?.rules.some(x => x.k === 'disallow' && x.v === '/')) out.push(f('error', 'robots-blocks-all', `${SITE}/robots.txt`, 'robots.txt disallows / for every crawler'));
  for (const bot of ['googlebot', 'bingbot']) {
    const g = r.groups.find(g => g.agents.includes(bot));
    if (g?.rules.some(x => x.k === 'disallow' && x.v === '/')) out.push(f('error', 'robots-blocks-all', `${SITE}/robots.txt`, `robots.txt disallows / for ${bot}`));
  }
  if (!r.sitemaps.length) out.push(f('warn', 'robots-no-sitemap', `${SITE}/robots.txt`, 'robots.txt has no Sitemap: line'));

  /* pages */
  const titles = new Map(), descs = new Map(), linkedFrom = new Map();
  for (const pg of pages.values()) {
    if (!pg.parsed || isExcluded(pg.url)) continue;
    const p = pg.parsed;
    const listed = inSitemap.has(normalizeUrl(pg.url));
    out.push(...pageFindings(p, { inSitemap: listed }));
    if (new URL(pg.url).pathname === '/') out.push(...homepageFindings(pg.url, pg.html));

    if (!/noindex/.test(p.robots)) {
      if (p.title) titles.set(p.title, [...(titles.get(p.title) || []), pg.url]);
      if (p.description) descs.set(p.description, [...(descs.get(p.description) || []), pg.url]);
      if (!listed) out.push(f('warn', 'not-in-sitemap', pg.url, 'indexable page reachable by links but missing from sitemap.xml'));
    }
    if (p.canonical && /^https:/.test(p.canonical) && isInternal(p.canonical)) {
      const s = status(p.canonical);
      if (s !== undefined && s !== 200) out.push(f('error', 'canonical-broken', pg.url, `canonical ${p.canonical} returns ${s}`));
    }
    if (p.og.image) {
      const s = isInternal(p.og.image) ? status(p.og.image) : undefined;
      if (s !== undefined && s !== 200) out.push(f('warn', 'og-image-broken', pg.url, `og:image ${p.og.image} returns ${s}`));
    }

    const broken = new Map();
    for (const a of p.anchors) {
      if (isInternal(a.abs)) {
        const key = normalizeUrl(a.abs);
        if (key !== normalizeUrl(pg.url)) linkedFrom.set(key, (linkedFrom.get(key) || 0) + 1);
        const s = status(a.abs);
        if (s !== undefined && s !== 200) broken.set(a.abs, s);
      } else if (external) {
        const s = external.get(a.abs);
        if (s === 404 || s === 410 || s === 0) out.push(f('warn', 'external-link-broken', pg.url, `links to ${a.abs} (${s === 0 ? 'unreachable' : s})`));
      }
    }
    for (const [href, s] of broken) out.push(f('error', 'link-broken', pg.url, `links to ${href} which returns ${s}`));
    for (const asset of p.assets.filter(isInternal)) {
      const s = status(asset);
      if (s !== undefined && s !== 200) out.push(f('error', 'asset-broken', pg.url, `${asset} returns ${s}`));
    }
  }
  for (const [t, urls] of titles) if (urls.length > 1) out.push(f('warn', 'title-duplicate', urls[0], `${urls.length} pages share the title "${t}": ${urls.slice(1).join(', ')}`));
  for (const [d, urls] of descs) if (urls.length > 1) out.push(f('warn', 'desc-duplicate', urls[0], `${urls.length} pages share one meta description: ${urls.slice(1).join(', ')}`));

  for (const e of sitemap) {
    const key = normalizeUrl(e.loc);
    if (new URL(key).pathname !== '/' && !linkedFrom.get(key)) {
      out.push(f('warn', 'sitemap-unlinked', e.loc, 'in the sitemap but no page on the site links to it'));
    }
  }

  /* llms.txt and feed: agents and readers find posts through these */
  const posts = sitemap.map(e => e.loc).filter(isPost);
  const llmsUrls = [...(llms || '').matchAll(/\]\((https:\/\/[^)\s]+)\)/g)].map(m => m[1]);
  for (const u of posts) if (!llmsUrls.includes(u)) out.push(f('warn', 'llms-missing-post', u, 'post is in the sitemap but not in llms.txt'));
  for (const u of llmsUrls.filter(isInternal)) {
    const s = status(u);
    if (s !== undefined && s !== 200) out.push(f('error', 'llms-broken', u, `llms.txt links here and it returns ${s}`));
  }
  for (const u of posts) if (feed && !feed.includes(u)) out.push(f('warn', 'feed-missing-post', u, 'post is in the sitemap but not in feed.xml'));

  /* one site-level note rather than one per post */
  const orgOnly = [...pages.values()].filter(pg => pg.parsed && isPost(pg.url)).filter(pg =>
    pg.parsed.jsonld.flatMap(j => j.nodes).some(n => n['@type'] === 'BlogPosting' && n.author?.['@type'] === 'Organization'));
  if (orgOnly.length) {
    out.push(f('info', 'geo-org-author', `${SITE}/blog/`,
      `${orgOnly.length} posts credit the Organization as author. A named, real author with a bio page is a trust signal for Google and AI answer engines (needs Alex's OK to name someone)`));
  }
  return dedupe(out);
}

function dedupe(findings) {
  const seen = new Set();
  return findings.filter(x => {
    const k = `${x.id} ${x.url} ${x.msg}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/* ── run-to-run comparison ────────────────────────────────────────────── */

export const findingKey = (x) => `${x.id} ${x.url}`;

export function diffFindings(prev = [], curr = []) {
  const p = new Set(prev.map(findingKey)), c = new Set(curr.map(findingKey));
  return {
    added: curr.filter(x => !p.has(findingKey(x))),
    resolved: prev.filter(x => !c.has(findingKey(x)))
  };
}
