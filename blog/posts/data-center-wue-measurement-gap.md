---
title: Data center WUE: what it measures and what it misses
slug: data-center-wue-measurement-gap
date: 2026-10-22
section: Measurement
description: WUE measures liters per kWh of IT load. It does not show where water goes, verify cooling controls, or prove tower savings for reporting.
tags: data centers, WUE, water efficiency, cooling tower, water monitoring, water usage effectiveness
---

Water Usage Effectiveness (WUE) is a data center water metric introduced by [The Green Grid](https://www.thegreengrid.org/en/resources/library/details/WUE-A-Green-Grid-Efficiency-Metric). The formula: liters of water consumed at the facility divided by kilowatt-hours delivered to IT equipment, where lower is better and zero is the theoretical ideal.

What WUE does not answer:

- Where the water is going (evaporation versus blowdown)
- Whether the sensors driving cooling tower control are accurate
- Whether blowdown volume can be reduced on demand under reporting or drought rules
- What specific operating changes move the number versus what is fixed by physics

Each of those gaps affects whether a WUE target in a sustainability report is operationally achievable.

## What WUE actually measures

The metric was introduced by The Green Grid as a companion to PUE (Power Usage Effectiveness). Like PUE, it is a ratio: lower is better and zero is the theoretical ideal. A site with a WUE of 2.0 consumes two liters of water for every kilowatt-hour its servers use.

Research on actual facility performance puts the range between 1 and 9 liters per kilowatt-hour depending on cooling approach, climate zone, and facility age, with a central tendency around 1.5 to 2 L/kWh for older evaporative cooling installations. ([Mytton, D. "Data centre water consumption." npj Clean Water 4, 52 (2021)](https://www.nature.com/articles/s41545-021-00101-w)) Newer hyperscale builds using advanced chemistry management or closed-loop cooling report considerably lower values.

WUE is typically calculated annually. Some operators report quarterly. It is a useful benchmark for comparing facilities against each other and tracking long-run progress. It is a poor guide for what to do on Tuesday.

## Where the water actually goes

For facilities using evaporative cooling towers, which covers the majority of installed capacity, the water balance has two main terms: evaporation and blowdown.

Evaporation is the productive part. The cooling process works by letting water absorb heat and leave the tower as vapor. Roughly 70 to 80 percent of the water that enters the tower in this way is not recoverable; it has done its job and left the site. ([Mytton 2021](https://www.nature.com/articles/s41545-021-00101-w)) This fraction tracks the heat load on the facility and varies with ambient wet-bulb temperature. A site cannot significantly reduce evaporative losses without changing the physics of how it cools its equipment.

Blowdown is different. As water circulates through the tower and a portion evaporates, the dissolved minerals left behind concentrate. Calcium, silica, chlorides, and biological material accumulate. If concentration rises too high, scale deposits on heat exchanger surfaces and corrosion accelerates. To prevent this, some fraction of the circulating water is periodically discharged and replaced with fresh makeup water. That discharge is blowdown.

The ratio of dissolved mineral concentration in the circulating water to the concentration in the makeup supply is called the cycles of concentration. At three cycles, for every gallon that evaporates, roughly half a gallon is discharged as blowdown, and one and a half gallons are drawn in as makeup. At six cycles, blowdown drops to roughly one fifth of the evaporation volume. At ten cycles, it drops to one ninth.

**Modelled example:** For a 10-megawatt IT load facility with a moderate WUE of 2.0 L/kWh operating at 85 percent utilization, annual water consumption is roughly 149 million liters. If evaporation represents 75 percent of that total, the remaining 37 million liters per year is blowdown. Moving from 3 to 6 cycles of concentration reduces that blowdown component by approximately 60 percent, or 22 million liters per year. This is a modelled estimate based on the ratios above; actual results depend on makeup water chemistry, heat load profile, and seasonal variation.

## The measurement problem

The control system that manages blowdown uses a conductivity sensor as its primary input. Conductivity in the circulating water rises as dissolved minerals concentrate, and the controller uses this as a proxy for cycles of concentration. When conductivity reaches a set threshold, the blowdown valve opens and makeup water flows in.

This means the conductivity sensor, sitting in a basin or on a sidestream line, is the direct operational driver of water efficiency performance. A sensor that reads accurately and holds its calibration enables tight control at higher cycles. A sensor that has fouled, drifted, or been calibrated infrequently has the opposite effect.

A sensor reading low when concentration is actually high causes the controller to keep the blowdown valve closed longer than intended. Dissolved solids accumulate beyond design limits. Scale risk increases and the operator may not know it until a heat exchanger inspection. A sensor reading high when concentration is actually normal causes the controller to open the blowdown valve prematurely and repeatedly, discharging good water and drawing in fresh makeup water unnecessarily. The facility's WUE is higher than it needs to be, and the cause does not appear in the annual report.

Neither failure mode triggers an alarm in a standard building management system. The control loop is running. The conductivity reading is within the operating range. The controller is doing exactly what it was programmed to do with the signal it receives.

This is the same silent failure pattern that affects dissolved oxygen control in wastewater aeration basins, where a fouled sensor drives blowers toward wasted energy rather than toward needed oxygen. The structure of the problem is identical: a lagging indicator (WUE for water, energy per gallon treated for wastewater) does not point to the sensor drift that is the actual cause. The gap shows up only when you look at the control inputs directly, not at the outcomes they produce. The parallel is covered in more detail in the analysis of [why parallel equipment drifts apart](https://aquamesh.ai/blog/why-parallel-equipment-drifts.html). It also applies to intermittent aeration cycles for nitrogen removal, where DO sensor drift affects both effluent compliance and the energy savings the intermittent strategy was meant to deliver: [intermittent aeration for nitrogen removal: what DO sensor precision actually controls](https://aquamesh.ai/blog/intermittent-aeration-nitrogen-removal-do-control.html).

For a detailed breakdown of what conductivity sensor drift costs in cooling tower water volume and chemical spend, including a worked example using DOE benchmark data, see [cooling tower blowdown control: what conductivity sensor drift costs in water and chemicals](https://aquamesh.ai/blog/cooling-tower-blowdown-conductivity-sensor-drift.html).

## Proving cooling tower water savings for reporting

A WUE target in a sustainability disclosure or a California Water Scarcity Plan is defensible only if three things are in place: a metered baseline, an auditable record of the variables that drive consumption, and a method to demonstrate the change was real rather than a calculation artifact.

For cooling towers, that means measuring at the points where water actually enters and leaves the system.

**Metering checklist**

- **Makeup water flow**: A flow meter on the makeup supply line, totalizing by day. This is the primary input: it is what the utility invoices and what regulators count as consumption. Without a direct makeup meter, total consumption is estimated from conductivity readings and design assumptions, and that estimate cannot catch sensor-driven overconsumption.
- **Blowdown volume**: A flow meter or timed valve record on the blowdown line. Blowdown is the discretionary water loss, the portion a facility can actually reduce through chemistry management. Without a direct measurement, blowdown is typically back-calculated from conductivity set points, which creates circular logic if the conductivity sensor is the variable under audit.
- **Basin conductivity with historian logging**: A continuous conductivity reading linked to the historian, not just a set-point indicator. The logged record shows what cycles of concentration the facility actually operated at over time, versus what the design target was. This is the evidence base for any claim that COC improved.
- **Conductivity sensor verification schedule**: A periodic grab-sample check using an independent meter compared against the installed sensor. The [DOE Federal Energy Management Program Best Management Practice 10](https://www.energy.gov/eere/femp/best-management-practice-10-cooling-tower-management) identifies conductivity monitoring and cycles-of-concentration tracking as core elements of water efficiency for cooling towers. A documented record of sensor verification during both the baseline and the improvement period is the evidence that the signal driving blowdown control was accurate.

**Establishing an auditable baseline**

A baseline for a WUE improvement claim needs at least 12 months of data before the change, covering seasonal variation in wet-bulb temperature and heat load. Cooling water consumption tracks ambient conditions, and a baseline drawn only from summer months overstates annual average performance.

From that record, calculate:

1. Average cycles of concentration by month
2. Makeup volume relative to evaporative load (calculable from heat load data and ambient conditions)
3. Blowdown as a percentage of total makeup, by month
4. Unexplained blowdown events: volume spikes not correlated with changes in heat load

Unexplained events, whether from conductivity sensor drift, a valve held open during maintenance, or a chemical feed miscalculation, show up as isolated increases in blowdown volume not matched by heat load increases. In a 25-day historian review at an industrial process facility, three anomalies of this type were identified, adding an estimated 12 to 18 percent to water consumption for that period. ([What a 25-day historian audit finds at a treatment plant](https://aquamesh.ai/blog/what-25-days-of-historian-data-shows.html)) The same review methodology applies directly to cooling tower makeup and blowdown logs.

**When direct blowdown metering is not installed**

Many operating data centers lack a flow meter on the blowdown line. Blowdown volume is inferred from the conductivity set point and the makeup meter, which means the calculated efficiency number cannot detect the cases where the sensor controlling blowdown is drifting. A dedicated blowdown meter converts an estimated variable into a verified one. For a site preparing a California Water Scarcity Plan, that difference is material: a commitment to reduce blowdown by a specific percentage is auditable only if blowdown is measured independently of the control signal.

## The California compliance context

California's AB 2619, signed in September 2026, requires data center operators to report total and direct annual water use by source at every business license renewal, under penalty of perjury. AB 2469 requires a Water Scarcity Plan by 2028 for facilities requiring construction permits. ([California data center water reporting requirements](https://aquamesh.ai/blog/california-data-center-water-reporting.html))

A Water Scarcity Plan is a commitment to reduce water consumption under specified drought conditions, including staged curtailment and targeted reductions by use type. The commitment is credible only if the site can demonstrate that it knows where its water goes and can reduce specific uses on demand.

A site operating at three cycles of concentration because its conductivity sensors drift between maintenance intervals cannot reliably commit to operating at six cycles under drought conditions. The chemistry that makes six cycles safe to operate requires measurement quality that makes four and a half cycles the actual operational average. The gap between the plan and the operational reality is a sensor reliability problem, not a strategy problem.

## Three questions worth checking before setting a WUE target

Before writing a WUE improvement target into a sustainability report or a Water Scarcity Plan, three questions are worth answering from existing historian data.

**What are your actual cycles of concentration, by tower?** This is calculable from makeup flow, blowdown flow, and conductivity readings. If the number is consistently below design, the control logic or the sensor driving it is worth examining before adjusting targets.

**How does blowdown volume correlate with wet-bulb temperature?** Evaporation tracks ambient conditions predictably. Blowdown should not spike independently of heat load. Unexplained blowdown events in the historian are almost always sensor artifacts or valve events, not chemistry responses.

**What share of total water use does blowdown represent?** If blowdown is running above 30 percent of total consumption on a facility that should be operating at moderate cycles, the conductivity control system is not performing at design. This shows up in 12 months of metered data and does not require a new study to identify.

None of this analysis requires capital investment. The data exists in most historian systems. The constraint is usually having a way to look at it with enough resolution and the right reference points to distinguish signal from noise.

---

If your site is preparing for California's 2027 renewal requirements or developing a scarcity plan for 2028, the water balance question is worth addressing before the commitment is made, not after. AquaMesh can review the historian data that is already being collected and identify where the measurement gaps are.

See how this kind of analysis surfaced a $3,316 blower anomaly at a wastewater treatment plant: [what 25 days of historian data actually shows](https://aquamesh.ai/blog/what-25-days-of-historian-data-shows.html). Or [reach out to schedule a working session](https://aquamesh.ai/#contact).

*Alex Towfigh is a founder at AquaMesh.*
