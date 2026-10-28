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

/* Weekly AI-search probe: questions a buyer asks an AI assistant. The agent
   records whether aquamesh.ai is retrieved and whether it is cited. Edit
   freely; keep it under a dozen so the weekly cost stays near a dollar. */
export const AI_QUERIES = [
  'What is AquaMesh (aquamesh.ai) and what does it do?',
  'What AI software helps industrial water and wastewater plants cut operating costs?',
  'How can an industrial plant find energy and chemical savings in the historian data it already records?',
  'How much of a wastewater treatment plant\'s electricity goes to aeration, and how do plants reduce it?',
  'Why do parallel blowers or pumps at a treatment plant drift apart in performance, and what does that cost?',
  'How does intermittent aeration work for nitrogen removal, and how precise do dissolved oxygen sensors need to be?',
  'What does data center water usage effectiveness (WUE) measure, and what does it miss?',
  'What do California\'s new data center water use reporting rules require?',
  'Can UV-Vis spectral sensors monitor industrial wastewater continuously instead of lab samples?',
  'How do you control cooling tower blowdown by conductivity, and what happens when the sensor drifts?'
];

export const INDEXNOW_KEY = '5b0a495408e1b61a8c0edf1626010a1b';
