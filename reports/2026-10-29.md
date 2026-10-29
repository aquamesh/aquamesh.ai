# SEO agent report, 2026-10-29

**1 error, 40 warnings** on 33 pages of https://aquamesh.ai. Since the last run: 2 new, 3 resolved.

## What I did
- Rebuilt the blog from committed sources: output already matches, nothing to commit.
- Crawled 33 live pages and 50 assets and files, plus 38 external links.
- IndexNow: no page content changed since the last run, nothing to submit.
- Ran Lighthouse (mobile) on 5 pages.
- Asked an AI answer engine 10 buyer questions; aquamesh.ai was cited in 1 ($0.419).

## Changed since last run
New:
- **external-link-broken** (1)
  - `/insights/spectral-sensing-ai-industrial-water.html`: links to https://hero.epa.gov/reference/1650333/ (unreachable)
- **cwv-cls** (1)
  - `/`: CLS 0.159 (good is under 0.1)
Resolved:
- **cwv-lcp** (2)
  - `/case-studies/water-reuse-plant.html`: LCP 2.5s on mobile (good is under 2.5s); element: <p class="lead">
  - `/industries/industrial-water.html`: LCP 2.9s on mobile (good is under 2.5s); element: <img src="../assets/industries/industrial-water.jpg" width="1000" height="666" fetchpriority="high" decoding="async" alt="A treatment basin at an operating wate
- **cwv-cls** (1)
  - `/case-studies/water-reuse-plant.html`: CLS 0.119 (good is under 0.1)

## Errors
- **cwv-lcp** (1)
  - `/`: LCP 4.1s on mobile (poor is over 4s); element: <p class="lead">

## AI search visibility (Claude web search, 2026-10-29)
aquamesh.ai was **cited in 1 of 10** answers and retrieved by the search in 1 of 10. Cost $0.419.

| Buyer question | Retrieved | Cited | Sources the answer cited |
|---|---|---|---|
| What is AquaMesh (aquamesh.ai) and what does it do? | #5 | **yes** | aquamesh.ai, connect.org, prlog.org |
| What AI software helps industrial water and wastewater plants cut operating costs? | no | no | aquasight.io, theturingcompany.com, gihub.org, link.springer.com, wteinfra.com |
| How can an industrial plant find energy and chemical savings in the historian data it already records? | no | no | factry.io, alliedsolutionsglobal.com, powermag.com, ifactoryapp.com |
| How much of a wastewater treatment plant's electricity goes to aeration, and how do plants reduce it? | no | no | ssiaeration.com, fwpcoa.org, esource.bizenergyadvisor.com, mdpi.com, link.springer.com |
| Why do parallel blowers or pumps at a treatment plant drift apart in performance, and what does that cost? | no | no | wwdmag.com, iwaponline.com, modernpumpingtoday.com, blowervacuumbestpractices.com, inovairblowers.com |
| How does intermittent aeration work for nitrogen removal, and how precise do dissolved oxygen sensors need to be? | no | no | pmc.ncbi.nlm.nih.gov, ncbi.nlm.nih.gov, pubmed.ncbi.nlm.nih.gov, onlinelibrary.wiley.com, image-ppubs.uspto.gov |
| What does data center water usage effectiveness (WUE) measure, and what does it miss? | no | no | congress.gov, datacenterslist.com, m247global.com, akcp.com, agupubs.onlinelibrary.wiley.com |
| What do California's new data center water use reporting rules require? | no | no | allenmatkins.com, unite.ai, hklaw.com, mondaq.com, mayerbrown.com |
| Can UV-Vis spectral sensors monitor industrial wastewater continuously instead of lab samples? | no | no | ysi.com, ncbi.nlm.nih.gov, envirotech-online.com, xylem.com, researchgate.net |
| How do you control cooling tower blowdown by conductivity, and what happens when the sensor drifts? | no | no | none |

How the engine describes AquaMesh when asked "What is AquaMesh (aquamesh.ai) and what does it do?":

> **AquaMesh** is a San Diego-based industrial AI company focused on water operations. It's building physical AI to help industrial facilities produce more, waste less and prevent expensive problems.
> 
> **What it does**
> - It combines industrial water AI analytics, existing SCADA data and targeted UV/Vis spectral sensing. The goal is to detect losses, diagnose causes and support operator-approved optimization.
> - The platform detects a problem, finds its likely cause, predicts the cost or operational consequence, recommends a response and verifies the result.
> - It puts a price on what a plant is losing (product, energy, chemicals, downtime) and tells operators which change pays the most.
> - An on-s

## Core Web Vitals, lab (mobile, 2026-10-29)
| Page | Perf | SEO | A11y | LCP | CLS | TBT |
|---|---|---|---|---|---|---|
| `/` | 79 | 100 | 97 | 4.1s | 0.159 | 0 ms |
| `/blog/` | 92 | 100 | 100 | 1.6s | 0.16 | 0 ms |
| `/blog/cooling-tower-blowdown-conductivity-sensor-drift.html` | 97 | 100 | 100 | 1.7s | 0.092 | 0 ms |
| `/case-studies/water-reuse-plant.html` | 99 | 100 | 100 | 1.6s | 0.04 | 0 ms |
| `/industries/industrial-water.html` | 91 | 100 | 100 | 2.4s | 0.146 | 0 ms |

<details><summary><b>40 warnings</b></summary>

- **desc-length** (13)
  - `/`: meta description is 183 chars (aim for 70 to 160)
  - `/case-studies/phosphate-complex.html`: meta description is 176 chars (aim for 70 to 160)
  - `/case-studies/refinery-complex.html`: meta description is 192 chars (aim for 70 to 160)
  - `/blog/cooling-tower-blowdown-conductivity-sensor-drift.html`: meta description is 227 chars (aim for 70 to 160)
  - `/blog/intermittent-aeration-nitrogen-removal-do-control.html`: meta description is 209 chars (aim for 70 to 160)
  - `/blog/aeration-energy-cost-wastewater-plants.html`: meta description is 200 chars (aim for 70 to 160)
  - `/blog/dairy-foods-process-losses.html`: meta description is 179 chars (aim for 70 to 160)
  - `/blog/data-center-wue-measurement-gap.html`: meta description is 209 chars (aim for 70 to 160)
  - `/blog/california-data-center-water-reporting.html`: meta description is 211 chars (aim for 70 to 160)
  - `/blog/connect-press-release-physical-ai.html`: meta description is 189 chars (aim for 70 to 160)
  - `/blog/why-parallel-equipment-drifts.html`: meta description is 193 chars (aim for 70 to 160)
  - `/blog/spectral-change-analysis-vs-calibrated-parameters.html`: meta description is 201 chars (aim for 70 to 160)
  - and 1 more
- **title-length** (11)
  - `/case-studies/refinery-complex.html`: title is 73 chars; Google truncates near 60: "Saudi Integrated Refinery & Petrochemical Complex — case study | AquaMesh"
  - `/blog/cooling-tower-blowdown-conductivity-sensor-drift.html`: title is 102 chars; Google truncates near 60: "Cooling tower blowdown control: what conductivity sensor drift costs in water and chemicals | AquaMesh"
  - `/blog/water-online-sewer-repair-evidence.html`: title is 105 chars; Google truncates near 60: "In Water Online: the $1.5 million sewer repair and the water-quality evidence missing upstream | AquaMesh"
  - `/blog/intermittent-aeration-nitrogen-removal-do-control.html`: title is 97 chars; Google truncates near 60: "Intermittent aeration for nitrogen removal: what DO sensor precision actually controls | AquaMesh"
  - `/blog/aeration-energy-cost-wastewater-plants.html`: title is 93 chars; Google truncates near 60: "Aeration energy at wastewater plants: the cost, the waste, and the measurement gap | AquaMesh"
  - `/blog/dairy-foods-process-losses.html`: title is 90 chars; Google truncates near 60: "In Dairy Foods: why dairy plants still miss their most expensive process losses | AquaMesh"
  - `/blog/data-center-wue-measurement-gap.html`: title is 98 chars; Google truncates near 60: "Data center WUE: what the metric measures, what it misses, and what it takes to move it | AquaMesh"
  - `/blog/california-data-center-water-reporting.html`: title is 92 chars; Google truncates near 60: "California now asks data centers what they actually use, under penalty of perjury | AquaMesh"
  - `/blog/connect-press-release-physical-ai.html`: title is 111 chars; Google truncates near 60: "Press release: AquaMesh builds physical AI to help industrial facilities catch costly problems early | AquaMesh"
  - `/blog/why-parallel-equipment-drifts.html`: title is 70 chars; Google truncates near 60: "Why parallel equipment drifts apart, and what the gap costs | AquaMesh"
  - `/blog/what-25-days-of-historian-data-shows.html`: title is 80 chars; Google truncates near 60: "What 25 days of historian data actually shows about a treatment plant | AquaMesh"
- **og-missing** (4)
  - `/privacy.html`: missing og:title, og:description; link previews degrade
  - `/cookies.html`: missing og:title, og:description; link previews degrade
  - `/terms.html`: missing og:title, og:description; link previews degrade
  - `/do-not-sell.html`: missing og:title, og:description; link previews degrade
- **jsonld-article-fields** (3)
  - `/insights/metal-finishing-rinse-control-decisions.html`: Article missing image
  - `/insights/liquid-cooling-water-quality-decisions.html`: Article missing image
  - `/insights/water-reuse-monitoring-failure-modes.html`: Article missing image
- **cwv-cls** (3)
  - `/`: CLS 0.159 (good is under 0.1)
  - `/blog/`: CLS 0.16 (good is under 0.1)
  - `/industries/industrial-water.html`: CLS 0.146 (good is under 0.1)
- **jsonld-missing** (2)
  - `/case-studies/phosphate-complex.html`: no JSON-LD structured data
  - `/case-studies/refinery-complex.html`: no JSON-LD structured data
- **html-weight** (2)
  - `/case-studies/phosphate-complex.html`: HTML is 1383 KB
  - `/case-studies/refinery-complex.html`: HTML is 1841 KB
- **external-link-broken** (2)
  - `/blog/why-parallel-equipment-drifts.html`: links to https://www.energy.gov/sites/default/files/2014/05/f15/improving_pumping_system_performance.pdf (404)
  - `/insights/spectral-sensing-ai-industrial-water.html`: links to https://hero.epa.gov/reference/1650333/ (unreachable)

</details>

## Opportunities
- **geo-few-sources** (1)
  - `/blog/what-25-days-of-historian-data-shows.html`: cites 1 outside source(s); AI answer engines favour pages that cite primary sources
- **geo-org-author** (1)
  - `/blog/`: 11 posts credit the Organization as author. A named, real author with a bio page is a trust signal for Google and AI answer engines (needs Alex's OK to name someone)

---
Daily at 13:40 UTC from `.github/workflows/seo-agent.yml`; weekly checks (Lighthouse, AI search, external links) ran this time. It only ever commits files that `scripts/build-blog.mjs` generates. Off switch: repository variable `SEO_AGENT=off`; report-only: `SEO_AGENT_AUTOFIX=off`. History lives on the `seo-agent-data` branch.
