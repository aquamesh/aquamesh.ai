#!/usr/bin/env node
/* Builds the blog and every machine-readable surface the site exposes.
   Run from the repo root:  node scripts/build-blog.mjs
   No dependencies, no install step. */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, plain, inline } from './md.mjs';
import { DIAGRAMS } from './post-diagrams.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://aquamesh.ai';
const BRAND = 'AquaMesh';
const TAGLINE = 'The Autopilot For Industrial Water';
const CSS_V = 'styles.css?v=28';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const write = (p, s) => { mkdirSync(dirname(join(ROOT, p)), { recursive: true }); writeFileSync(join(ROOT, p), s); };

/* ── reuse the site's own sprite so the blog is visually native ───────── */
const src = read('company.html');
const SPRITE = src.slice(src.indexOf('<svg class="sprite"'), src.indexOf('</svg>\n\n  <header') + 6);

/* ── frontmatter ─────────────────────────────────────────────────────── */
function parse(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) throw new Error('post is missing frontmatter');
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim().replace(/^["']|["']$/g, '');
    meta[kv[1]] = kv[1] === 'tags' ? v.split(',').map(x => x.trim()).filter(Boolean) : v;
  }
  return { meta, body: raw.slice(m[0].length).trim() };
}

const fmtDate = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const readingTime = (text) => Math.max(1, Math.round(text.split(/\s+/).length / 220));

/* ── load posts, newest first ────────────────────────────────────────── */
const dir = join(ROOT, 'blog/posts');
const posts = readdirSync(dir).filter(f => f.endsWith('.md')).map(f => {
  const raw = readFileSync(join(dir, f), 'utf8');
  const { meta, body } = parse(raw);
  const slug = meta.slug || f.replace(/\.md$/, '');
  const text = plain(body);
  return {
    ...meta, slug, body, raw, text,
    tags: meta.tags || [],
    url: `${SITE}/blog/${slug}.html`,
    words: text.split(/\s+/).length,
    minutes: readingTime(text),
    rendered: (() => {
      const r = render(body);
      /* {{diagram:name}} becomes an inline SVG figure */
      r.html = r.html.replace(/<p>\{\{diagram:([a-z-]+)\}\}(?:\s*—\s*([^<]*))?<\/p>/g, (m, name, cap) => {
        const svg = DIAGRAMS[name];
        if (!svg) { console.warn(`  ! unknown diagram: ${name}`); return ''; }
        return `<figure class="post-fig post-dia">${svg}` + (cap ? `<figcaption>${inline(cap.trim())}</figcaption>` : '') + `</figure>`;
      });
      return r;
    })()
  };
}).sort((a, b) => (a.date < b.date ? 1 : -1));

console.log(`${posts.length} posts`);

/* ── other agents publish HTML into /insights; discover it rather than
      overwrite it, so their output inherits the sitemap and llms.txt ───── */
function discoverInsights() {
  const d = join(ROOT, 'insights');
  if (!existsSync(d)) return [];
  return readdirSync(d).filter(f => f.endsWith('.html') && f !== 'index.html').map(f => {
    const html = readFileSync(join(d, f), 'utf8');
    const pick = (re) => { const m = html.match(re); return m ? m[1].trim() : ''; };
    const title = pick(/<title>([^<]*)<\/title>/).replace(/\s*\|\s*AquaMesh\s*$/, '');
    const desc = pick(/<meta name="description" content="([^"]*)"/);
    let date = '';
    const ldm = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (ldm) { try { const j = JSON.parse(ldm[1]); date = j.dateModified || j.datePublished || ''; } catch {} }
    const text = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ')
                     .replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
    return { file: f, slug: f.replace(/\.html$/, ''), title, desc, date,
             url: `${SITE}/insights/${f}`, text };
  }).sort((a, b) => (a.date < b.date ? 1 : -1));
}
const insights = discoverInsights();
if (insights.length) console.log(`${insights.length} insights pages discovered`);


/* ── shared chrome ───────────────────────────────────────────────────── */
const nav = (pre) => `  <header class="nav">
    <div class="wrap nav-inner">
      <a class="brand" href="${pre}index.html" aria-label="${BRAND} home">
        <svg class="wordmark" viewBox="0 -4 986 132" role="img" aria-label="${BRAND}"><use href="#wordmark" /></svg>
      </a>
      <nav class="nav-links" aria-label="Primary">
        <a href="${pre}index.html#platform">Platform</a>
        <a href="${pre}index.html#how">How it works</a>
        <a href="${pre}case-studies/index.html">Case studies</a>
        <a href="${pre}blog/index.html">Blog</a>
        <a href="${pre}company.html">Company</a>
      </nav>
      <a class="btn btn-sm" href="mailto:info@aquamesh.ai?subject=Demo%20request">Book a demo</a>
    </div>
  </header>`;

const footer = (pre) => `  <footer class="footer">
    <div class="wrap footer-inner">
      <div>
        <svg class="wordmark" viewBox="0 -4 986 132" role="img" aria-label="${BRAND}"><use href="#wordmark" /></svg>
        <p class="footer-tag">${TAGLINE}</p>
      </div>
      <div>
        <p class="footer-links"><a href="${pre}industries/food-beverage.html">Food &amp; Beverage</a> &middot; <a href="${pre}industries/industrial-water.html">Industrial Water</a> &middot; <a href="${pre}industries/manufacturing.html">Manufacturing</a> &middot; <a href="${pre}industries/municipal.html">Municipal</a> &middot; <a href="${pre}industries/pharma-biotech.html">Pharma &amp; Biotech</a> &middot; <a href="${pre}industries/data-centers.html">Data Centers</a><br /><a href="${pre}privacy.html">Privacy</a> &middot; <a href="${pre}cookies.html">Cookies</a> &middot; <a href="${pre}terms.html">Terms</a> &middot; <a href="${pre}do-not-sell.html">Your Privacy Choices</a> &middot; <a href="${pre}feed.xml">RSS</a> &middot; <a href="${pre}llms.txt">llms.txt</a></p>
        <p class="footer-meta">&copy; ${BRAND} Inc. 2026 &middot; <a href="mailto:info@aquamesh.ai">info@aquamesh.ai</a></p>
      </div>
    </div>
  </footer>`;

const head = ({ title, desc, canonical, pre, og = 'assets/og.png', type = 'website', extra = '' }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <link rel="canonical" href="${canonical}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <meta property="og:type" content="${type}" />
  <meta property="og:site_name" content="${BRAND}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${SITE}/${og}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="alternate" type="application/rss+xml" title="${BRAND} blog" href="${SITE}/feed.xml" />
  <link rel="alternate" type="application/feed+json" title="${BRAND} blog" href="${SITE}/blog/feed.json" />
  <link rel="icon" href="${pre}assets/favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${pre}${CSS_V}" />
${extra}</head>
<body>
  ${SPRITE}

${nav(pre)}`;

const tail = (pre) => `${footer(pre)}
  <script src="${pre}consent.js?v=2"></script>
  <script src="${pre}nav.js?v=1" defer></script>
</body>
</html>
`;

const ld = (obj) => `  <script type="application/ld+json">${JSON.stringify(obj)}</script>\n`;

const ORG = {
  '@type': 'Organization', '@id': `${SITE}/#organization`, name: BRAND, url: SITE,
  description: 'Operational AI for industrial water: finds what a plant is losing in product, energy and chemicals, prices it, and tells operators what to change.',
  logo: { '@type': 'ImageObject', url: `${SITE}/assets/og.png` },
  email: 'info@aquamesh.ai', slogan: TAGLINE
};

/* ── post pages ──────────────────────────────────────────────────────── */
for (const p of posts) {
  const related = posts.filter(x => x.slug !== p.slug).slice(0, 2);
  const jsonld = ld({
    '@context': 'https://schema.org',
    '@graph': [ORG, {
      '@type': 'BlogPosting', '@id': p.url + '#post', headline: p.title, name: p.title,
      description: p.description, url: p.url, datePublished: p.date, dateModified: p.updated || p.date,
      inLanguage: 'en', wordCount: p.words, keywords: p.tags.join(', '),
      articleSection: p.section || 'Industrial water',
      author: { '@type': 'Organization', name: BRAND, url: SITE },
      publisher: { '@id': `${SITE}/#organization` },
      mainEntityOfPage: { '@type': 'WebPage', '@id': p.url },
      image: `${SITE}/${p.image || 'assets/og.png'}`
    }, {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog/` },
        { '@type': 'ListItem', position: 3, name: p.title, item: p.url }
      ]
    }]
  });

  const toc = p.rendered.toc.length > 2
    ? `        <nav class="post-toc" aria-label="On this page">
          <p class="post-toc-label">On this page</p>
          <ol>${p.rendered.toc.map(t => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}</ol>
        </nav>\n`
    : '';

  write(`blog/${p.slug}.html`, head({
    title: `${p.title} | ${BRAND}`, desc: p.description, canonical: p.url,
    pre: '../', type: 'article', extra: jsonld, og: p.image || 'assets/og.png'
  }) + `
  <main class="cs post">
    <article>
      <section class="section cs-head">
        <div class="wrap">
          <a class="cs-back" href="index.html"><svg class="ic"><use href="#i-back" /></svg>All posts</a>
          <p class="eyebrow">${esc(p.section || 'Field notes')}</p>
          <h1>${esc(p.title)}</h1>
          <p class="lead">${esc(p.description)}</p>
          <p class="post-meta">
            <time datetime="${p.date}">${fmtDate(p.date)}</time> &middot; ${p.minutes} min read
            &middot; <a href="${p.slug}.md">Markdown</a>
          </p>
        </div>
      </section>

      <section class="section">
        <div class="wrap post-body">
${toc}${p.rendered.html}
        </div>
      </section>
    </article>

    <section class="section wash">
      <div class="wrap">
        <div class="head"><p class="eyebrow">Keep reading</p><h2>More field notes</h2></div>
        <ul class="post-grid">
${related.map(r => `          <li><a href="${r.slug}.html"><time datetime="${r.date}">${fmtDate(r.date)}</time><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p></a></li>`).join('\n')}
        </ul>
      </div>
    </section>

    <section class="closing">
      <div class="wrap closing-inner">
        <h2>Bring your own history.</h2>
        <p class="lead">If your plant keeps a historian, AquaMesh has something to read. The audit is free and needs no hardware.</p>
        <div class="actions">
          <a class="btn" href="mailto:info@aquamesh.ai?subject=Demo%20request">Book a demo <svg class="ic"><use href="#i-arrow" /></svg></a>
          <a class="mail" href="mailto:info@aquamesh.ai"><svg class="ic"><use href="#i-mail" /></svg>info@aquamesh.ai</a>
        </div>
      </div>
    </section>
  </main>

` + tail('../'));

  write(`blog/${p.slug}.md`, p.raw);
}

/* ── blog index ──────────────────────────────────────────────────────── */
const indexLd = ld({
  '@context': 'https://schema.org',
  '@graph': [ORG, {
    '@type': 'Blog', '@id': `${SITE}/blog/#blog`, name: `${BRAND} field notes`, url: `${SITE}/blog/`,
    description: 'What we find in industrial water plants, how the measurement works, and what it is worth.',
    publisher: { '@id': `${SITE}/#organization` },
    blogPost: posts.map(p => ({ '@type': 'BlogPosting', headline: p.title, url: p.url, datePublished: p.date, description: p.description }))
  }]
});

write('blog/index.html', head({
  title: `Field notes on industrial water | ${BRAND}`,
  desc: 'What we find in real plants, how spectral measurement actually works, and what each finding is worth a year. Written for operators and engineers.',
  canonical: `${SITE}/blog/`, pre: '../', extra: indexLd
}) + `
  <main class="cs">
    <section class="section cs-head">
      <div class="wrap">
        <p class="eyebrow">Field notes</p>
        <h1>What we find in plants, <span class="accent">and what it is worth.</span></h1>
        <p class="lead">Notes from audits, measurement and the arithmetic behind the numbers. No vendor theatre — where something is an estimate, it says so.</p>
        <p class="post-meta"><a href="../feed.xml">RSS</a> &middot; <a href="feed.json">JSON Feed</a> &middot; <a href="index.json">JSON index</a> &middot; <a href="../llms.txt">llms.txt</a></p>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <ul class="post-grid wide">
${posts.map(p => `          <li><a href="${p.slug}.html"><time datetime="${p.date}">${fmtDate(p.date)}</time><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p><span class="post-more">Read <svg class="ic"><use href="#i-arrow" /></svg></span></a></li>`).join('\n')}
        </ul>
${insights.length ? `
        <div class="head" style="margin-top: clamp(48px, 6vw, 76px)">
          <p class="eyebrow">Insights</p>
          <h2>Technical guides</h2>
          <p class="lead">Longer reference pieces on matching signals to decisions, by sector.</p>
        </div>
        <ul class="post-grid">
${insights.map(x => `          <li><a href="../insights/${x.file}">${x.date ? `<time datetime="${x.date}">${fmtDate(x.date)}</time>` : ''}<h3>${esc(x.title)}</h3><p>${esc(x.desc)}</p></a></li>`).join('\n')}
        </ul>` : ''}
      </div>
    </section>
  </main>

` + tail('../'));

/* ── machine-readable surfaces ───────────────────────────────────────── */
const now = new Date().toUTCString();

write('feed.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${BRAND} — field notes</title>
    <link>${SITE}/blog/</link>
    <description>What we find in industrial water plants, how the measurement works, and what it is worth.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
${posts.map(p => `    <item>
      <title>${esc(p.title)}</title>
      <link>${p.url}</link>
      <guid isPermaLink="true">${p.url}</guid>
      <pubDate>${new Date(p.date + 'T09:00:00Z').toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
      <content:encoded><![CDATA[${p.rendered.html}]]></content:encoded>
${p.tags.map(t => `      <category>${esc(t)}</category>`).join('\n')}
    </item>`).join('\n')}
  </channel>
</rss>
`);

write('blog/feed.json', JSON.stringify({
  version: 'https://jsonfeed.org/version/1.1',
  title: `${BRAND} — field notes`,
  home_page_url: `${SITE}/blog/`,
  feed_url: `${SITE}/blog/feed.json`,
  description: 'What we find in industrial water plants, how the measurement works, and what it is worth.',
  language: 'en',
  authors: [{ name: BRAND, url: SITE }],
  items: posts.map(p => ({
    id: p.url, url: p.url, title: p.title, summary: p.description,
    content_html: p.rendered.html, content_text: p.text,
    date_published: p.date + 'T09:00:00Z', date_modified: (p.updated || p.date) + 'T09:00:00Z',
    tags: p.tags
  }))
}, null, 2));

write('blog/index.json', JSON.stringify({
  site: SITE, brand: BRAND, description: ORG.description,
  generated: new Date().toISOString(),
  license: 'Readable and quotable with attribution to AquaMesh (https://aquamesh.ai).',
  count: posts.length,
  posts: posts.map(p => ({
    title: p.title, slug: p.slug, url: p.url,
    markdown_url: `${SITE}/blog/${p.slug}.md`,
    description: p.description, date: p.date, updated: p.updated || p.date,
    section: p.section || null, tags: p.tags, words: p.words, reading_minutes: p.minutes,
    headings: p.rendered.toc.map(t => t.text),
    content_text: p.text
  }))
}, null, 2));

/* llms.txt — the index an agent reads first */
const pages = [
  ['/', 'Home', 'What AquaMesh does: reads a plant’s existing data, prices what it is losing, and hands operators a ranked list of changes.'],
  ['/company.html', 'Company', 'Origin at UC San Diego, the first sensor developed for Scripps Institution of Oceanography, the team and advisors.'],
  ['/case-studies/', 'Case studies', 'Anonymised audits of real plants with the figures they produced.'],
  ['/case-studies/water-reuse-plant.html', 'Case study: membrane-bioreactor water reuse', '25 days of a plant’s own historian — 1,001 tags, 7.2M values — produced $42,050/yr achievable with no capital and $92,200/yr fully instrumented.'],
  ['/case-studies/starch-plant.html', 'Case study: corn wet milling', 'NIR starch detection on the process stream wired into the operational AI.'],
  ['/industries/food-beverage.html', 'Food & Beverage', 'Product leaving in the water, CIP endpoints, surcharge-driving load.'],
  ['/industries/industrial-water.html', 'Industrial Water & Wastewater', 'Aeration energy, parallel equipment divergence, instrument health.'],
  ['/industries/manufacturing.html', 'Manufacturing', 'Rinse and cooling water, discharge limits, what conductivity cannot tell you.'],
  ['/industries/municipal.html', 'Municipal Water & Reuse', 'Energy per kilowatt-hour, reuse reporting, defensible evidence.'],
  ['/industries/pharma-biotech.html', 'Pharma & Biotech', 'Cleaning endpoints and continuous trend, outside the validated control path.'],
  ['/industries/data-centers.html', 'Data Centers', 'Cooling circuit chemistry, cycles of concentration, condition-based blowdown.']
];

write('llms.txt', `# ${BRAND}

> ${ORG.description} ${BRAND} is advisory by default: it recommends, operators decide.

AquaMesh reads the history a plant already records, models each signal and each pair of
parallel units, prices what it finds using the plant's own tariff, and presents a ranked
list of actions. The AquaSpectra probe adds continuous in-situ spectral measurement where
existing instruments leave a gap: the spectrum is watched for change and correlated with
what matters, and BOD is the one parameter calibrated against the customer's own samples.

## Blog
${posts.map(p => `- [${p.title}](${p.url}): ${p.description} (${p.date}, ${p.minutes} min). Markdown: ${SITE}/blog/${p.slug}.md`).join('\n')}

${insights.length ? `## Insights
${insights.map(x => `- [${x.title}](${x.url}): ${x.desc}${x.date ? ` (${x.date})` : ''}`).join('\n')}

` : ''}## Site
${pages.map(([u, t, d]) => `- [${t}](${SITE}${u}): ${d}`).join('\n')}

## Machine-readable
- [Full blog text](${SITE}/llms-full.txt): every post, complete, in one file
- [JSON index](${SITE}/blog/index.json): posts with metadata and full text
- [JSON Feed](${SITE}/blog/feed.json)
- [RSS](${SITE}/feed.xml)
- [Sitemap](${SITE}/sitemap.xml)

## Notes for agents
- Figures in case studies are identified opportunities, not realised savings, and are specific to the plant and tariff they came from.
- Penalty and surcharge figures come from public EPA/DOJ enforcement records and published municipal schedules.
- Spectral output is change analysis; BOD is the only calibrated parameter. AquaSpectra is not a compendial method.
- Content is quotable with attribution to ${BRAND} (${SITE}).
- Contact: info@aquamesh.ai
`);

write('llms-full.txt', `# ${BRAND} — complete blog text
# ${ORG.description}
# Generated ${new Date().toISOString()} · ${posts.length} posts · quotable with attribution to ${SITE}

${insights.map(x => `
${'='.repeat(78)}
TITLE: ${x.title}
URL: ${x.url}
DATE: ${x.date}
SECTION: Insights
${'='.repeat(78)}

${x.text}
`).join('\n')}
${posts.map(p => `
${'='.repeat(78)}
TITLE: ${p.title}
URL: ${p.url}
DATE: ${p.date}
SECTION: ${p.section || ''}
TAGS: ${p.tags.join(', ')}
${'='.repeat(78)}

${p.body}
`).join('\n')}
`);

/* ── sitemap across the whole site ───────────────────────────────────── */
const staticPages = [
  ['/', '1.0', 'weekly'], ['/company.html', '0.7', 'monthly'],
  ['/case-studies/', '0.8', 'monthly'],
  ['/case-studies/water-reuse-plant.html', '0.8', 'monthly'],
  ['/case-studies/starch-plant.html', '0.8', 'monthly'],
  ['/blog/', '0.9', 'weekly'],
  ...['food-beverage', 'industrial-water', 'manufacturing', 'municipal', 'pharma-biotech', 'data-centers']
    .map(s => [`/industries/${s}.html`, '0.8', 'monthly']),
  ['/privacy.html', '0.3', 'yearly'], ['/cookies.html', '0.3', 'yearly'],
  ['/terms.html', '0.3', 'yearly'], ['/do-not-sell.html', '0.3', 'yearly']
];
const today = new Date().toISOString().slice(0, 10);

write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(([u, pr, cf]) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join('\n')}
${posts.map(p => `  <url><loc>${p.url}</loc><lastmod>${p.updated || p.date}</lastmod><changefreq>yearly</changefreq><priority>0.7</priority></url>`).join('\n')}
${insights.map(x => `  <url><loc>${x.url}</loc>${x.date ? `<lastmod>${x.date}</lastmod>` : ''}<changefreq>yearly</changefreq><priority>0.7</priority></url>`).join('\n')}
</urlset>
`);

/* ── robots: crawlers welcome, agents explicitly welcome ─────────────── */
write('robots.txt', `# ${BRAND} — ${SITE}
# Search crawlers and AI agents are both welcome here. If you are a model or an
# agent, start at /llms.txt; /llms-full.txt has every post in full.

User-agent: *
Allow: /

# Named AI crawlers and assistants, allowed explicitly so there is no ambiguity.
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-User
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: Bingbot
Allow: /
User-agent: CCBot
Allow: /
User-agent: Meta-ExternalAgent
Allow: /
User-agent: Amazonbot
Allow: /
User-agent: Bytespider
Allow: /
User-agent: cohere-ai
Allow: /
User-agent: DuckAssistBot
Allow: /
User-agent: MistralAI-User
Allow: /
User-agent: YouBot
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);

console.log('wrote: blog pages, index, feed.xml, feed.json, index.json, llms.txt, llms-full.txt, sitemap.xml, robots.txt');
