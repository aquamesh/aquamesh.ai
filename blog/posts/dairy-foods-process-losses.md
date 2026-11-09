---
title: Why dairy plants miss their most costly process losses
slug: dairy-foods-process-losses
date: 2026-10-12
section: In the press
description: Milk solids lost during transitions often go unmeasured. A Dairy Foods contributed article on spectral sensing and context for finding them.
tags: dairy, product loss, CIP, spectral sensing, process water, Dairy Foods
---

Dairy Foods published a contributed article by Alex Towfigh, AquaMesh's founder and CEO, on 12 October 2026. The full piece is on the Dairy Foods site: [Why dairy plants still miss their most expensive process losses](https://www.dairyfoods.com/articles/99452-why-dairy-plants-still-miss-their-most-expensive-process-losses).

What follows is a short summary with additional context. The article itself is exclusive to Dairy Foods.

## The scale of the problem

A dairy processing facility moves large volumes of product through shared piping continuously. Industry estimates put routine milk-to-sewer losses at one to three percent of the milk a plant processes per year. At a mid-size fluid milk plant processing 500,000 pounds per day, that range translates to roughly 1,500 to 4,500 pounds of milk solids entering the wastewater stream daily, before a single equipment failure or operator error occurs.

The losses do not show up as a single large event. They accumulate across hundreds of small decisions made every shift: when to divert, when to release the line, when to call a CIP complete. A quarterly accounting of milk-to-drain volume often looks like normal shrinkage until individual transitions are examined one at a time.

Federal effluent guidelines for dairy products processing set BOD and TSS limits on wastewater discharge ([40 CFR Part 405](https://www.ecfr.gov/current/title-40/chapter-I/subchapter-N/part-405); see also the [EPA Dairy Products Processing Effluent Guidelines](https://www.epa.gov/eg/dairy-products-processing-effluent-guidelines)). A plant's permit reflects those limits, but a permit only tells you whether the total load passed the threshold. It says nothing about which transitions produced the loss or what tighter endpoint detection would have recovered.

## The argument in brief

**The losses happen during transitions.** Published research puts routine losses of milk to sewer at 1% to 3% of the milk a plant processes. Most of it leaves during startups, interruptions, shutdowns and rinses: short windows where the pipe contents change and someone has to decide where product ends and water begins.

**More tags do not fix a missing measurement.** Conductivity tells you something changed, but not how much product is in the line. A flowmeter tells you how much is moving, but not what it is. Lab results come back after the decision has been made. If the plant never measured the chemistry, software running on the historian has nothing to analyze.

**Spectral sensing helps, if it can be trusted.** An optical spectrum carries far more information than a single-variable sensor. But temperature, bubbles, solids and a fouled window all move the reading. Without local calibration, a dirty window can look like a product loss, so every reading needs a confidence level attached.

**Context decides what a signal means.** Rising conductivity is expected during caustic circulation and alarming during a product transfer. The article describes starting from data the plant already has (CIP steps, valve positions, lab results) to establish operating state, adding sensing only where a real blind spot exists, and producing an explanation of what changed and why rather than another generic alarm.

**Prove it one event at a time.** Start read-only. Existing controls and sanitation checks stay in charge. Pick one expensive event, measure its baseline, catch it earlier, change the decision, and verify the result. One peer-reviewed UHT cleaning study cited in the piece used phase-endpoint measurement to cut a cleaning sequence from 142 to 66 minutes and roughly halve its effluent.

## Why CIP cycles are worth measuring closely

CIP is where most of the volume decision happens. A caustic wash, rinse, acid wash and final rinse can each carry residual product if the endpoint is missed. Many plants time their steps rather than measure them: the rinse runs for three minutes because that has worked in the past. Three minutes is a proxy for conductivity dropping below a threshold, which is itself a proxy for product concentration falling low enough to release the line.

Measuring directly, using a sensor that distinguishes caustic from milk fat from clean water, collapses that chain of proxies. It also creates an audit trail: was this CIP event as clean as the last one? If conductivity at the drain started high and ended high, that is a different failure than a rinse that ran long but ended clean. The sensor data makes the diagnosis available in real time rather than weeks later when a customer complaint or effluent exceedance arrives.

The UHT study cited in the Dairy Foods article is a useful benchmark. Cutting cycle time from 142 to 66 minutes is not a marginal gain; it changes the economics of the line. The same logic applies to the product-to-water transition at the start of a run: an earlier, more accurate determination of when to divert lets the plant recover product that would otherwise go to drain.

This connects to the same measurement challenge described in [why parallel equipment drifts and what it costs](/blog/why-parallel-equipment-drifts.html) and the broader case in [what 25 days of historian data reveals](/blog/what-25-days-of-historian-data-shows.html): the historian typically has flow and conductivity records; what it lacks is component-level identification that turns a conductivity trend into a recoverable, accountable event.

## Next step

If your facility has a CIP loop or product-to-water transition that runs on timers rather than direct measurement, AquaMesh can show what an instrumented baseline looks like at one point in that system. [Request a demo](/contact.html) or read the full article on the Dairy Foods site.

[Read the full article in Dairy Foods](https://www.dairyfoods.com/articles/99452-why-dairy-plants-still-miss-their-most-expensive-process-losses).
