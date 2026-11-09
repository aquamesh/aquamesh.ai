---
title: The $1.5M sewer repair: what discharge monitoring missed
slug: water-online-sewer-repair-evidence
date: 2026-10-26
section: In the press
description: Guest column by Alex Towfigh in Water Online on a $1.5M restitution case and what upstream monitoring could have shown about the discharge.
tags: industrial wastewater, pretreatment, discharge compliance, sewer surcharges, spectral sensing, Water Online
---

Water Online published a guest column by Alex Towfigh, AquaMesh's founder and CEO, on 26 October 2026. The full piece is on the Water Online site: [The $1.5 Million Sewer Repair -- And The Water-Quality Evidence Missing Upstream](https://www.wateronline.com/doc/the-million-sewer-repair-and-the-water-quality-evidence-missing-upstream-0001). What follows is an expanded summary with additional context on the pretreatment regulatory framework.

## The argument in brief

**The case.** A California wire manufacturer was ordered to pay $1.5 million in restitution after acidic wastewater damaged a public trunk sewer. EPA's 2010 announcement described 14 illegal discharges over four months of 2008, with pH as low as 1 against a permit minimum of 6. The column is careful about what this shows: the restitution covered cumulative damage, and a new analyzer alone would not necessarily have stopped the discharges. Its question is whether the plant could have recognized a repeated pattern early enough to investigate the treatment system behind it.

**An endpoint is not an explanation.** A pH probe at the discharge point tells you whether neutralization worked. It does not tell you whether the cause was a transfer, a dosing fault, a bypass, a reagent shortage or maintenance. Better detection cannot replace working treatment equipment, but it can shorten the path from a suspect reading to its cause.

**Two bills for the same discharge.** Lost product and treatment surcharges are separate ledgers, and the column warns against counting the same saving twice. It works through a dairy scenario using a published loss range of 1% to 3% of milk processed, and a COD example using San Diego's published January 2026 rate of $0.27 per pound: at 1 million gallons a day with 1,000 mg/L of added COD, about $2,252 a day. Both are sensitivity calculations, not measured losses or billing forecasts, and the column says so.

**The blind spot between systems.** Read-only access to PLC, SCADA and historian data reconstructs what production was doing and when. A multiwavelength UV/visible sensor can show changes in the stream that pH, flow or conductivity miss, provided it is calibrated on site. A rinse that lines up with an optical change is a lead to check against a lab sample, not a finding.

**The clock decides usefulness.** Detection only helps if it arrives in time to act. EPA event-detection research found that many unexpected water-quality changes came from operational changes or sensor problems rather than contamination. So the measures that matter are lead time, confirmed causes, false alerts per shift and cost, not anomaly accuracy on its own.

## The pretreatment gap: why violations repeat

The EPA pretreatment program, codified at [40 CFR Part 403](https://www.ecfr.gov/current/title-40/chapter-I/subchapter-N/part-403), requires significant industrial users discharging to publicly owned treatment works (POTWs) to monitor their effluent and submit self-monitoring reports against local and categorical limits. The California case is notable for documenting 14 violations over four months rather than a single incident.

That pattern matters. A one-time equipment failure is an operations problem. Repeated violations over multiple months suggest the monitoring and investigation loop was too slow to interrupt the cycle: a suspect reading, an investigation that finds no root cause, another event. The column's core argument is that an endpoint measurement at the discharge cannot tell you which upstream condition caused it.

Under the pretreatment program, a significant industrial user found in violation may face formal Notices of Violation, civil penalties under [CWA Section 309](https://www.epa.gov/enforcement/clean-water-act-enforcement), and in cases involving physical POTW damage, restitution claims from the municipal utility. The $1.5 million figure in this case reflected sewer repair costs, not standard permit penalties.

[Spectral sensing can reveal discharge chemistry that endpoint pH alone misses](/blog/spectral-change-analysis-vs-calibrated-parameters.html). But identifying that a problem occurred is different from tracing its cause upstream. That is where process historian data plays a role. [When 25 days of process historian data were analyzed at one industrial facility](/blog/what-25-days-of-historian-data-shows.html), unexpected deviations mapped to specific shifts and equipment states rather than random failures, providing the upstream context the column argues is missing from most monitoring architectures.

## Three questions for the next operations meeting

For each recurring discharge, the column asks:

1. What is the earliest validated water-quality measurement?
2. Which upstream records would explain it?
3. What authorized operating change would prevent it from happening again?

It closes with a test of its own: find the single missing measurement that would most improve the conclusion. If there is not one, more sensors may not be the right investment. And AquaMesh's value has to be shown the same way, through lower confirmed losses, earlier diagnosis or less investigation effort.

The column's framing applies broadly to any facility managing discharges under a POTW pretreatment permit. The practical question is whether the current monitoring architecture would allow operations staff to trace the source of a problem within the same shift it occurs, rather than after the next scheduled compliance sample. If the answer is no, that is the gap worth measuring first.

[Read the full column in Water Online](https://www.wateronline.com/doc/the-million-sewer-repair-and-the-water-quality-evidence-missing-upstream-0001). For facilities working through a similar monitoring gap, [request a conversation with the AquaMesh team](https://aquamesh.ai/#contact).
