---
title: California now asks data centers what they actually use, under penalty of perjury
slug: california-data-center-water-reporting
date: 2026-10-01
section: Regulation
description: Two bills signed on 21 September split a data center's water into total and direct use, by source, on every business license renewal. A third requirement lands in 2028. Most sites cannot currently answer either.
image: assets/compute-blade.jpg
tags: data centers, water reporting, AB 2619, AB 2469, cooling water, water reuse, California
---

On 21 September 2026 the Governor of California signed [AB 2619](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260AB2619), now Chapter 437 of the 2026 Statutes, and [AB 2469](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260AB2469) alongside it. Between them they change what a data center operator in California has to be able to say about water, and when.

The reporting obligation is the part worth reading closely, because it is more specific than the coverage suggests.

## What AB 2619 actually asks for

AB 2619 works through the business license process rather than through a new permit. It sorts data centers into three types: Type I, or hyperscale, at more than 10,000 servers or more than 25 megawatts; Type II between 2 and 25 megawatts; and Type III below 2 megawatts.

At initial application, the operator gives the water supplier, and repeats on the license application form, a good faith estimate of expected water use, the anticipated source, and projected volume for the maximum day, the maximum month, and the average year.

At every renewal, the operator reports the preceding calendar year's annual water use — and here the statute is precise — "including total water use and direct water use," along with the cooling system type.

Direct annual water use is defined in the bill as:

> The volume of water withdrawn, delivered, or otherwise used onsite for data center operations, including cooling, sanitation, irrigation, and any other operational use, identified by source, including potable water, nonpotable water, or recycled water.

All of it under penalty of perjury.

Two things in that definition do the work. The first is *identified by source* — potable, nonpotable, recycled, broken out, not aggregated. The second is the split between total and direct, which means a single number off the utility bill does not satisfy the renewal requirement.

One correction worth making, because it has circulated widely: several summaries describe AB 2619 as requiring disclosure of *indirect* water use, meaning the water consumed generating the site's electricity. The enacted text does not define indirect use and does not require it. If you are scoping a compliance programme, scope it to what the statute says.

## What AB 2469 adds, and the 2028 date

AB 2469 operates on the other side of the counter. It applies to cities and counties approving discretionary or ministerial permits for data center construction or expansion that increases maximum peak water use, and it requires a Water Supply Assessment under [Water Code section 10910 et seq.](https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=WAT&division=6.&title=&part=2.10.&chapter=&article=), projected water use and efficiency measures, workforce disclosures, and an undertaking that the applicant carries the full cost of any water conveyance, treatment, storage or distribution infrastructure the project needs.

Effective 1 January 2028, it also requires a Water Scarcity Plan. That plan has to set out measures for five named conditions — an abnormally dry year, and moderate, severe, extreme and exceptional drought years — including staged reductions, curtailment, recycling and reuse, thermal load reductions, and load shedding.

AB 2469 does not mandate closed-loop cooling. Some coverage says it does. It does not.

## The gap this opens

A Water Scarcity Plan is a commitment to cut consumption by a stated amount under stated conditions, written down in advance, in front of a permitting authority. Writing a credible one requires knowing two things that many sites do not currently know with any precision.

The first is where the water is going now, by loop and by source. Evaporative cooling, blowdown, makeup, sanitation and irrigation are different lines with different elasticities, and a site that only knows its total has no basis for saying which it would cut first.

The second is how far each one can be cut before something else breaks. Curtailment on a cooling tower usually means running at higher cycles of concentration — less blowdown, less makeup, and a circuit that is now closer to the scaling and corrosion limits of its own chemistry. Recycling and reuse, both named in the statute, move in the same direction. The water you keep in the loop is water whose composition is drifting.

That is the real operational content of a scarcity plan. It is not a reporting exercise, it is a commitment to run the plant closer to its limits on demand, and the plan is only as good as the site's ability to see what happens when it does.

## Where measurement earns its place

Volumes are a flow metering problem, and the renewal report in AB 2619 is largely a question of whether a site is instrumented well enough to break its own consumption apart by source. Many are not, and 2027's renewals will be the first time that shows up with a perjury declaration attached.

Composition is a different problem, and it is the one that decides whether a curtailment commitment is safe to make. A plant running higher cycles, or taking a recycled source that was not in the original design basis, is operating a water chemistry that moves. [Spectral change analysis](/blog/spectral-change-analysis-vs-calibrated-parameters.html) is a reasonable fit here precisely because it does not depend on having a calibrated panel for every constituent that might matter — it watches the spectrum for what is correlating with something the operator cares about, and flags when that relationship moves. BOD is the one parameter AquaMesh calibrates; the rest is change detection.

For sites that already have a few months of history in a historian, the first question is usually answerable from data that exists. [What 25 days of one plant's data showed](/blog/what-25-days-of-historian-data-shows.html) is a reasonable picture of what that kind of look turns up, and it was not a water reporting exercise — it was a cost exercise that happened to require knowing where things actually go.

Nothing in either bill requires a sensor. Both require a site to be able to answer questions about its own water that a surprising number of operators currently answer by estimate. The first renewals under AB 2619 will establish how much tolerance there is for that, and the 2028 scarcity plans will establish how much tolerance there is for a commitment that nobody has tested.

Operators working through what this means for an existing site can see how we approach [data center cooling water](/industries/data-centers.html), or start with an audit of the data already being collected.
