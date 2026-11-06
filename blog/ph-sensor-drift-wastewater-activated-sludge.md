---
title: pH sensor drift in activated sludge: the cost of 0.5 units
slug: ph-sensor-drift-wastewater-activated-sludge
date: 2026-11-06
section: Field notes
description: A pH electrode drifting 0.5 units in an activated sludge basin drives unnecessary chemical dosing and masks nitrification risk. What that costs in practice.
tags: pH sensor, activated sludge, chemical dosing, nitrification, sensor drift, wastewater treatment, NPDES
---

A pH electrode running continuously in an activated sludge bioreactor rarely fails cleanly. It drifts. The glass membrane picks up biological film. The reference junction (the small porous frit that completes the electrical circuit) clogs with mixed liquor solids. By the time the weekly calibration reveals a 0.4-unit offset, the process controller has spent several days adding chemistry to correct a reading that was already wrong.

That is the problem this post addresses. Not sensor failure, but the quiet, accumulating cost of biased pH measurement in a biological nutrient removal process.

**Quotable insight: A pH sensor reading 6.8 when the bioreactor is actually at 7.3 is not a measurement problem: it is a chemical dosing problem and a compliance risk, compounded over every day between calibrations.**

---

## Why pH electrodes drift in activated sludge

Activated sludge is an unusually hostile medium for a glass pH electrode. Mixed liquor suspended solids (MLSS) in a typical activated sludge basin run between 1,500 and 4,000 mg/L. That biological mass contains filamentous organisms, extracellular polymeric substances, oils from influent, and carbonate and phosphate compounds that scale surfaces.

Three mechanisms drive drift in this environment:

**Liquid junction fouling.** The reference electrode inside a pH probe makes contact with the sample through a porous junction (typically a ceramic frit, a PTFE pin, or a fiber wick). In activated sludge, biological solids and scale progressively block that junction. As flow across the junction slows, a junction potential builds up that shifts the measured voltage in a direction that looks like a pH decrease. A frit junction that was calibrated in a clean buffer at 7.00 and then immersed in mixed liquor can read 0.2 to 0.5 units low within four to seven days, without any change in actual sample pH.

**Glass membrane fouling.** The glass membrane at the tip of the electrode is sensitive to surface charge. A thin biofilm or scale layer on the membrane blunts the response, increasing response time and flattening the measurement near the setpoint. This is less common than junction fouling but produces a different pattern: sluggish response to rapid pH swings rather than a steady offset.

**Temperature compensation errors.** Most in-line pH transmitters apply automatic temperature compensation (ATC) using the Nernst equation (59.16 mV/pH unit at 25 degrees C, adjusting with temperature). A fouled temperature sensor, or one positioned poorly relative to the pH sensor in a mixed liquor flow, can add a further 0.1 to 0.2 unit error under typical bioreactor conditions (16 to 28 degrees C).

The [EPA Nutrient Control Design Manual](https://www.epa.gov/sites/default/files/2019-04/documents/nutrient-control-design-manual-epa-600-r-10-100.pdf) notes that pH is one of the most important parameters to maintain in biological nutrient removal (BNR) processes, with nitrification strongly affected by pH values below 7.0 and above 8.5. The manual identifies optimal nitrification pH as approximately 7.5 to 8.0 (Section 3). The cost of getting that range wrong starts with chemicals and ends with biology.

---

## What a biased reading costs in chemical dosing

Nitrification consumes alkalinity. For every milligram of ammonium-nitrogen (NH4-N) oxidized, approximately 7.1 mg of alkalinity is consumed as calcium carbonate equivalent. Most activated sludge plants operating for biological nitrogen removal must supplement influent alkalinity to keep pH from dropping below 7.0 and inhibiting nitrifiers. The [EPA Nutrient Control Design Manual](https://www.epa.gov/sites/default/files/2019-04/documents/nutrient-control-design-manual-epa-600-r-10-100.pdf) recommends maintaining residual alkalinity above 50 to 80 mg/L as CaCO3 through the aerobic zone.

The control system for alkalinity addition (typically sodium bicarbonate, sodium hydroxide, or carbon dioxide) uses the pH reading as its primary feedback signal.

When that signal is biased low, the controller adds chemical it does not need.

**Modelled example: sodium bicarbonate addition (do not use as a cost estimate for your plant; these are illustrative figures):**

A 5 MGD secondary treatment plant with biological nitrification adds approximately 500 to 800 lbs per day of sodium bicarbonate (soda ash) to maintain alkalinity through the aerobic zone. At a bulk price of roughly $0.10 to $0.15 per pound (commodity sodium bicarbonate, industry trade range), that is $18,000 to $44,000 per year in chemical cost.

A pH electrode reading 0.4 units low (the controller sees pH 7.1 when the basin is actually at 7.5) causes the controller to add alkalinity it does not need. If the result is a 15 percent chemical overdose, that is roughly $2,700 to $6,600 per year in unnecessary chemical spend at this modelled plant size.

At larger plants (20 to 50 MGD) or those using sodium hydroxide for pH control, the proportional waste is larger in absolute dollars. CO2 injection systems for pH reduction (in high-alkalinity influent situations) can run $15,000 to $60,000 per year in gas costs; a systematic overdose from a biased high-reading pH probe proportionally compounds that cost.

The chemical cost alone rarely justifies a sensor upgrade. The process stability risk usually does.

---

## The nitrification stability risk

Nitrifying bacteria (primarily Nitrosomonas and Nitrobacter) are the slowest-growing organisms in a conventional activated sludge process. Specific growth rates for Nitrosomonas are typically 0.5 to 0.9 per day at 20 degrees C, compared to 5 to 15 per day for heterotrophic organisms. That slow growth means that if nitrifiers are inhibited or washed out, recovery takes two to four weeks under favorable conditions.

pH below 6.5 is a reliable nitrification inhibitor. Below that threshold, Nitrosomonas activity drops sharply and can cease within hours for a sustained low-pH event.

The [EPA Nutrient Control Design Manual](https://www.epa.gov/sites/default/files/2019-04/documents/nutrient-control-design-manual-epa-600-r-10-100.pdf) documents the sensitivity: a drop from pH 7.2 to 6.5 can reduce nitrification rates by 50 percent or more. A sustained drop below 6.0 can cause near-complete nitrification failure in a conventional activated sludge process.

Here is the drift scenario that matters operationally: the pH sensor is reading 0.4 units high (fouled membrane, positive offset). The basin is actually at 6.7. The controller, seeing 7.1, adds no alkalinity. The pH continues to drop. The operator, seeing a trending decline on a screen that shows 6.8 when the basin is at 6.4, adds alkalinity, but perhaps not enough and perhaps too late. Three days later, the effluent NH4-N spikes. The root cause is a biased electrode.

This scenario is not rare. The [EPA Primer for Municipal Wastewater Treatment Systems](https://www.epa.gov/sites/default/files/2015-09/documents/primer.pdf) cites nitrification upsets from inadequate alkalinity as a recurring operational challenge in activated sludge. In most cases, those upsets were detectable earlier in the historian data, if the right parameters were being measured accurately.

---

## The gap between calibration events

NPDES permits typically require pH monitoring of final effluent daily or continuously, under the monitoring provisions required as permit conditions by [40 CFR 122.48](https://www.ecfr.gov/current/title-40/chapter-I/subchapter-D/part-122/section-122.48). In-process pH (the bioreactor reading that drives chemical dosing) is measured continuously by the in-line electrode but calibrated on a weekly or bi-weekly schedule at many facilities.

That interval is the window in which drift accumulates uncorrected.

A junction that fouls at a rate of 0.05 to 0.08 pH units per day (a plausible rate in a high-MLSS basin) produces a 0.35 to 0.56 unit error by day seven. For six of those seven days, the chemical dosing and stability assessment were based on data that was off by a meaningful fraction.

The standard correction is to calibrate more frequently. That is a valid approach and appropriate for critical processes. But it adds labor and requires taking the sensor offline or using a submersible probe that can be withdrawn without process interruption.

A complementary approach is to detect drift earlier without additional calibration cycles. In an activated sludge process, pH is not independent of dissolved oxygen, oxidation-reduction potential (ORP), and conductivity. When nitrification is proceeding normally, these parameters have predictable correlations on a day-over-day basis. A pH reading that diverges from what the correlated signals suggest, without a corresponding change in influent chemistry or loading, is a candidate for drift, not process change.

That distinction is what continuous, multi-parameter monitoring with drift detection logic enables: identifying the difference between a real pH excursion and a sensor that needs cleaning, before the calibration event makes it obvious.

---

## What to look for in your data

If your plant has historian data with pH, DO, ORP, and conductivity logged at one-minute or five-minute intervals, the following patterns are consistent with pH electrode fouling rather than process change:

- A slow, unidirectional drift in pH over three to five days, without a corresponding change in influent flow, temperature, or DO setpoint behavior
- pH response that lags sharply after a process change (blower speed change, recycle flow adjustment) when DO responds in the expected direction within seconds
- A pH reading that is inconsistent with the alkalinity addition rate the controller is commanding (for example, the controller adding significant caustic but pH not trending upward)

None of these is definitive without a calibration check. But any of them is a prompt to calibrate early and to look at the post-calibration offset. A plant that consistently finds 0.3 to 0.5 unit offsets at calibration is running on biased data between calibrations, and the cost of that is a combination of chemical waste and process stability margin that is not there when the biology actually needs it.

---

## A next step

If you want to understand how continuous sensor monitoring applies to your activated sludge process, specifically how correlated parameter analysis can flag pH electrode fouling between calibration events, [request a demo](https://aquamesh.ai/#contact) and we can walk through an example with your historian data.

For more on the measurement gap in wastewater treatment, see [what 25 days of historian data actually shows about a treatment plant](/blog/what-25-days-of-historian-data-shows.html), [DO sensor calibration intervals in activated sludge](/blog/do-sensor-calibration-interval-activated-sludge.html), and [intermittent aeration and DO sensor precision](/blog/intermittent-aeration-nitrogen-removal-do-control.html). For NPDES permit compliance implications of in-process measurement gaps, see [NPDES nitrogen permit compliance: the DMR sampling gap](/blog/nitrogen-permit-compliance-sampling-gap.html).

*Alex Towfigh is a founder at AquaMesh.*
