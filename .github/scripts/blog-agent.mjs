#!/usr/bin/env node
/**
 * AquaMesh blog agent.
 *
 * Runs daily. Searches for genuinely new developments in industrial water and
 * wastewater, then decides whether any of them is worth a post. Most days the
 * answer is no, and that is the point: the rate limiter below caps publication
 * at MAX_PER_WEEK so a daily cadence of *running* never becomes a daily
 * cadence of *publishing*. Scaled low-value publishing is the one SEO mistake
 * that penalises a whole domain rather than a single page.
 *
 * Two model calls:
 *   1. research  - web_search, returns a sourced brief and a recommendation
 *   2. draft     - no tools, schema-constrained post or an explicit decline
 *
 * Then deterministic gates that the model cannot talk its way past, and only
 * then a write to blog/posts/ + a build + a commit.
 *
 * Usage:
 *   node .github/scripts/blog-agent.mjs            # full run, writes + builds
 *   node .github/scripts/blog-agent.mjs --dry-run  # research + draft, no write
 */

import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const POSTS = join(ROOT, 'blog', 'posts');
const LOG_DIR = join(ROOT, '_growth', 'blog');

const MODEL = 'claude-opus-5-5';
const MAX_PER_WEEK = 2;        // hard cap on published posts in any rolling 7 days
const MIN_WORDS = 700;
const MAX_WORDS = 1800;
const MIN_SOURCES = 2;

const DRY = process.argv.includes('--dry-run');

/* ── repo context ─────────────────────────────────────────────────────── */

function readFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return meta;
}

export function existingPosts() {
  if (!existsSync(POSTS)) return [];
  return readdirSync(POSTS)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const meta = readFrontmatter(readFileSync(join(POSTS, f), 'utf8')) || {};
      return {
        slug: meta.slug || f.replace(/\.md$/, ''),
        title: meta.title || '',
        date: meta.date || '',
        description: meta.description || '',
        section: meta.section || ''
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function publishedInLastWeek(posts) {
  const cutoff = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  return posts.filter(p => p.date && p.date >= cutoff);
}

function availableImages() {
  const dir = join(ROOT, 'assets');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f) && f !== 'og.png')
    .map(f => `assets/${f}`);
}

function siteContext() {
  const f = join(ROOT, 'llms.txt');
  return existsSync(f) ? readFileSync(f, 'utf8').slice(0, 6000) : '';
}

/* ── prompts ──────────────────────────────────────────────────────────── */

const HOUSE_STYLE = `
You write for AquaMesh, which makes a UV-Vis spectral sensor (AquaSpectra) and an
operational AI layer for industrial water and wastewater plants.

Hard factual constraints about AquaMesh. Violating any of these is a failed draft:
- BOD is the ONLY parameter AquaMesh calibrates. Everything else is spectral CHANGE
  ANALYSIS: the system detects what in the spectrum correlates with something the
  operator cares about. Never claim a calibrated multi-parameter panel, never give a
  count of measured parameters.
- The AI recommends; operators decide. AquaMesh does not actuate plant equipment.
- The sensor was developed FOR Scripps, not with them.
- Never name or make identifiable any customer or pilot site.
- Do not mention the cloud provider or hosting details.

House style:
- Write for a plant manager or operations engineer, not for a search engine.
- Plain declarative sentences. No marketing throat-clearing, no "in today's
  fast-paced world", no rhetorical questions as openers, no bulleted listicles
  standing in for an argument.
- Specific over general: real figures, real limit values, real deadlines, named
  standards. Every number must come from a source you actually read.
- No fabrication. If you cannot source a figure, leave it out rather than estimate.
- Earn the AquaMesh connection. One or two paragraphs near the end on what the
  development means for monitoring practice. If the news has no honest connection
  to what AquaMesh does, that is a reason to decline the post, not to force it.
`.trim();

function researchPrompt(posts) {
  const covered = posts.map(p => `- ${p.title} (${p.date}): ${p.description}`).join('\n');
  return `Today is ${new Date().toISOString().slice(0, 10)}.

Search for developments in industrial water, industrial wastewater, and water reuse
from the last 10 days that an operations engineer at an industrial plant would want
to know about. Prioritise, in this order:

1. Regulatory changes with dates and numeric limits: EPA NPDES permit conditions,
   effluent guidelines, state-level discharge or testing rules, PFAS rules,
   Legionella testing requirements, ASHRAE standards.
2. Enforcement actions with disclosed penalty figures.
3. Published technical or peer-reviewed findings on water monitoring, spectral or
   optical sensing, or AI in water treatment.
4. Sector operational shifts: data centre cooling water, food and beverage
   processing water, metal finishing, semiconductor ultrapure water.

Avoid: vendor press releases, funding announcements, award announcements,
market-size reports, and anything already widely covered months ago.

Posts already on the AquaMesh blog, which you must NOT duplicate:
${covered || '(none yet)'}

Produce a brief:
- For each candidate development: what changed, the specific dates and numbers,
  who it affects, and the source URL. Quote the key figure and say which page it
  came from.
- Flag anything you could not verify to a primary or reputable secondary source.
- Then recommend ONE candidate as the strongest basis for a post, or state plainly
  that nothing this week clears the bar. Nothing clearing the bar is a normal and
  acceptable outcome; say so rather than promoting a weak item.`;
}

const DraftSchema = z.object({
  publish: z.boolean()
    .describe('true only if a genuinely newsworthy, well-sourced post is warranted today'),
  reason: z.string()
    .describe('one or two sentences explaining the publish/decline decision'),
  title: z.string().describe('post title, or empty string when declining'),
  slug: z.string().describe('kebab-case slug, no date prefix, or empty string'),
  description: z.string().describe('1-2 sentence meta description, or empty string'),
  section: z.string().describe('one of: Field notes, Regulation, Method, Sector'),
  tags: z.array(z.string()).describe('4-6 lowercase keyword phrases'),
  image: z.string().describe('one path from the provided asset list, or empty string'),
  sources: z.array(z.string()).describe('every URL cited in the body'),
  body_markdown: z.string()
    .describe('the post body in markdown, starting with a paragraph not a heading; '
      + 'no frontmatter; ## and ### headings; inline [text](url) links to sources')
});

function draftPrompt(brief, posts, images) {
  return `Here is today's research brief.

<brief>
${brief}
</brief>

Decide whether it justifies a post on the AquaMesh blog today, then return the
structured result.

Decline (publish: false) if any of these is true:
- Nothing in the brief is genuinely new or materially useful to a plant operator.
- The strongest candidate's key facts are not traceable to a source you read.
- It substantially overlaps an existing post.
- The only way to connect it to AquaMesh would be a stretch.

Declining is the expected outcome on most days. A thin post is worse than no post:
it dilutes the site and risks the whole domain under search engines' scaled-content
policies. Do not talk yourself into publishing.

If you do publish:
- ${MIN_WORDS}-${MAX_WORDS} words in body_markdown.
- At least ${MIN_SOURCES} distinct source URLs, linked inline where the claim appears.
- Every figure attributable to a linked source.
- Link to at least one existing AquaMesh post where genuinely relevant, using the
  exact form /blog/<slug>.html. A trailing-slash path like /blog/<slug>/ is a 404
  on this host.
- Pick image from this list only: ${images.join(', ')}
- Open with the concrete development, not with context-setting.

Existing posts you can link to:
${posts.map(p => `- /blog/${p.slug}.html - ${p.title}`).join('\n')}`;
}

/* ── model calls ──────────────────────────────────────────────────────── */

async function research(client, posts) {
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high' },
    system: [{ type: 'text', text: HOUSE_STYLE + '\n\n' + siteContext(), cache_control: { type: 'ephemeral' } }],
    tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 14 }],
    messages: [{ role: 'user', content: researchPrompt(posts) }]
  });
  const msg = await stream.finalMessage();
  const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
  const searches = msg.content.filter(b => b.type === 'server_tool_use').length;
  console.log(`  research: ${searches} searches, ${text.split(/\s+/).length} words of brief`);
  return text;
}

async function draft(client, brief, posts, images) {
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high', format: zodOutputFormat(DraftSchema) },
    system: [{ type: 'text', text: HOUSE_STYLE, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: draftPrompt(brief, posts, images) }]
  });
  const msg = await stream.finalMessage();
  if (msg.stop_reason === 'max_tokens') throw new Error('draft truncated at max_tokens');
  if (msg.stop_reason === 'refusal') throw new Error('draft refused by safety classifier');
  const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();
  return DraftSchema.parse(JSON.parse(text));
}

/* ── gates ────────────────────────────────────────────────────────────── */

function normalise(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
}

export function titleOverlap(a, b) {
  const A = new Set(normalise(a)), B = normalise(b);
  if (!A.size || !B.length) return 0;
  return B.filter(w => A.has(w)).length / Math.max(A.size, B.length);
}

export function gate(d, posts) {
  const fail = [];
  const words = d.body_markdown.split(/\s+/).filter(Boolean).length;

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.slug)) fail.push(`slug not kebab-case: "${d.slug}"`);
  if (posts.some(p => p.slug === d.slug)) fail.push(`slug already exists: ${d.slug}`);
  if (words < MIN_WORDS) fail.push(`body too short: ${words} words (min ${MIN_WORDS})`);
  if (words > MAX_WORDS) fail.push(`body too long: ${words} words (max ${MAX_WORDS})`);
  if (!d.title.trim()) fail.push('empty title');
  if (!d.description.trim()) fail.push('empty description');
  if (d.tags.length < 3) fail.push(`too few tags: ${d.tags.length}`);

  const urls = [...new Set(d.sources.filter(u => /^https?:\/\//.test(u)))];
  if (urls.length < MIN_SOURCES) fail.push(`too few sources: ${urls.length} (min ${MIN_SOURCES})`);

  const linked = urls.filter(u => d.body_markdown.includes(u));
  if (linked.length < MIN_SOURCES) {
    fail.push(`sources not linked inline: ${linked.length} of ${urls.length} appear in body`);
  }

  if (d.image && !availableImages().includes(d.image)) fail.push(`unknown image: ${d.image}`);

  if (/\b(\d{1,2})\s*(parameters|params)\b/i.test(d.body_markdown)) {
    fail.push('body appears to advertise a parameter count');
  }
  if (/\bcalibrat\w+\s+(?:for\s+)?(?:COD|TOC|TSS|nitrate|ammonia|turbidity)/i.test(d.body_markdown)) {
    fail.push('body claims calibration for a parameter other than BOD');
  }

  // /blog/<slug>/ is a 404 on this host; only the .html form resolves
  const badLinks = [...d.body_markdown.matchAll(/\/blog\/([a-z0-9-]+)\//g)].map(m => m[0]);
  if (badLinks.length) fail.push(`trailing-slash blog links 404: ${[...new Set(badLinks)].join(', ')}`);

  const near = posts.find(p => titleOverlap(p.title, d.title) > 0.6);
  if (near) fail.push(`title too close to existing post: "${near.title}"`);

  return { ok: fail.length === 0, fail, words, urls };
}

/* ── write ────────────────────────────────────────────────────────────── */

function writePost(d) {
  const today = new Date().toISOString().slice(0, 10);
  const fm = [
    '---',
    `title: ${d.title}`,
    `slug: ${d.slug}`,
    `date: ${today}`,
    `section: ${d.section || 'Field notes'}`,
    `description: ${d.description}`,
    `image: ${d.image || 'assets/audit.jpg'}`,
    `tags: ${d.tags.join(', ')}`,
    '---',
    ''
  ].join('\n');
  const path = join(POSTS, `${d.slug}.md`);
  writeFileSync(path, fm + '\n' + d.body_markdown.trim() + '\n');
  return path;
}

function log(entry) {
  if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  writeFileSync(join(LOG_DIR, `${stamp}.json`), JSON.stringify(entry, null, 2) + '\n');
}

/* ── main ─────────────────────────────────────────────────────────────── */

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('blog agent inactive: ANTHROPIC_API_KEY not configured');
    return;
  }

  const posts = existingPosts();
  const recent = publishedInLastWeek(posts);
  console.log(`${posts.length} posts on the blog, ${recent.length} in the last 7 days`);

  if (recent.length >= MAX_PER_WEEK && !DRY) {
    console.log(`rate limit: ${recent.length}/${MAX_PER_WEEK} posts in the last 7 days, standing down`);
    log({ at: new Date().toISOString(), outcome: 'rate-limited', recent: recent.map(p => p.slug) });
    return;
  }

  const client = new Anthropic();
  const images = availableImages();

  console.log('researching...');
  const brief = await research(client, posts);
  if (!brief) throw new Error('research returned no brief');

  console.log('drafting...');
  const d = await draft(client, brief, posts, images);

  if (!d.publish) {
    console.log(`declined: ${d.reason}`);
    log({ at: new Date().toISOString(), outcome: 'declined', reason: d.reason, brief });
    return;
  }

  const g = gate(d, posts);
  if (!g.ok) {
    console.log('draft failed quality gates, not publishing:');
    for (const f of g.fail) console.log(`  - ${f}`);
    log({ at: new Date().toISOString(), outcome: 'gate-failed', failures: g.fail, slug: d.slug, brief });
    return;
  }

  console.log(`passed gates: "${d.title}" (${g.words} words, ${g.urls.length} sources)`);
  if (DRY) {
    console.log('--- dry run, not writing ---');
    console.log(d.body_markdown.slice(0, 1200));
    return;
  }

  const path = writePost(d);
  console.log(`wrote ${path}`);
  execFileSync('node', [join(ROOT, 'scripts', 'build-blog.mjs')], { stdio: 'inherit', cwd: ROOT });
  log({
    at: new Date().toISOString(), outcome: 'published',
    slug: d.slug, title: d.title, words: g.words, sources: g.urls, reason: d.reason
  });
  console.log(`PUBLISHED ${d.slug}`);
}

// only run when executed directly, so the gates above can be unit-tested
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(err => {
    console.error('blog agent failed:', err.message);
    process.exit(1);
  });
}
