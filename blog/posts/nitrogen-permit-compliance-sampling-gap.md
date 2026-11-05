---
title: NPDES nitrogen permit compliance: the DMR sampling gap
slug: nitrogen-permit-compliance-sampling-gap
date: 2026-11-05
section: Regulation
description: NPDES nitrogen permits assess compliance from a handful of sampled days. The unsampled days are invisible to the DMR. Here is why that gap matters.
tags: nitrogen, NPDES, permit compliance, wastewater, monitoring, DMR, effluent limits
---

A wastewater plant producing average effluent total nitrogen of 6 mg/L against a monthly average permit limit of 8 mg/L looks comfortable on paper. The treatment is working. The monthly discharge monitoring reports (DMRs) are clean. But if that plant is sampling twice a week, its monthly compliance record is built from eight or nine data points. The 20 or 21 days that produce no sample are invisible to the permit record.

On those unsampled days, a process event -- a cold snap reducing nitrifier activity, a storm event diluting the activated sludge, a biosolids return load arriving at the wrong time in the cycle -- could push effluent nitrogen well above the daily maximum limit. It will not appear in the DMR. And the plant has no data to show it did not happen.

This is the compliance exposure that most discussions about nitrogen permit compliance skip. Getting to a low average is a treatment problem. Knowing what your process was doing between sample events is a measurement problem.

**A wastewater plant sampling twice a week builds its monthly compliance record from 8 or 9 data points. The other 21 days are invisible to the DMR.**

## How NPDES nitrogen permits are structured

Under [40 CFR 122.44(d)(1)](https://www.ecfr.gov/current/title-40/chapter-I/subchapter-D/part-122/section-122.44), permit writers must set water quality-based effluent limits for a pollutant whenever technology-based limits alone are insufficient to protect receiving water quality standards. For nitrogen, this means permit limits are typically derived from the nutrient criteria applicable to the downstream waterbody -- a phosphorus-impaired estuary, a Chesapeake Bay tributary under nutrient trading regulations, or a nitrogen-sensitive groundwater recharge zone.

A typical nitrogen permit for a 5 to 50 MGD municipal wastewater treatment plant includes:

- A **monthly average limit (MAL)** -- the arithmetic mean of all valid samples collected in the calendar month
- A **weekly average limit** -- the mean of samples in any calendar week, typically set 1.5x the MAL
- In permits for sensitive receiving waters, a **daily maximum** -- a hard ceiling that no single composite sample should exceed

Compliance is assessed against the values the permittee reports in the monthly DMR, submitted under [40 CFR 122.41(l)](https://www.ecfr.gov/current/title-40/chapter-I/subchapter-D/part-122/section-122.41). The DMR calculation uses only the samples the permit requires the facility to collect. If the permit specifies twice-weekly grab samples for total nitrogen, the monthly compliance determination rests on those eight or nine values and nothing else.

A plant with a TN MAL of 8 mg/L, a weekly average limit of 12 mg/L, and a daily maximum of 20 mg/L is not at risk from exceedances its sampling program cannot detect -- unless it has a daily maximum limit and a process that can spike above 20 mg/L, or unless a state regulator or EPA inspector collects an independent sample on an unmonitored day.

## The math behind sampling gaps

The [EPA Nutrient Control Design Manual (2010)](https://www.epa.gov/sites/default/files/2015-06/documents/nutrient-control-design-manual-full.pdf) documents the process variability that biological nitrogen removal systems encounter in normal operation: influent load variation, diurnal flow patterns, seasonal temperature effects on nitrifier kinetics, return activated sludge rate fluctuations, and dissolved oxygen control performance all affect day-to-day effluent nitrogen. Plants designed to achieve 6 mg/L TN on an average day do not produce exactly 6 mg/L every day.

As a modelled example: consider a 10 MGD activated sludge plant with a TN monthly average limit of 8 mg/L, operating at a design-day average of 6 mg/L. Its permit requires twice-weekly composite samples. In a 30-day month, it submits nine valid TN values to the DMR. The remaining 21 days produce no sample.

If on two of those unsampled days a process event -- a sudden drop in aerobic zone dissolved oxygen during an intermittent aeration cycle, as described in [Intermittent aeration for nitrogen removal: what DO sensor precision actually controls](/blog/intermittent-aeration-nitrogen-removal-do-control.html) -- causes effluent TN to spike to 13 mg/L, the monthly average across all actual daily discharges would be approximately 6.4 mg/L. The DMR monthly average, calculated from the nine sampled days, might show 6.1 mg/L. Both are compliant. One is more accurate.

The gap between the two is not a records violation. It is simply what scheduled sampling is designed to produce: a statistically valid estimate of compliance, not a continuous record of actual discharge quality.

## Where the regulatory exposure lies

NPDES compliance is not self-reported in isolation. Under [40 CFR 122.41(h)](https://www.ecfr.gov/current/title-40/chapter-I/subchapter-D/part-122/section-122.41), permittees must allow EPA and state personnel to enter the facility and collect independent samples at any reasonable time. States and EPA Regions conduct Compliance Evaluation Inspections (CEIs) to verify that reported data is accurate and that effluent quality matches the DMR pattern.

An inspector who collects an independent grab sample on a day the facility did not sample, and finds a result significantly above the permit limit, has found something the DMR does not show. This does not automatically constitute a permit violation -- a single sample is not an MAL exceedance. But it can prompt a more intensive review, an accelerated inspection schedule, or a compliance schedule discussion.

The exposure is higher for plants in nutrient-sensitive watersheds where regulators are actively looking at effluent quality data. Chesapeake Bay basin states have operated nutrient trading programs since the 2000s; Virginia and Maryland permit writers have access to both DMR data and periodic independent sampling results. A plant with a persistent gap between its reported DMR quality and what independent sampling finds is in a difficult position to explain.

## What continuous process monitoring changes

A plant with continuous in-process monitoring -- real-time DO sensors, online nitrogen analyzers, or flow-proportional sampling systems calibrated to known performance curves -- does not eliminate the scheduled sampling requirement. It adds something the DMR cannot provide: a process record for every day of the month.

When an operator can see the aerobic zone DO dropping at 6 PM on a Tuesday, and the anoxic zone nitrate residual climbing the following morning, there is an opportunity to intervene before the effluent crosses a threshold. The data from the [What 25 days of historian data actually shows about a treatment plant](/blog/what-25-days-of-historian-data-shows.html) post illustrates how process variability that is invisible in scheduled compliance samples becomes apparent in continuous SCADA records.

For audit purposes, a continuous process record also provides something that no DMR can: a basis for demonstrating what the process was doing on days when no effluent sample was collected. That is a different compliance posture than a facility that can only show its nine sampled days were clean.

## A practical starting point

Most wastewater utilities do not have a clear picture of how much variability exists between their scheduled sample days. The facility knows its design-basis performance and trusts that scheduled samples are representative.

Whether they are representative depends on what the process was actually doing on the other 21 days of the month. That answer lives in the SCADA historian -- if it is being used. The [Aeration energy at wastewater plants: the cost, the waste, and the measurement gap](/blog/aeration-energy-cost-wastewater-plants.html) post covers what plant historian data typically shows about aeration performance variability across operating days. The [wastewater blower VFD energy savings erode](/blog/wastewater-blower-vfd-energy-savings-erode.html) post shows the same dynamic from the energy side: a DO sensor drifting between calibration events causes the control loop to optimize against the wrong input, with no alarm raised and no indication in the daily operational record until someone looks at the historian across a longer window. [DO sensor calibration intervals in activated sludge](/blog/do-sensor-calibration-interval-activated-sludge.html) covers how calibration frequency directly affects the measurement precision that determines when nitrogen compliance exposure builds.

Understanding your actual variability is the first step. It tells you whether your current monitoring program is adequate for the permit limits you are operating under -- and whether the unsampled days in your DMR represent a real exposure or a comfortable margin.

AquaMesh works with treatment plants and utilities to analyze existing plant data and identify where measurement programs could be doing more to support both operational control and compliance confidence. If you want to see what your process historian shows about the days between your compliance samples, [request a demo](https://aquamesh.ai/#contact).

*Alex Towfigh is a founder at AquaMesh.*
