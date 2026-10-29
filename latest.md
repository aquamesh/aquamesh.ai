# SEO agent report, 2026-10-28

**1 error, 41 warnings** on 33 pages of https://aquamesh.ai. Since the last run: 1 new, 3 resolved.

## What I did
- Rebuilt the blog from committed sources: output already matches, nothing to commit.
- Crawled 33 live pages and 50 assets and files, plus 38 external links.
- IndexNow: no page content changed since the last run, nothing to submit.
- Ran Lighthouse (mobile) on 5 pages.
- Asked an AI answer engine 10 buyer questions; aquamesh.ai was cited in 0 ($0.684).

## Changed since last run
New:
- **cwv-cls** (1)
  - `/case-studies/water-reuse-plant.html`: CLS 0.119 (good is under 0.1)
Resolved:
- **cwv-cls** (1)
  - `/`: CLS 0.16 (good is under 0.1)
- **cwv-tbt** (1)
  - `/`: Total blocking time 209 ms (good is under 200 ms)
- **cwv-lcp** (1)
  - `/blog/`: LCP 2.5s on mobile (good is under 2.5s)

## Errors
- **cwv-lcp** (1)
  - `/`: LCP 5.0s on mobile (poor is over 4s); element: <p class="lead">

## AI search visibility (Claude web search, 2026-10-28)
aquamesh.ai was **cited in 0 of 10** answers and retrieved in 1. Cost $0.684.

| Buyer question | Retrieved | Cited | Sources the answer cited |
|---|---|---|---|
| What is AquaMesh (aquamesh.ai) and what does it do? | #5 | no | none |
| What AI software helps industrial water and wastewater plants cut operating costs? | no | no | none |
| How can an industrial plant find energy and chemical savings in the historian data it already records? | no | no | none |
| How much of a wastewater treatment plant's electricity goes to aeration, and how do plants reduce it? | no | no | none |
| Why do parallel blowers or pumps at a treatment plant drift apart in performance, and what does that cost? | no | no | none |
| How does intermittent aeration work for nitrogen removal, and how precise do dissolved oxygen sensors need to be? | no | no | none |
| What does data center water usage effectiveness (WUE) measure, and what does it miss? | no | no | none |
| What do California's new data center water use reporting rules require? | no | no | none |
| Can UV-Vis spectral sensors monitor industrial wastewater continuously instead of lab samples? | no | no | none |
| How do you control cooling tower blowdown by conductivity, and what happens when the sensor drifts? | no | no | none |

How the engine describes AquaMesh when asked "What is AquaMesh (aquamesh.ai) and what does it do?":

> **AquaMesh** is a San Diego-based industrial AI company. It describes its work as building physical AI to help industrial facilities produce more, waste less and prevent expensive problems before they happen.
> 
> **What it does**
> - It combines industrial water AI analytics, existing SCADA data and targeted UV/Vis spectral sensing. The aim is to detect losses, diagnose causes and support operator-approved optimization.
> - It prices what a plant is losing (product, energy, chemicals, downtime) and tells operators which change pays the most that week.
> - It is advisory by default. It recommends, operators decide, and nothing writes to the control system.
> 
> **Products**
> - AquaSpectra Probe is an optic

## Core Web Vitals, lab (mobile, 2026-10-28)
| Page | Perf | SEO | A11y | LCP | CLS | TBT |
|---|---|---|---|---|---|---|
| `/` | 75 | 100 | 97 | 5.0s | 0.036 | 172 ms |
| `/blog/` | 87 | 100 | 100 | 2.5s | 0.16 | 0 ms |
| `/blog/cooling-tower-blowdown-conductivity-sensor-drift.html` | 92 | 100 | 100 | 2.5s | 0.092 | 0 ms |
| `/case-studies/water-reuse-plant.html` | 90 | 100 | 100 | 2.5s | 0.119 | 0 ms |
| `/industries/industrial-water.html` | 86 | 100 | 100 | 2.9s | 0.146 | 0 ms |

<details><summary><b>41 warnings</b></summary>

- **desc-length** (13)
  - `/`: meta description is 183 chars (aim for 70 to 160)
  - `/case-studies/`: meta description is 250 chars (aim for 70 to 160)
  - `/case-studies/refinery-complex.html`: meta description is 192 chars (aim for 70 to 160)
  - `/case-studies/phosphate-complex.html`: meta description is 176 chars (aim for 70 to 160)
  - `/blog/cooling-tower-blowdown-conductivity-sensor-drift.html`: meta description is 227 chars (aim for 70 to 160)
  - `/blog/data-center-wue-measurement-gap.html`: meta description is 209 chars (aim for 70 to 160)
  - `/blog/intermittent-aeration-nitrogen-removal-do-control.html`: meta description is 209 chars (aim for 70 to 160)
  - `/blog/aeration-energy-cost-wastewater-plants.html`: meta description is 200 chars (aim for 70 to 160)
  - `/blog/dairy-foods-process-losses.html`: meta description is 179 chars (aim for 70 to 160)
  - `/blog/connect-press-release-physical-ai.html`: meta description is 189 chars (aim for 70 to 160)
  - `/blog/california-data-center-water-reporting.html`: meta description is 211 chars (aim for 70 to 160)
  - `/blog/spectral-change-analysis-vs-calibrated-parameters.html`: meta description is 201 chars (aim for 70 to 160)
  - and 1 more
- **title-length** (11)
  - `/case-studies/refinery-complex.html`: title is 73 chars; Google truncates near 60: "Saudi Integrated Refinery & Petrochemical Complex — case study | AquaMesh"
  - `/blog/cooling-tower-blowdown-conductivity-sensor-drift.html`: title is 102 chars; Google truncates near 60: "Cooling tower blowdown control: what conductivity sensor drift costs in water and chemicals | AquaMesh"
  - `/blog/data-center-wue-measurement-gap.html`: title is 98 chars; Google truncates near 60: "Data center WUE: what the metric measures, what it misses, and what it takes to move it | AquaMesh"
  - `/blog/intermittent-aeration-nitrogen-removal-do-control.html`: title is 97 chars; Google truncates near 60: "Intermittent aeration for nitrogen removal: what DO sensor precision actually controls | AquaMesh"
  - `/blog/water-online-sewer-repair-evidence.html`: title is 105 chars; Google truncates near 60: "In Water Online: the $1.5 million sewer repair and the water-quality evidence missing upstream | AquaMesh"
  - `/blog/aeration-energy-cost-wastewater-plants.html`: title is 93 chars; Google truncates near 60: "Aeration energy at wastewater plants: the cost, the waste, and the measurement gap | AquaMesh"
  - `/blog/dairy-foods-process-losses.html`: title is 90 chars; Google truncates near 60: "In Dairy Foods: why dairy plants still miss their most expensive process losses | AquaMesh"
  - `/blog/what-25-days-of-historian-data-shows.html`: title is 80 chars; Google truncates near 60: "What 25 days of historian data actually shows about a treatment plant | AquaMesh"
  - `/blog/connect-press-release-physical-ai.html`: title is 111 chars; Google truncates near 60: "Press release: AquaMesh builds physical AI to help industrial facilities catch costly problems early | AquaMesh"
  - `/blog/california-data-center-water-reporting.html`: title is 92 chars; Google truncates near 60: "California now asks data centers what they actually use, under penalty of perjury | AquaMesh"
  - `/blog/why-parallel-equipment-drifts.html`: title is 70 chars; Google truncates near 60: "Why parallel equipment drifts apart, and what the gap costs | AquaMesh"
- **og-missing** (4)
  - `/privacy.html`: missing og:title, og:description; link previews degrade
  - `/cookies.html`: missing og:title, og:description; link previews degrade
  - `/do-not-sell.html`: missing og:title, og:description; link previews degrade
  - `/terms.html`: missing og:title, og:description; link previews degrade
- **jsonld-article-fields** (3)
  - `/insights/metal-finishing-rinse-control-decisions.html`: Article missing image
  - `/insights/water-reuse-monitoring-failure-modes.html`: Article missing image
  - `/insights/liquid-cooling-water-quality-decisions.html`: Article missing image
- **cwv-cls** (3)
  - `/blog/`: CLS 0.16 (good is under 0.1)
  - `/case-studies/water-reuse-plant.html`: CLS 0.119 (good is under 0.1)
  - `/industries/industrial-water.html`: CLS 0.146 (good is under 0.1)
- **jsonld-missing** (2)
  - `/case-studies/refinery-complex.html`: no JSON-LD structured data
  - `/case-studies/phosphate-complex.html`: no JSON-LD structured data
- **html-weight** (2)
  - `/case-studies/refinery-complex.html`: HTML is 1841 KB
  - `/case-studies/phosphate-complex.html`: HTML is 1383 KB
- **cwv-lcp** (2)
  - `/case-studies/water-reuse-plant.html`: LCP 2.5s on mobile (good is under 2.5s); element: <p class="lead">
  - `/industries/industrial-water.html`: LCP 2.9s on mobile (good is under 2.5s); element: <img src="../assets/industries/industrial-water.jpg" width="1000" height="666" fetchpriority="high" decoding="async" alt="A treatment basin at an operating wate
- **external-link-broken** (1)
  - `/blog/why-parallel-equipment-drifts.html`: links to https://www.energy.gov/sites/default/files/2014/05/f15/improving_pumping_system_performance.pdf (404)

</details>

## Opportunities
- **geo-few-sources** (1)
  - `/blog/what-25-days-of-historian-data-shows.html`: cites 1 outside source(s); AI answer engines favour pages that cite primary sources
- **geo-org-author** (1)
  - `/blog/`: 11 posts credit the Organization as author. A named, real author with a bio page is a trust signal for Google and AI answer engines (needs Alex's OK to name someone)

---
Daily at 13:40 UTC from `.github/workflows/seo-agent.yml`; weekly checks (Lighthouse, AI search, external links) ran this time. It only ever commits files that `scripts/build-blog.mjs` generates. Off switch: repository variable `SEO_AGENT=off`; report-only: `SEO_AGENT_AUTOFIX=off`. History lives on the `seo-agent-data` branch.
