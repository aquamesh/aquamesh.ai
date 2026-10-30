/**
 * Everything the SEO agent treats as policy, in one place. The agent reads
 * this; it never writes it.
 */

export const SITE = 'https://aquamesh.ai';
export const HOST = 'aquamesh.ai';
export const USER_AGENT = 'AquaMeshSEOAgent/1.0 (+https://aquamesh.ai/llms.txt)';

/* Paths the agent never crawls, reports on, or submits anywhere. */
export const EXCLUDE = [/^\/x\//];

export const LIMITS = {
  maxPages: 250,            // internal HTML pages per crawl
  maxExternal: 200,         // external links checked on a weekly run
  concurrency: 6,
  timeoutMs: 20000,
  maxFixFiles: 60,          // a rebuild that touches more than this is not "drift"
  maxIndexNowUrls: 100,
  aiBudgetUsd: 3,           // hard stop for the AI-search probe, per run
  maxDraftsPerRun: 4,       // page fixes drafted (and published) per weekly run
  maxOpenDrafts: 4,         // stop drafting while this many await review
  weeklyEveryDays: 6.5
};

/* The ONLY files the agent may ever commit to main. They are all written by
   scripts/build-blog.mjs from blog/posts/*.md, so committing them can only
   bring the live site back in line with sources someone already committed. */
export const GENERATED = [
  /^blog\/(?!posts\/)[a-z0-9-]+\.(html|md)$/,
  /^blog\/(index|feed)\.json$/,
  /^(feed\.xml|sitemap\.xml|robots\.txt|llms\.txt|llms-full\.txt)$/
];

/* Lines that change on every build and mean nothing on their own. */
export const TIMESTAMP_LINE = /^\s*("generated": "[^"]*",?|<lastBuildDate>[^<]*<\/lastBuildDate>|# Generated \S+ · .*)\s*$/;

/* What a healthy homepage must and must not contain. Another agent has
   reverted index.html wholesale before (619cbbf); this is how it gets noticed.
   Report-only: the agent never edits index.html. */
export const HOMEPAGE = {
  mustContain: [
    { re: /<a href="blog\/index\.html">Blog<\/a>/, what: 'Blog link in the main nav' },
    { re: /"@type":"Organization"/, what: 'Organization JSON-LD graph' },
    { re: /class="hero-badge"/, what: 'NVIDIA Inception badge in the hero' }
  ],
  mustNotContain: [
    { re: /<footer[\s\S]*nvidia-inception-badge[\s\S]*<\/footer>/, what: 'Inception badge in the footer (Alex: no footer badges)' }
  ]
};

/* Case-study figures have provenance rules: the v2 audit set is current and
   the v1 set is superseded. Report-only guard against anyone rewriting them. */
export const FIGURES = {
  required: { '/case-studies/water-reuse-plant.html': ['$92,200', '$42,050'] },
  forbidden: ['$34,870', '$18,490', '$16,380']
};

/* Never name these on the site (memory: feedback-no-competitors). */
export const COMPETITORS = ['Gradiant', 'Inframark', 'Ecolab', 'Veolia', 'Xylem', 'Aquasight', 'Aerzen', 'PureControl', 'rlCore'];

/* Weekly Lighthouse runs (mobile, simulated throttling). */
export const LIGHTHOUSE_PAGES = ['/', '/blog/', '{newest-post}', '/case-studies/water-reuse-plant.html', '/industries/industrial-water.html'];

/* Weekly AI-search probe. Start from the decisions a buyer makes before
   choosing something like AquaMesh, not from keywords, then ask them the way
   a buyer asks an AI assistant. Each lost question gets diagnosed and one
   fix. Keep the wording stable: the week-over-week trend is keyed on it.
   About 6 cents a question. */
export const AI_QUERIES = [
  'What is AquaMesh (aquamesh.ai) and what does it do?',
  'What AI software helps industrial water and wastewater plants cut operating costs?',
  'How can an industrial plant find energy and chemical savings in the historian data it already records?',
  'How can a wastewater plant cut aeration blower energy without buying new equipment?',
  'What is the fastest way for a food or beverage plant to find product and water losses going down the drain?',
  'Should an industrial plant use online water quality sensors or lab sampling to monitor its wastewater discharge?',
  'Can UV-Vis spectral sensors monitor industrial wastewater continuously instead of lab samples?',
  'Why do parallel blowers or pumps at a treatment plant drift apart in performance, and what does that cost?',
  'How can a data center cut cooling tower water use and prove it under new water reporting rules?',
  'What do California\'s new data center water use reporting rules require?',
  'What does data center water usage effectiveness (WUE) measure, and what does it miss?',
  'How do you control cooling tower blowdown by conductivity, and what happens when the sensor drifts?'
];

/* Alex: no visible changes to the landing page. The agent never targets it
   with a suggested change or a drafted edit; its <head> can still be tuned. */
export const NO_VISIBLE_CHANGES = new Set([`${SITE}/`]);

/* Hand-made pages the agent may draft a ready-to-merge fix for. Not the
   homepage, not case studies (figure provenance), not generated or synced
   pages (blog/, basin/), not legal pages. */
export const PR_PAGES = /^(industries\/[a-z0-9-]+|insights\/[a-z0-9-]+|company)\.html$/;

/* Pages that can never be the answer to a buyer question. */
export const NOT_ANSWER_PAGES = /\/(privacy|cookies|terms|do-not-sell)\.html$/;

export const INDEXNOW_KEY = '5b0a495408e1b61a8c0edf1626010a1b';
