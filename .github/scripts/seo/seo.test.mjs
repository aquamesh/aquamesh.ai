import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parsePage, pageFindings, homepageFindings, siteFindings, parseSitemap, parseRobots, diffFindings, normalizeUrl } from './checks.mjs';
import { isGenerated, timestampOnly, gateFix, detectDrift } from './fix.mjs';
import { collectSources, summarize, matchPages, diagnose } from './ai-search.mjs';
import { actionList, buildReport } from './report.mjs';
import { changedUrls } from './indexnow.mjs';
import { vitalsFindings } from './lighthouse.mjs';

const S = 'https://aquamesh.ai';
const words = (n) => Array.from({ length: n }, (_, i) => `word${i}`).join(' ');

function page({ title = 'A reasonable page title for testing | AquaMesh', desc = 'A meta description that is long enough to count, and short enough that Google shows all of it.',
  canonical = `${S}/a.html`, robots = '', ld = '{"@context":"https://schema.org","@type":"WebPage"}', body = '' } = {}) {
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width">
${title === null ? '' : `<title>${title}</title>`}
${desc === null ? '' : `<meta name="description" content="${desc}">`}
${canonical ? `<link rel="canonical" href="${canonical}">` : ''}
${robots ? `<meta name="robots" content="${robots}">` : ''}
<meta property="og:title" content="t"><meta property="og:description" content="d"><meta property="og:image" content="${S}/assets/og.png">
${ld === null ? '' : `<script type="application/ld+json">${ld}</script>`}
</head><body><h1>Heading</h1><p>${words(300)}</p>${body}</body></html>`;
}

const ids = (fs) => fs.map(x => x.id);

test('parsePage reads head, links and images', () => {
  const p = parsePage(`${S}/blog/x.html`, page({ body: '<a href="/b.html">b</a> <a href="mailto:x@y">m</a> <img src="i.png"> <img src="j.png" alt="">' }));
  assert.equal(p.title, 'A reasonable page title for testing | AquaMesh');
  assert.equal(p.canonical, `${S}/a.html`);
  assert.deepEqual(p.jsonld[0].types, ['WebPage']);
  assert.deepEqual(p.anchors.map(a => a.abs), [`${S}/b.html`]);
  assert.deepEqual(p.images.map(i => i.hasAlt), [false, true]);
  assert.equal(p.lang, 'en');
});

test('a clean page has no errors or warnings', () => {
  const p = parsePage(`${S}/a.html`, page());
  assert.deepEqual(pageFindings(p).filter(x => x.sev !== 'info'), []);
});

test('missing title and description are errors; long title is a warning', () => {
  assert.ok(ids(pageFindings(parsePage(`${S}/a.html`, page({ title: null, desc: null })))).includes('title-missing'));
  assert.ok(ids(pageFindings(parsePage(`${S}/a.html`, page({ desc: null })))).includes('desc-missing'));
  const long = pageFindings(parsePage(`${S}/a.html`, page({ title: 'x'.repeat(90) })));
  assert.equal(long.find(x => x.id === 'title-length').sev, 'warn');
});

test('broken JSON-LD, noindex in sitemap, relative canonical', () => {
  const f = ids(pageFindings(parsePage(`${S}/a.html`, page({ ld: '{"@type":', robots: 'noindex', canonical: '/a.html' }))));
  assert.ok(f.includes('jsonld-invalid'));
  assert.ok(f.includes('noindex-in-sitemap'));
  assert.ok(f.includes('canonical-relative'));
});

test('BlogPosting must carry the article fields', () => {
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'BlogPosting', headline: 'h' }] });
  const f = pageFindings(parsePage(`${S}/blog/x.html`, page({ canonical: `${S}/blog/x.html`, ld })));
  assert.match(f.find(x => x.id === 'jsonld-article-fields').msg, /datePublished/);
});

test('competitor names and superseded case-study figures are flagged', () => {
  const f = pageFindings(parsePage(`${S}/a.html`, page({ body: '<p>Unlike Xylem, we saved $34,870.</p>' })));
  assert.ok(ids(f).includes('competitor-mention'));
  assert.equal(f.find(x => x.id === 'figure-superseded').sev, 'error');
  const cs = pageFindings(parsePage(`${S}/case-studies/water-reuse-plant.html`, page({ canonical: `${S}/case-studies/water-reuse-plant.html`, body: '<p>$92,200</p>' })));
  assert.match(cs.find(x => x.id === 'figure-missing').msg, /\$42,050/);
});

test('homepage regression guard', () => {
  const ok = '<nav><a href="blog/index.html">Blog</a></nav><script>{"@type":"Organization"}</script><a class="hero-badge" href="#">b</a><footer></footer>';
  assert.deepEqual(homepageFindings(S + '/', ok), []);
  const reverted = ok.replace('<a href="blog/index.html">Blog</a>', '');
  assert.match(homepageFindings(S + '/', reverted)[0].msg, /Blog link/);
  const footerBadge = ok.replace('<footer></footer>', '<footer><img src="assets/nvidia-inception-badge.svg"></footer>');
  assert.match(homepageFindings(S + '/', footerBadge)[0].msg, /footer/);
});

function crawlOf(pages, { sitemap, llms = '', robots = 'User-agent: *\nAllow: /\nSitemap: https://aquamesh.ai/sitemap.xml', statuses = {} } = {}) {
  const map = new Map();
  for (const [u, html, status = 200] of pages) map.set(normalizeUrl(u), { url: normalizeUrl(u), status, html, parsed: html ? parsePage(normalizeUrl(u), html) : null });
  return {
    pages: map, statuses: new Map(Object.entries(statuses)), external: null,
    sitemap: sitemap ?? pages.map(([u]) => ({ loc: u, lastmod: '2026-10-01' })),
    llms, robots, feed: '', today: '2026-10-28'
  };
}

test('site rules: broken internal link, unlinked sitemap URL, llms.txt gap', () => {
  const c = crawlOf([
    [`${S}/`, page({ canonical: `${S}/`, body: '<a href="/blog/a/">a</a>' })],
    [`${S}/blog/a.html`, page({ canonical: `${S}/blog/a.html` })]
  ], { statuses: { [`${S}/blog/a/`]: 404 } });
  const f = siteFindings(c);
  const broken = f.find(x => x.id === 'link-broken');
  assert.equal(broken.sev, 'error');
  assert.match(broken.msg, /blog\/a\/ which returns 404/);
  assert.ok(f.some(x => x.id === 'sitemap-unlinked' && x.url === `${S}/blog/a.html`));
  assert.ok(f.some(x => x.id === 'llms-missing-post' && x.url === `${S}/blog/a.html`));
});

test('robots.txt that blocks everything is an error', () => {
  const c = crawlOf([[`${S}/`, page({ canonical: `${S}/` })]], { robots: 'User-agent: *\nDisallow: /' });
  assert.ok(siteFindings(c).some(x => x.id === 'robots-blocks-all'));
  assert.equal(parseRobots('User-agent: a\nUser-agent: b\nAllow: /').groups[0].agents.length, 2);
});

test('sitemap parsing and uniform lastmod', () => {
  const xml = `<urlset>${Array.from({ length: 12 }, (_, i) => `<url><loc>${S}/p${i}.html</loc><lastmod>2026-10-28</lastmod></url>`).join('')}</urlset>`;
  const sm = parseSitemap(xml);
  assert.equal(sm.length, 12);
  const c = crawlOf(sm.map(e => [e.loc, page({ canonical: e.loc })]), { sitemap: sm });
  assert.ok(siteFindings(c).some(x => x.id === 'sitemap-lastmod-uniform'));
});

test('diffFindings keys on id + url', () => {
  const a = { sev: 'error', id: 'x', url: 'u', msg: '1' }, b = { sev: 'warn', id: 'y', url: 'u', msg: '2' };
  const d = diffFindings([a], [{ ...a, msg: 'changed count' }, b]);
  assert.deepEqual(d.added.map(x => x.id), ['y']);
  assert.deepEqual(d.resolved, []);
});

test('only generated files are committable', () => {
  for (const p of ['blog/a-post.html', 'blog/a-post.md', 'blog/index.html', 'blog/index.json', 'blog/feed.json', 'sitemap.xml', 'llms.txt', 'llms-full.txt', 'feed.xml', 'robots.txt']) {
    assert.ok(isGenerated(p), p);
  }
  for (const p of ['index.html', 'blog/posts/a.md', 'case-studies/water-reuse-plant.html', 'company.html', 'scripts/build-blog.mjs', 'styles.css', '.github/workflows/x.yml', 'x/abc.html']) {
    assert.ok(!isGenerated(p), p);
  }
});

test('timestamp-only diffs are ignored', () => {
  assert.ok(timestampOnly('--- a/x\n+++ b/x\n@@ -1 +1 @@\n-  "generated": "2026-10-28T23:27:31.330Z",\n+  "generated": "2026-10-29T13:40:00.000Z",'));
  assert.ok(timestampOnly('-    <lastBuildDate>Wed, 28 Oct 2026 23:27:31 GMT</lastBuildDate>\n+    <lastBuildDate>Thu, 29 Oct 2026 13:40:00 GMT</lastBuildDate>'));
  assert.ok(!timestampOnly('-  "generated": "a",\n+  "generated": "b",\n+<p>new paragraph</p>'));
  assert.ok(!timestampOnly(''));
});

test('gateFix refuses deletions, files outside the allowlist, and dead links', () => {
  const root = mkdtempSync(join(tmpdir(), 'seo-gate-'));
  try {
    const g = (...a) => execFileSync('git', a, { cwd: root, stdio: 'pipe' });
    g('init', '-q');
    mkdirSync(join(root, 'blog'));
    const sm = `<urlset><url><loc>${S}/blog/a.html</loc><lastmod>2026-10-01</lastmod></url></urlset>`;
    writeFileSync(join(root, 'sitemap.xml'), sm);
    writeFileSync(join(root, 'llms.txt'), `- [A](${S}/blog/a.html)`);
    writeFileSync(join(root, 'blog/a.html'), page({ canonical: `${S}/blog/a.html` }));
    writeFileSync(join(root, 'index.html'), 'home');
    g('add', '.');
    g('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'init');

    /* a clean rebuild of an allowed file passes */
    writeFileSync(join(root, 'blog/a.html'), page({ canonical: `${S}/blog/a.html`, body: '<a href="/blog/a.html">self</a>' }));
    assert.deepEqual(gateFix(root, { changed: ['blog/a.html'], added: [], deleted: [] }).reasons, []);

    /* a link to a page that does not exist */
    writeFileSync(join(root, 'blog/a.html'), page({ canonical: `${S}/blog/a.html`, body: '<a href="/blog/missing/">x</a>' }));
    assert.match(gateFix(root, { changed: ['blog/a.html'], added: [], deleted: [] }).reasons.join(), /no file behind it/);

    /* a rebuilt page that loses its title */
    writeFileSync(join(root, 'blog/a.html'), page({ title: null, canonical: `${S}/blog/a.html` }));
    assert.match(gateFix(root, { changed: ['blog/a.html'], added: [], deleted: [] }).reasons.join(), /title-missing/);

    const r = gateFix(root, { changed: ['index.html'], added: [], deleted: ['blog/b.html'] });
    assert.match(r.reasons.join(), /deletes files/);
    assert.match(r.reasons.join(), /may not commit: index.html/);

    /* sitemap may not lose URLs */
    writeFileSync(join(root, 'blog/a.html'), page({ canonical: `${S}/blog/a.html` }));
    writeFileSync(join(root, 'sitemap.xml'), '<urlset></urlset>');
    assert.match(gateFix(root, { changed: ['sitemap.xml'], added: [], deleted: [] }).reasons.join(), /sitemap would lose/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('detectDrift keeps real changes, drops timestamp churn, sees new files', () => {
  const root = mkdtempSync(join(tmpdir(), 'seo-drift-'));
  try {
    const g = (...a) => execFileSync('git', a, { cwd: root, stdio: 'pipe' });
    g('init', '-q');
    mkdirSync(join(root, 'blog'));
    mkdirSync(join(root, 'scripts'));
    writeFileSync(join(root, 'blog/index.json'), '{\n  "generated": "2026-10-01T00:00:00.000Z",\n  "count": 1\n}\n');
    writeFileSync(join(root, 'blog/a.html'), '<p>old</p>\n');
    writeFileSync(join(root, 'scripts/build-blog.mjs'), `import { writeFileSync } from 'node:fs';
writeFileSync('blog/index.json', '{\\n  "generated": "' + new Date().toISOString() + '",\\n  "count": 1\\n}\\n');
writeFileSync('blog/a.html', '<p>new</p>\\n');
writeFileSync('blog/b.html', '<p>added</p>\\n');`);
    g('add', '.');
    g('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'init');
    const d = detectDrift(root);
    assert.deepEqual(d, { changed: ['blog/a.html'], added: ['blog/b.html'], deleted: [] });
    assert.equal(execFileSync('git', ['status', '--porcelain', '--', 'blog/index.json'], { cwd: root, encoding: 'utf8' }), '');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('collectSources finds results and citations wherever they sit', () => {
  const content = [
    { type: 'server_tool_use', name: 'web_search', input: { query: 'q' } },
    { type: 'web_search_tool_result', content: [
      { type: 'web_search_result', url: 'https://www.epa.gov/a', title: 'EPA' },
      { type: 'web_search_result', url: 'https://aquamesh.ai/blog/x.html', title: 'AquaMesh' }
    ] },
    { type: 'text', text: 'Answer.', citations: [{ type: 'web_search_result_location', url: 'https://aquamesh.ai/blog/x.html', cited_text: '...' }] },
    { type: 'text', text: ' More.', citations: [{ type: 'web_search_result_location', url: 'https://www.epa.gov/a', cited_text: '...' }] }
  ];
  const s = summarize('q', content);
  assert.equal(s.aquameshRetrievedRank, 2);
  assert.equal(s.aquameshCited, true);
  assert.deepEqual(s.topCitedDomains.sort(), ['aquamesh.ai', 'epa.gov']);
  assert.equal(s.answer, 'Answer. More.');
  assert.deepEqual(collectSources({ type: 'web_search_tool_result', content: { type: 'web_search_tool_result_error', error_code: 'max_uses_exceeded' } }), { retrieved: [], cited: [], titles: {} });
});

test('dynamic-filtering shapes: search_result{source}, citations by source, answer after the last tool round', () => {
  const content = [
    { type: 'text', text: 'r is a string; parse.' },
    { type: 'server_tool_use', name: 'web_search', input: {} },
    { type: 'web_search_tool_result', content: [{ type: 'web_search_result', url: 'https://www.epa.gov/a' }] },
    { type: 'bash_code_execution_tool_result', content: { stdout: '', search_results: [{ type: 'search_result', source: 'https://aquamesh.ai/', title: 'AquaMesh' }] } },
    { type: 'text', text: 'AquaMesh is', citations: [{ type: 'search_result_location', source: 'https://aquamesh.ai/', cited_text: 'x' }] },
    { type: 'text', text: ' an industrial AI company.' }
  ];
  const s = summarize('q', content);
  assert.equal(s.aquameshRetrievedRank, 2);
  assert.equal(s.aquameshCited, true);
  assert.equal(s.answer, 'AquaMesh is an industrial AI company.');
  assert.equal(s.blockTypes.text, 3);
});

test('IndexNow only sends pages whose content changed', () => {
  const c = crawlOf([[`${S}/`, page({ canonical: `${S}/` })], [`${S}/a.html`, page()]], { sitemap: [{ loc: `${S}/` }, { loc: `${S}/a.html` }] });
  const first = changedUrls(c.pages, c.sitemap, {});
  assert.equal(first.changed.length, 2);
  assert.deepEqual(changedUrls(c.pages, c.sitemap, first.hashes).changed, []);
  c.pages.get(`${S}/a.html`).parsed.text += ' edited';
  assert.deepEqual(changedUrls(c.pages, c.sitemap, first.hashes).changed, [`${S}/a.html`]);
});

test('vitals thresholds', () => {
  const f = vitalsFindings({ url: S, lcpMs: 5200, cls: 0.12, tbtMs: 90, seo: 100, failingSeo: [], performance: 60 }, { performance: 75 });
  assert.deepEqual(ids(f).sort(), ['cwv-cls', 'cwv-lcp', 'cwv-regression']);
  assert.equal(f.find(x => x.id === 'cwv-lcp').sev, 'error');
});

test('matchPages finds the page that answers a question, never a legal page', () => {
  const c = crawlOf([
    [`${S}/blog/aeration.html`, page({ title: 'Aeration blower energy at wastewater plants', canonical: `${S}/blog/aeration.html`, body: '<p>blower energy aeration wastewater</p>' })],
    [`${S}/industries/data-centers.html`, page({ title: 'Data center cooling water', canonical: `${S}/industries/data-centers.html` })],
    [`${S}/privacy.html`, page({ title: 'Privacy: aeration blower energy wastewater', canonical: `${S}/privacy.html` })]
  ]);
  const m = matchPages('How can a wastewater plant cut aeration blower energy?', [...c.pages.values()]);
  assert.equal(m[0].url, `${S}/blog/aeration.html`);
  assert.ok(!m.some(x => x.url.endsWith('/privacy.html')));
});

test('diagnose scrubs competitor names and keeps the SEO pod on blog posts', async () => {
  const reply = { verdict: 'weak_page', target_page: `${S}/industries/municipal.html`, why: 'Xylem has a clearer page.', change: 'Answer the question in the first paragraph, unlike Veolia.',
    owner: 'seo_pod', sources: [{ url: 'https://www.reddit.com/r/Wastewater/x', kind: 'reddit', action: 'EARN', note: 'operators compare tools here' }] };
  const client = { messages: { create: async () => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(reply) }], usage: {} }) } };
  const d = await diagnose(client, { query: 'q', aquameshRetrievedRank: null, answer: 'a', citedSources: [] }, [], 'AquaMesh');
  assert.ok(!/Xylem|Veolia/.test(d.why + d.change));
  assert.equal(d.owner, 'alex', 'the pod may only touch /blog/ posts');
});

test('report leads with one fix per lost question, most fixable first', () => {
  const r = (query, verdict, extra = {}) => ({ query, citable: true, aquameshCited: false, topCitedDomains: [], answer: '',
    diagnosis: { verdict, target_page: `${S}/blog/x.html`, why: 'w', change: `fix ${verdict}`, owner: 'seo_pod', sources: [{ url: 'https://g2.com/x', kind: 'review_site', action: 'CLAIM', note: 'n' }] }, ...extra });
  const ai = { at: '2026-10-29T00:00:00Z', engine: 'e', usd: 0, results: [r('a', 'third_party'), r('b', 'crawl_problem'), { query: 'c', citable: true, aquameshCited: true, topCitedDomains: [], answer: '' }] };
  assert.deepEqual(actionList(ai).map(a => a.verdict), ['crawl_problem', 'third_party']);
  const md = buildReport({ at: ai.at, crawl: { pages: 3 }, findings: [], diff: null, actions: [], lighthouse: null, ai, aiHistory: { c: [{ cited: false }, { cited: true }] }, weekly: true });
  assert.match(md, /AI answers that cite aquamesh.ai: 1 of 3/);
  assert.ok(md.indexOf('## Do this week') < md.indexOf('## Site health'));
  assert.match(md, /1\. \*\*SEO pod\*\* · crawl problem/);
  assert.match(md, /\*\*CLAIM\*\*/);
  assert.match(md, /no → yes/);
});

import { validateDraft, canDraft } from './pr.mjs';

test('only hand-made pages other than the homepage get drafted fixes', () => {
  assert.ok(canDraft(`${S}/industries/food-beverage.html`));
  assert.ok(canDraft(`${S}/insights/spectral-sensing-ai-industrial-water.html`));
  for (const u of [`${S}/`, `${S}/case-studies/water-reuse-plant.html`, `${S}/blog/x.html`, `${S}/basin/`, `${S}/privacy.html`]) assert.ok(!canDraft(u), u);
});

test('diagnose never targets the homepage with a visible change', async () => {
  const reply = { verdict: 'weak_page', target_page: `${S}/`, why: 'w', change: 'c', owner: 'alex', sources: [] };
  const client = { messages: { create: async () => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(reply) }], usage: {} }) } };
  const d = await diagnose(client, { query: 'q', answer: '', citedSources: [] }, [], '');
  assert.equal(d.target_page, '');
  assert.equal(d.verdict, 'missing_page');
  assert.equal(d.owner, 'seo_pod');
});

test('validateDraft accepts a clean insertion and rejects invented figures, outside links, new classes, scripts', () => {
  const root = mkdtempSync(join(tmpdir(), 'seo-draft-'));
  try {
    mkdirSync(join(root, 'industries'));
    writeFileSync(join(root, 'company.html'), 'x');
    const original = page({ canonical: `${S}/industries/a.html`, body: '<section class="section"><p class="lead">Plants lose $1M+ a year. Payback under 12 months.</p></section>' });
    writeFileSync(join(root, 'industries/a.html'), original);
    const good = { insert_after: '</p></section>', html: '<section class="section"><h2>How to find losses fast</h2><p class="lead">Start with the history the plant already records. Price each loss on the plant\'s own tariff, rank them, and act on the largest first. Facilities like this lose $1M+ a year, and payback comes in under 12 months. See <a href="../company.html">who we are</a>.</p></section>', summary: 's' };
    assert.deepEqual(validateDraft(root, 'industries/a.html', original, good), []);
    const bad = (patch) => validateDraft(root, 'industries/a.html', original, { ...good, ...patch }).join(' | ');
    assert.match(bad({ html: good.html.replace('$1M+', '$4.2M') }), /figures not already on the page: 4.2/);
    assert.match(bad({ html: good.html.replace('../company.html', 'https://example.com') }), /external link/);
    assert.match(bad({ html: good.html.replace('class="lead"', 'class="shiny"') }), /class "shiny"/);
    assert.match(bad({ html: good.html + '<script>x()</script>' }), /not allowed/);
    assert.match(bad({ html: good.html.replace('../company.html', '../missing.html') }), /no page behind it/);
    assert.match(bad({ insert_after: '<p' }), /exactly once/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
