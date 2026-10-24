---
title: Why parallel equipment drifts apart, and what the gap costs
slug: why-parallel-equipment-drifts
date: 2026-09-26
section: Field notes
description: Twin basins, duty and standby pumps, two membrane trains. Equipment built to do the same job should behave the same way. The moment it stops is the most useful signal most plants never look at.
image: assets/audit.jpg
tags: parallel equipment, pump duty, lead lag alternation, aeration, predictive maintenance
---

The most reliable finding in plant data is also the simplest: two things built to do the same job, under the same conditions, that have stopped behaving the same way.

It is reliable because it needs no baseline, no model of correct operation, and no agreement about what good looks like. The two units are each other's reference. If one has drifted from the other, something changed, and that something usually has a cost attached.

## Why the control system will not tell you

A modern control system is very good at holding a value and raising an alarm when a limit is crossed. Divergence between two units is neither of those things.

Both units can sit inside every alarm limit while being nowhere near each other. A pump at 84% duty and its twin at 39% are both running. A basin at 5.35 mg/L and its twin at 0.49 mg/L are both aerated. Nothing is out of range in the sense the alarm system understands, so nothing fires, and the gap persists for years because it never presents as an event.

That is the gap worth watching, and it is visible in data a plant already records.

{{diagram:twin-basins}}

Neither trace is outside an alarm limit. Both basins are aerated, both are running, and nothing fires.

## The three shapes it takes

### Duty that never alternates

Lead and lag assets are supposed to swap. When the alternation is disabled, or was never configured, or was turned off during a commissioning problem and never turned back on, the lead unit accumulates all the wear.

Lead-lag alternation (a standard reliability practice described in the [EPA Primer for Municipal Wastewater Treatment Systems](https://www.epa.gov/sites/default/files/2015-09/documents/primer.pdf)) is designed to equalize wear across redundant assets and ensure the standby unit is exercised regularly. The standby that has not run in months is the one the plant will depend on when the lead finally fails.

In one plant's record, return-activated-sludge pumps showed 504 run hours against 232 in the same twenty-five days, and the lifetime counters showed the gap compounding: 44,299 hours against 30,953. The lead unit reaches overhaul years earlier than it needs to while the standby sits idle.

{{diagram:duty-split}}

Twenty-five days of run hours, and the lifetime counters behind them.

Lead-lag alternation costs nothing to enable. What makes this finding persuasive rather than theoretical is that the same plant's MBR blowers and permeate pumps *were* balanced, which marks it as an oversight on one asset rather than a design choice.

### A shared supply, unequally split

Twin basins on a common air header should see similar dissolved oxygen at similar load. When one sits far above the other with its blower command pinned wide open, the control strategy is not the problem: the air is not arriving where it is supposed to.

This one is cheap to investigate and cheap to correct, which is what makes it worth finding. A valve position or a damper, not a capital project.

Aeration typically accounts for 55 to 70 percent of a treatment plant's electricity consumption ([EPA Energy Management Guidebook for Publicly Owned Treatment Works](https://cfpub.epa.gov/si/si_public_record_report.cfm?Lab=NRMRL&dirEntryId=287471)). An air distribution imbalance between twin basins does not show up in the daily energy report: it shows up in blower run hours, and the cause is upstream of both. How that translates to operating cost is described in [aeration energy at wastewater plants](/blog/aeration-energy-cost-wastewater-plants.html).

### Instruments that no longer agree

Two turbidimeters on the same permeate stream, one reading a median of 0.11 NTU with a 90th percentile of 0.26, the other reading 0.14 and 2.12: three and a half times the plant's posted upper limit.

One of them is drifting. Until you know which, compliance decisions are resting on an instrument that cannot be fully trusted. The encouraging part, in that case, was that the true value looked excellent.

Dissolved oxygen instruments follow the same pattern. In activated sludge, a DO sensor reading above actual holds the blower on past the setpoint; one reading below actual cuts aeration short before the biology is satisfied. The process consequence of that divergence, particularly during intermittent aeration cycles for nitrogen removal, is covered in [intermittent aeration for nitrogen removal](/blog/intermittent-aeration-nitrogen-removal-do-control.html).

## Why frequent starts cost more than running

A related pattern worth naming on its own, because it is consistently underestimated.

Pumps are often judged on run hours. The more expensive variable is usually starts. Every start draws locked-rotor current several times the running current, and the heat goes into the windings. Motor thermal protection guidelines, as documented in the [DOE guide on improving pumping system performance](https://www.energy.gov/sites/default/files/2014/05/f15/improving_pumping_system_performance.pdf), establish typical starting limits for mid-size motors because inrush heat cannot dissipate faster than winding insulation allows. Manufacturer specifications typically put that limit at a handful of starts per hour.

In one record, reclaimed water pumps were logging 13 to 28 starts an hour. One asset logged 143 in a single hour: a start every twenty-five seconds. No alarm fired, because at no point was any pump outside its operating limits. It is a control deadband, and the bill arrives years later in motors, starters and contactors.

{{diagram:pump-starts}}

## How to look for it in your own data

You do not need a platform to start. With a historian export and a spreadsheet:

1. **List your parallel assets.** Anything with a twin: pumps, blowers, basins, trains, filters.
2. **Compare run hours over the same window**, and compare lifetime counters if you have them. A persistent ratio far from 1:1 is the signal.
3. **Count starts per hour**, not just runtime, and compare against the manufacturer guidance for that size of machine.
4. **For process variables, plot the pair on the same axis.** Not each against its limit: against each other. Divergence that holds for weeks is not noise.
5. **Check duplicates against each other.** Two instruments on one stream that disagree are telling you something regardless of which is right.

What you are looking for in every case is persistence. A transient divergence is operations. A divergence that holds for the whole record is a setting, a valve, or an instrument, and all three are fixable.

## Why this is where we start

When we read a plant's history, parallel equipment is the first thing modelled, because it produces findings that are concrete, cheap to verify, and hard to argue with. Nobody has to accept a model's opinion about what dissolved oxygen should be. They only have to accept that two basins on the same air header ought to look alike.

More on what a historian export produces: [what 25 days of data actually shows](/blog/what-25-days-of-historian-data-shows.html).
