/**
 * Core Web Vitals, lab-measured. The site is too new for CrUX field data and
 * the keyless PageSpeed API quota is shared and usually exhausted, so this
 * runs Lighthouse itself (mobile, simulated throttling) in the CI runner.
 * Numbers vary a little run to run; the report tracks them week over week.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const LIGHTHOUSE = 'lighthouse@13.5.0';

export async function lighthouse(url) {
  const { stdout } = await run('npx', ['-y', LIGHTHOUSE, url,
    '--output=json', '--output-path=stdout', '--quiet',
    '--only-categories=performance,accessibility,best-practices,seo',
    '--chrome-flags=--headless=new --no-sandbox --disable-gpu'
  ], { maxBuffer: 128 * 1024 * 1024, timeout: 240000 });
  const lhr = JSON.parse(stdout);
  const a = lhr.audits, c = lhr.categories;
  const score = (k) => (c[k]?.score == null ? null : Math.round(c[k].score * 100));
  return {
    url,
    performance: score('performance'),
    accessibility: score('accessibility'),
    bestPractices: score('best-practices'),
    seo: score('seo'),
    lcpMs: Math.round(a['largest-contentful-paint']?.numericValue ?? 0),
    cls: +(a['cumulative-layout-shift']?.numericValue ?? 0).toFixed(3),
    tbtMs: Math.round(a['total-blocking-time']?.numericValue ?? 0),
    fcpMs: Math.round(a['first-contentful-paint']?.numericValue ?? 0),
    failingSeo: (c.seo?.auditRefs || []).map(r => a[r.id]).filter(x => x && x.score !== null && x.score < 1 && x.scoreDisplayMode === 'binary').map(x => x.title),
    lcpElement: firstSnippet(a['largest-contentful-paint-element']?.details)?.slice(0, 160) || null
  };
}

/* the element's HTML sits at different depths across Lighthouse versions */
function firstSnippet(node) {
  if (!node || typeof node !== 'object') return null;
  if (node.type === 'node' && node.snippet) return node.snippet;
  for (const v of Object.values(node)) {
    const s = firstSnippet(v);
    if (s) return s;
  }
  return null;
}

/* Google's "good" thresholds, with TBT standing in for INP in the lab. */
export function vitalsFindings(r, prev) {
  const out = [];
  const f = (sev, id, msg) => out.push({ sev, id, url: r.url, msg });
  if (r.lcpMs > 4000) f('error', 'cwv-lcp', `LCP ${(r.lcpMs / 1000).toFixed(1)}s on mobile (poor is over 4s)${r.lcpElement ? `; element: ${r.lcpElement}` : ''}`);
  else if (r.lcpMs > 2500) f('warn', 'cwv-lcp', `LCP ${(r.lcpMs / 1000).toFixed(1)}s on mobile (good is under 2.5s)${r.lcpElement ? `; element: ${r.lcpElement}` : ''}`);
  if (r.cls > 0.25) f('error', 'cwv-cls', `CLS ${r.cls} (poor is over 0.25)`);
  else if (r.cls > 0.1) f('warn', 'cwv-cls', `CLS ${r.cls} (good is under 0.1)`);
  if (r.tbtMs > 600) f('error', 'cwv-tbt', `Total blocking time ${r.tbtMs} ms (a lab stand-in for INP)`);
  else if (r.tbtMs > 200) f('warn', 'cwv-tbt', `Total blocking time ${r.tbtMs} ms (good is under 200 ms)`);
  if (r.seo !== null && r.seo < 100 && r.failingSeo.length) f('warn', 'lighthouse-seo', `Lighthouse SEO ${r.seo}: ${r.failingSeo.join('; ')}`);
  if (prev?.performance != null && r.performance != null && prev.performance - r.performance >= 10) {
    f('warn', 'cwv-regression', `performance score fell from ${prev.performance} to ${r.performance} since last week`);
  }
  return out;
}
