---
title: Wastewater blower VFD: why energy savings erode
slug: wastewater-blower-vfd-energy-savings-erode
date: 2026-10-31
section: Field notes
description: Dissolved oxygen sensor drift silently reverses VFD energy savings at wastewater plants. Three historian patterns reveal the cause, and the fix starts with calibration records.
tags: blower energy, VFD, dissolved oxygen control, wastewater aeration, energy optimization
---

Variable frequency drives on aeration blowers are among the most reliable energy investments a wastewater plant can make. The engineering is sound: slow the blower when oxygen demand drops, and power consumption falls by the cube of the speed reduction. Many plants documented 15 to 25 percent reductions in blower energy in the months after commissioning. Not all of them still see those numbers.

The most common reason is not a failing drive, a degraded motor, or the wrong control strategy. It is the dissolved oxygen sensor feeding the control loop.

**Quotable insight:** A blower VFD can only be as efficient as the measurement telling it when to slow down. If that sensor reads low, the controller drives blowers harder, and the savings disappear into electricity you cannot account for.

## How VFD DO control is supposed to work

In a properly functioning aeration control loop, a dissolved oxygen sensor reports basin concentration to a controller. The controller compares that reading to a setpoint, typically 1.5 to 2.5 mg/L for activated sludge, and adjusts blower output through one or more variable frequency drives. When influent load drops overnight, demand-based control backs the blowers off. When load rises in the morning, blowers ramp back up.

The energy arithmetic behind this is centrifugal fan physics. For a multi-stage centrifugal or turbo blower, power consumption scales with the cube of rotational speed. A blower running at 80 percent of design speed uses approximately 51 percent of design power. At 90 percent of design speed, it uses approximately 73 percent. The difference between those two operating points, 22 percentage points of rated power, is what demand-based control captures when it works as designed.

The Florida Water and Pollution Control Operators Association published analysis in April 2026 showing that demand-based DO control typically reduces blower energy by 10 to 25 percent at secondary treatment plants, and that PLC-optimized control can reach 20 to 40 percent. ([FWPCOA, "Demand-Based DO Control And Energy Optimization," April 2026](https://www.fwpcoa.org/content.aspx?page_id=5&club_id=859275&item_id=134074)) Those ranges describe what the control system saves when the sensor is providing an accurate signal.

## The sensor drift that quietly reverses it

Dissolved oxygen sensors in mixed liquor face a relentless fouling environment. Biofilm builds on membrane-covered electrochemical sensors and on the optical surfaces of luminescent sensors. Suspended solids accumulate on probe housings. The most common consequence of fouling is a reading that drifts low: the deposit impedes diffusion or light transmission, and the sensor reports less oxygen than is actually present.

A sensor reading 1.4 mg/L when the basin contains 2.1 mg/L presents the controller with a problem that does not exist. The basin is already 0.6 mg/L above setpoint. The controller sees it 0.1 mg/L below setpoint and commands higher blower output. The VFD speeds up. Over-aeration begins, and it is completely silent: no alarms fire, the historian records the sensor value as if it were accurate, and the control loop looks like it is working.

The result is a system where the VFD is still installed, the control loop is still active, and the blowers are running harder than the process needs. The savings documented at commissioning, when the sensors were freshly calibrated, erode as sensor bias accumulates between calibration events.

## What the cost of eroded savings looks like

The U.S. EPA benchmarks secondary treatment activated sludge plants at approximately 1,500 kWh per million gallons for electricity consumption, with aeration systems representing 50 to 75 percent of that total. ([U.S. EPA, Ensuring a Sustainable Future: An Energy Management Guidebook for Wastewater and Water Utilities](https://www.epa.gov/sites/default/files/2016-12/documents/guide_energymanagement.pdf)) The U.S. Energy Information Administration reported the national average industrial electricity rate at $0.0977 per kWh in July 2026. ([EIA Electric Power Monthly, September 2026](https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a))

**Modelled example for a 10 MGD secondary treatment plant:**

| | |
|---|---|
| Annual aeration energy at benchmark | 3,285,000 kWh/yr |
| Aeration electricity cost at $0.098/kWh | ~$322,000/yr |
| Savings at commissioning (20%, demand-based control) | ~$64,000/yr |
| Savings after 18 months of sensor drift (reduced to ~8%) | ~$26,000/yr |
| Annual value of eroded savings | ~$38,000/yr |

This is a modelled example using published benchmarks and illustrative drift-induced savings erosion. Actual figures depend on load profile, treatment configuration, calibration schedule, and utility tariff. A plant running at higher flow or with older blowers will see larger absolute numbers. A plant with weekly calibration will see less erosion.

The point of the table is the ratio: the cost of sensor drift that is invisible on the dashboard can exceed the annual maintenance budget for the sensors causing it.

## Three patterns that appear in the historian

When VFD savings have eroded due to sensor drift, three patterns tend to appear in historical process data. None of them requires new instrumentation to find.

**Blowers at sustained high output during low-demand periods.** A functioning demand-based control system should show measurable blower turndown overnight and on weekends, when influent flow and biological oxygen demand are lower. If the historian shows blowers running at 85 percent or higher during those periods, either the setpoint is configured too aggressively or the sensors are overreporting the oxygen deficit.

**Step changes in blower output immediately after calibration events.** When a sensor has drifted low by 0.5 to 1.0 mg/L and is then recalibrated to the correct value, the control loop sees an immediate improvement and commands lower blower output. That step down shows up in the historian. Its size reveals how far the sensor had drifted, and how long the plant was paying for that drift since the last calibration. A plant running monthly calibration on a sensor that drifts 0.5 mg/L in three weeks has paid for that drift for three weeks before the correction.

**Divergent blower output across parallel basins.** At plants with multiple aeration basins drawing from a common air header, sensors in different basins drift at different rates depending on local solids loading and maintenance consistency. When two basins receive similar influent loads but their blower outputs differ by 20 percent or more, the most common cause is a measurement offset in one of the sensors. The control loop is faithfully responding to what the sensors report. What the sensors report has diverged from reality.

We documented this exact pattern in [25 days of historian data from an operating plant](https://aquamesh.ai/blog/what-25-days-of-historian-data-shows.html): one basin was running its blower at more than three times the DO level of its parallel twin, with the blower pinned at maximum output for the full duration of the record. Both basins drew from the same air header. The control loop was functioning. The deviation was worth $3,316 per year in direct blower power, and it was invisible without comparing basins side by side at hourly resolution.

The mechanics of parallel equipment drift in aeration systems, and why the gap tends to grow rather than self-correct, are covered in [why parallel equipment drifts apart and what the gap costs](https://aquamesh.ai/blog/why-parallel-equipment-drifts.html).

## The calibration interval question

There is no universal answer for how often a DO sensor in activated sludge service should be calibrated. Manufacturer recommendations typically range from weekly to monthly. Actual calibration frequency at operating plants varies considerably, and some plants rely on grab samples and visual inspection rather than a fixed interval.

What determines the right interval is the sensor's actual drift rate in your mixed liquor at your current solids loading. A sensor that drifts 0.1 mg/L per week and holds that drift until the membrane is replaced needs a different schedule than one that degrades faster. The only way to know which situation you are in is to compare sensor readings against a calibrated handheld reference at intervals shorter than your current calibration cycle, not just immediately after calibration.

A calibration-versus-drift log, built from a few weeks of parallel readings, makes the calibration interval decision quantitative rather than a guess based on manufacturer defaults. We examine this approach in detail in [DO sensor calibration intervals in activated sludge](https://aquamesh.ai/blog/do-sensor-calibration-interval-activated-sludge.html), including how to build a drift profile and what a typical profile looks like in activated sludge service.

For plants running [intermittent aeration for simultaneous nitrification and denitrification](https://aquamesh.ai/blog/intermittent-aeration-nitrogen-removal-do-control.html), the stakes around calibration intervals are higher. That control strategy uses precise DO swings through the nitrification setpoint to cycle between aerobic and anoxic conditions. A sensor with a standing offset of 0.5 mg/L can shift the timing of those swings in ways that reduce nitrogen removal efficiency and create compliance risk, entirely apart from the energy cost.

## Three questions before adjusting the control strategy

When blower energy costs are higher than expected, or when early savings have faded, the instinct is to revisit the control logic: adjust setpoints, tune PID parameters, upgrade the control software. That work sometimes helps. It often does not, because the problem is not the strategy but the measurement feeding it.

Before changing anything in the control loop, three questions are worth answering directly from historian and calibration records.

**How large were the step changes in blower output after the last three calibration events?** If each calibration produces a visible step down in blower output, the sensor has been reading low between calibration cycles. The step size tells you how much the drift cost.

**Do parallel basins show divergent blower outputs during similar load periods?** Persistent divergence with no other explanation almost always traces to a sensor offset. It will not resolve with setpoint adjustments.

**When was the last time sensor readings were verified against a calibrated handheld at midday, not just immediately after calibration?** Sensors that look fine at calibration can drift substantially before the next service event. A midday check, two weeks after calibration, shows whether the reading is holding.

None of this analysis requires hardware beyond what most plants already have. The data is usually in the historian. The constraint is having a way to examine it at the right resolution, across basins, over a window long enough to see the patterns clearly.

---

If your plant installed blower VFDs with projected savings that have not materialized, or savings that were real initially and have since faded, the measurement quality question is the right place to start. An initial review of historian data from your aeration system can show whether the control loop is working from accurate inputs and where the largest gaps are.

See how AquaMesh approached a related analysis at a membrane bioreactor reuse plant: [a membrane-bioreactor water reuse plant case study](https://aquamesh.ai/case-studies/water-reuse-plant.html). Or [reach out to schedule a working session with the team](https://aquamesh.ai/#contact).

*Alex Towfigh is a founder at AquaMesh.*
