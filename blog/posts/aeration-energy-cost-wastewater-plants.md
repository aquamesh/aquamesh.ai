---
title: Aeration energy at wastewater plants: the cost, the waste, and the measurement gap
slug: aeration-energy-cost-wastewater-plants
date: 2026-10-21
section: Field notes
description: Aeration accounts for 50 to 75 percent of a treatment plant's electricity bill. Here is what that costs per MGD, why the standard fix often falls short, and what the measurement data actually reveals.
tags: aeration energy, wastewater treatment, dissolved oxygen, blower control, energy optimization
---

Aeration is the single largest line on the electricity bill for most activated sludge wastewater plants. Aeration systems typically represent 50 to 75 percent of total electricity consumption at activated sludge facilities. The logical response is to install dissolved oxygen sensors, add variable frequency drives to blowers, and let a control loop do the rest. Many plants have done exactly that. Not all of them kept the savings.

Here is what the cost actually looks like, and why the measurement behind the control loop determines whether the savings are real and lasting.

## How large the prize is

The U.S. Energy Information Administration reported the national average industrial electricity rate at $0.0977 per kWh in July 2026, up from $0.0933 the prior year. ([EIA Electric Power Monthly, September 2026](https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a))

Secondary treatment activated sludge plants typically use between 1,200 and 1,800 kWh per million gallons treated. The EPA's water and wastewater energy management documentation cites a common benchmark near 1,500 kWh per million gallons for secondary treatment. ([U.S. EPA, Ensuring a Sustainable Future: An Energy Management Guidebook for Wastewater and Water Utilities](https://www.epa.gov/sites/default/files/2016-12/documents/guide_energymanagement.pdf))

**Modelled example for a 10 MGD secondary treatment plant:**

| | |
|---|---|
| Annual flow treated | 3,650 million gallons |
| Electricity at 1,500 kWh/MG | 5,475,000 kWh |
| Aeration share at 60% | 3,285,000 kWh |
| At $0.098/kWh industrial rate | $321,900/year |

This is a modelled example based on published benchmarks. Actual costs vary with load patterns, treatment configuration, equipment age, and the utility tariff in effect. The kilowatt-hours are the right order of magnitude; the dollar figure resolves once you pull an actual utility bill.

At this scale, a 20 percent reduction in blower energy is worth roughly $64,000 per year. The Florida Water and Pollution Control Operators Association published analysis in April 2026 showing that basic demand-based DO control typically reduces blower energy by 10 to 25 percent, and that PLC-optimized control can reach 20 to 40 percent. ([FWPCOA, "Demand-Based DO Control And Energy Optimization," April 2026](https://www.fwpcoa.org/content.aspx?page_id=5&club_id=859275&item_id=134074))

Those are compelling numbers. The problem is that they describe what the system saves when it is working as designed. The gap between the theoretical savings and what a plant actually captures and keeps is usually a measurement problem.

## Where the savings go

A DO control loop has three components: a sensor reporting the current dissolved oxygen level, a controller comparing that reading to a setpoint, and a variable frequency drive adjusting blower output. The logic is straightforward.

The sensor is the weak link.

Electrochemical membranes foul and require regular replacement. Optical sensors are more stable but still accumulate biofilm in mixed liquor. A sensor that reads 1.8 mg/L when the actual basin concentration is 3.2 mg/L signals the controller that the basin is under-oxygenated. The controller responds by running blowers harder. The plant pays for electricity that achieves nothing useful, and nothing in the system indicates anything is wrong.

The inverse failure is less common but more consequential: a sensor fouled in a way that reads artificially high causes the controller to back off blowers when DO is genuinely borderline, with the process instability that follows.

Both failure modes are silent. The control loop is running. No alarms fire. The historian records the sensor output without knowing it has drifted. Operators checking the dashboard see normal-looking DO values.

This is why many plants install DO control hardware and see strong early results followed by gradual erosion. The hardware is still there. The control loop is still active. But the measurement feeding it has drifted, and the loop is now optimizing against a wrong input.

## The parallel basin case

Plants with multiple aeration basins running in parallel face a compounding version of this problem. Sensors in different basins drift at different rates depending on local solids loading, position relative to diffusers, and how consistently each one gets cleaned. The basins may share a common air header, but if their DO sensors are reading different offsets, the blower outputs serving them will diverge in ways that reflect sensor drift rather than actual process differences.

We covered the mechanics and cost of this kind of hidden divergence in [why parallel equipment drifts apart](https://aquamesh.ai/blog/why-parallel-equipment-drifts/). The direct energy cost of an over-aerated basin shows up in blower runtime. The downstream cost in nitrogen removal performance, when an anoxic zone receives excess dissolved oxygen, is harder to price but real.

## What the historian data showed

When we analyzed 25 days of historian data from an operating plant earlier this year, one of the first findings was a DO-driven blower anomaly: one basin was running at more than three times the DO level of its parallel twin, with its blower pinned at maximum output, for the full duration of the record.

Both basins drew on the same shared air header. The control loop was functioning. The deviation was visible only by comparing the two basins side by side at hourly resolution. A daily manual grab from either basin, taken at a representative time, could easily have missed it.

The finding was worth $3,316 per year in direct blower power, plus the process risk from carrying excess oxygen into a downstream anoxic zone. It was already in the data. It just had not been looked at in this way. The full analysis is in [what 25 days of historian data actually shows about a treatment plant](https://aquamesh.ai/blog/what-25-days-of-historian-data-shows/).

## What accurate measurement changes

When DO measurement is continuous, accurate, and does not accumulate drift between calibration cycles, the control loop has what it was designed to work from. Blower output tracks actual oxygen demand rather than sensor artifacts. Setpoints can be tightened because operators are not building in a buffer to account for measurement uncertainty.

For plants running intermittent aeration for simultaneous nitrification/denitrification, the DO swing required is fast and narrow. The economics of that strategy depend entirely on measurement that responds quickly and without offset.

Accurate measurement also creates a defensible record of what happened. When a plant documents savings for a utility incentive program or a regulatory report, both the baseline and current performance need measurement that holds up to scrutiny.

## Three questions worth asking before tuning the control loop

Before commissioning a new aeration control strategy or investigating why existing savings have eroded, three questions are worth answering directly from available data.

**Are the DO sensors reading accurately?** A comparison between sensor output and a calibrated handheld grab at different times of day, not just right after calibration, shows whether a sensor is holding its reading or drifting between service intervals.

**What does the blower run-time history show?** If blowers are running at sustained high output during periods when influent flow and temperature are moderate, the measurement feeding the control loop deserves examination before changing the control logic itself.

**Are parallel basins loading evenly?** Persistent divergence in blower output between basins handling equivalent loads is almost always a measurement issue. It rarely responds to setpoint adjustments alone.

None of these analyses requires new hardware. The data is usually in the historian. The constraint is having a way to look at it at the right resolution, over a long enough window, against the right reference.

---

If your plant is spending in the range described above, the measurement question is worth examining directly. An initial review of your historian data can show whether the control loop is working from accurate inputs and where the largest gaps are.

See how AquaMesh approached this analysis at a membrane bioreactor reuse plant: [a membrane-bioreactor water reuse plant case study](https://aquamesh.ai/case-studies/water-reuse-plant.html). Or [reach out to schedule a working session with the team](https://aquamesh.ai/#contact).

*Alex Towfigh is a founder at AquaMesh.*
