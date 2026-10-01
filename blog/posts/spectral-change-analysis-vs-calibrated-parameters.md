---
title: Spectral change analysis, and why we calibrate only BOD
slug: spectral-change-analysis-vs-calibrated-parameters
date: 2026-09-22
section: Measurement
description: Most online analysers sell you a parameter list. A spectrum is a different kind of instrument, and pretending otherwise is how vendors end up over-promising. Here is the distinction and why it matters.
tags: UV-Vis, spectral analysis, BOD, COD, online water quality monitoring, surrogate parameters
---

An online water quality analyser usually arrives with a list: COD, BOD, TSS, nitrate, TOC. The list is the product. The implication is that the instrument measures each of those things the way a lab measures them, only continuously.

That is not how spectral measurement works, and the gap between how it is sold and how it behaves is where a lot of disappointment comes from.

## What the instrument actually produces

A UV/Vis probe does one thing: it measures how much light the water absorbs across a range of wavelengths, many times a second. What comes back is a curve — an absorbance spectrum. That curve is the raw measurement. Everything else is interpretation.

Converting that curve into "COD = 212 mg/L" requires a model that maps spectral shape to a lab value. Such models exist, they can be built, and for some parameters on some streams they are good. But they carry conditions that rarely survive contact with a real plant:

- They are **site-specific**. A model built on one plant's water does not transfer to another's.
- They **drift with composition**. Change the recipe, the season, the raw material or the upstream process, and the relationship between spectrum and lab value moves.
- They **degrade quietly**. A calibration that has stopped being right does not announce it. It keeps producing plausible numbers.

The result is an instrument that was sold as five parameters and is trusted for none of them within a year.

## The alternative: watch the spectrum move

There is a different use of the same hardware, and in a plant it is usually the more valuable one.

Instead of asking *what is the concentration*, ask *has the fingerprint changed, and what does that change correlate with*. Build a one-time model of what the plant's own stream normally looks like. Then watch for deviation from that reference, and tie the deviation to what the plant was doing at the time — feed rate, wash flow, machine state, cleaning records.

This is a materially easier question to answer well, and it is insensitive to the things that break calibrations:

- It does not need an absolute value, so it does not need to hold an absolute calibration
- It survives recipe and seasonal variation, because the reference is the plant's own product
- A drifting baseline shows up as drift rather than as a wrong number presented confidently

What you lose is the ability to report a concentration to a regulator. What you gain is an instrument that is still telling the truth in eighteen months.

## So why calibrate BOD at all

Because sometimes a number is the point.

Biochemical oxygen demand is the parameter that drives sewer surcharges, appears on discharge permits, and determines whether a load is going to cause a problem downstream. "The spectrum moved" is not an answer when the question is whether you are about to exceed a threshold that gets billed by the pound.

So BOD is the one parameter we calibrate, built against the customer's own reference samples. Their lab stays the method of record. The calibration fills the hours between the samples the lab already takes, rather than replacing them.

Everything else the probe produces is change analysis, and we describe it that way.

## Why be this specific about it

Partly because it is true, and a claim that is not true gets found out in a technical review.

But mostly because the honest version is a better product story. "We measure sixteen parameters" invites a comparison against instruments from companies with thirty years of calibration work behind them, on a spec sheet, where we would lose. "We watch the whole spectrum for change and tell you what it correlates with in your plant, and we calibrate BOD to your lab" is a different claim, and a parameter list does not answer it.

It also sets expectations that survive deployment. An operator who was told they were getting continuous COD and finds the number drifting stops trusting the instrument. An operator who was told they were getting an early warning that something in the water changed, and gets exactly that, keeps using it.

## What this means in practice

For a plant considering continuous optical measurement, three questions are worth asking any vendor:

1. **Which parameters are calibrated against my samples, and which are inferred?** The answer should be short and specific.
2. **What happens to the calibration when my feedstock changes?** If the answer is vague, assume it drifts.
3. **What is the instrument useful for if I never calibrate anything?** A good spectral instrument still earns its place as a change detector. A repackaged parameter list does not.

## Where this sits in the stack

Measurement is only half of it. A spectrum that moved is not an action — it becomes useful when it is correlated with plant state, attributed to a unit, and priced.

That is the division of labour: the probe reads the stream, the platform works out what the change means and what it is worth, and the operator decides what to do about it.

More on what the sensor is used for by sector: [food and beverage](/industries/food-beverage.html), [industrial water](/industries/industrial-water.html), [pharma and biotech](/industries/pharma-biotech.html).
