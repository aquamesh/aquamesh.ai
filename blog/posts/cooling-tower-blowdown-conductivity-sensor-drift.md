---
title: Cooling tower blowdown control: conductivity drift cost
slug: cooling-tower-blowdown-conductivity-sensor-drift
date: 2026-10-28
section: Measurement
description: Conductivity sensor drift triggers premature blowdown, wasting makeup water and chemicals. Here is what it costs and how to detect it in your data.
tags: cooling tower, blowdown, conductivity, water efficiency, industrial water management
---

Conductivity sensor drift in cooling tower blowdown control costs money in two directions. A sensor reading high triggers blowdown when basin water is still within its design operating range, discharging water that had remaining evaporative capacity. A sensor reading low allows dissolved solids to concentrate past the setpoint, depositing scale on heat transfer surfaces and potentially pushing discharge chemistry past permit limits. The DOE Federal Energy Management Program documents a 50 percent reduction in blowdown when moving from three to six cycles of concentration: the conductivity measurement controls that entire difference. When the sensor has an offset, the system is not running at the cycles the treatment program was designed for, regardless of what the control display shows. The detection method is below. The data is already in the historian.

Cooling tower blowdown is controlled by a conductivity setpoint. When the circulating water reaches a programmed conductivity level, the blowdown valve opens and a portion of the basin is discharged. The logic is straightforward: conductivity rises as dissolved solids concentrate through evaporation, and the setpoint represents the maximum concentration the system is designed to run at before dumping water and replacing it with fresh makeup.

The measurement doing that work is a conductivity sensor in the basin or blowdown line. If that sensor reads high, the control system discharges water that was still within operating range. If it reads low, the system lets concentration climb beyond the setpoint before triggering blowdown. Either failure mode costs money, and neither is visible until it shows up in water bills or on heat exchangers.

## How conductivity blowdown control works

A conductivity sensor in the basin or blowdown line reads dissolved solids continuously. A controller compares that reading to a programmed setpoint corresponding to the design cycles of concentration (COC). When the reading crosses the setpoint, the blowdown valve opens and fresh makeup water replaces what was discharged. The system is designed to run at the highest COC the water chemistry can sustain, since higher COC means less water discarded per unit of cooling output. The DOE Federal Energy Management Program documents a 20 percent reduction in makeup water and a 50 percent reduction in blowdown when moving from 3 to 6 COC -- a difference controlled entirely by where the sensor's reading lands relative to actual basin concentration. ([DOE FEMP Best Management Practice #10: Cooling Tower Management](https://www.energy.gov/femp/best-management-practice-10-cooling-tower-management))

**How to detect conductivity sensor drift before it accumulates cost:**

1. Cross-check with a calibrated handheld meter at each maintenance visit. A divergence of more than 5 percent means the loop measurement should not be trusted to control blowdown until recalibrated.
2. Pull blowdown valve timestamps and conductivity readings from the historian for a rolling 60-day window. Rising event frequency with stable makeup water quality points to the sensor, not the process.
3. Track blowdown events normalized to cooling load. Fouling-driven high-bias drift appears as more blowdown events per unit of heat rejection over time, with no change in ambient conditions or system load to explain it.
4. Compare makeup water conductivity readings over the same period. If makeup quality is stable and blowdown frequency is rising, the sensor or the controller setpoint has changed -- not the incoming water.

## Why cycles of concentration are the performance metric

The conductivity setpoint corresponds directly to cycles of concentration: the ratio of dissolved solids in the circulating water compared to the makeup water. At three cycles of concentration, the circulating water is three times as concentrated as the incoming makeup. At six cycles, it is six times as concentrated, meaning the system has extracted six times the evaporative cooling work from each unit of water before discharging it.

The Department of Energy's Federal Energy Management Program, in its Best Management Practice for Cooling Tower Management, documents the consequence of that difference: increasing cycles from three to six reduces cooling tower makeup water consumption by 20 percent and cooling tower blowdown by 50 percent. ([DOE FEMP Best Management Practice #10: Cooling Tower Management](https://www.energy.gov/femp/best-management-practice-10-cooling-tower-management))

Most cooling towers run at two to four cycles of concentration. The practical ceiling is set by water chemistry: calcium, magnesium, silica, and other dissolved minerals will eventually scale heat exchange surfaces or corrode metal components if concentration runs too high. Water treatment programs add scale inhibitors and corrosion inhibitors specifically to allow higher cycles of concentration without those chemistry problems. But there is a second constraint that receives less attention: the accuracy of the conductivity measurement that tells the system what concentration it is actually running at.

## What sensor drift does to blowdown frequency

Conductivity sensors in cooling tower service face a corrosive environment. Basin water contains biological growth, suspended solids, scale-forming minerals, and treatment chemicals. Sensor fouling from biofilm and mineral deposits is the most common failure mode, and the most common direction of failure is a reading that drifts high: a deposit on the sensor surface creates an impedance that the controller interprets as elevated dissolved solids in the water.

A sensor reading high produces the same control response as actual high concentration: it triggers blowdown. If the setpoint is 1,500 microsiemens per centimeter and the sensor reads 1,600 when the actual basin conductivity is 1,200, the controller sees an out-of-spec condition and opens the valve. The water being discharged was at 1,200 microsiemens, well within the setpoint, and capable of running through additional evaporative cycles before requiring blowdown.

This is not a hypothetical edge case. Sensor fouling accumulates gradually, and in many plants the cleaning interval for conductivity sensors is set by a calendar schedule rather than by measurement-to-measurement agreement. A sensor cleaned monthly in a high-load summer period is operating for weeks with accumulating offset. During that interval, every blowdown event the offset triggers is water the system did not need to discharge.

The reverse failure also occurs: a sensor that reads low because of a calibration shift or a failed element delays blowdown past the intended setpoint. Scale begins depositing on heat transfer surfaces, thermal performance drops, and in severe cases chemical treatment effectiveness falls as the system runs beyond its design envelope. Scale deposits of even 1/16 inch on heat exchanger surfaces can reduce thermal efficiency by roughly 10 percent. ([Rahmani et al., Applied Thermal Engineering, 2017, doi:10.1016/j.applthermaleng.2016.10.191](https://www.sciencedirect.com/science/article/abs/pii/S1359431116341849))

## Quantifying the cost of over-blowdown

The DOE documents a 50 percent reduction in blowdown when moving from three to six cycles of concentration, and that figure provides a basis for estimating what premature blowdown costs. The calculation depends on facility size, local water costs, and sewer discharge fees, but the structure is consistent:

**At a facility with 1 million gallons per day of makeup water:**

| Operating scenario | Approximate daily makeup water | Approximate daily blowdown |
|---|---|---|
| 6 cycles of concentration (design intent) | 1,000,000 gallons | ~200,000 gallons |
| 3 cycles of concentration (sensor reads high) | 1,200,000+ gallons | ~400,000 gallons |
| Difference from premature blowdown | 200,000+ gallons/day | ~200,000 gallons/day |

*Modelled example using DOE FEMP documented percentage differences; actual values depend on evaporation rate, local water chemistry, and the degree of sensor offset.*

That makeup water difference carries three layers of cost. First, water purchase cost: industrial water rates vary by region, but an industrial facility paying in the range of $1 to $5 per thousand gallons for purchased water faces a material cost when hundreds of thousands of gallons per day are discharged unnecessarily. Second, sewer and wastewater discharge costs: many jurisdictions charge for cooling tower blowdown discharge separately from water purchase, and in areas with sewer surcharges for high-conductivity industrial discharge, this cost can approach or exceed the water purchase cost. Third, chemical treatment cost: every gallon of blowdown replaced with fresh makeup water requires treatment chemicals to protect the system from the new makeup water's chemistry.

For facilities that discharge cooling tower blowdown directly to surface waters, there is a fourth cost layer: regulatory exposure. Cooling tower blowdown discharged to waters of the United States requires authorization under the EPA's National Pollutant Discharge Elimination System (NPDES) program, and industrial discharge permits for many categories include limits on specific conductance or total dissolved solids as a proxy for concentrated minerals and treatment chemicals. A sensor reading low (allowing cycles of concentration to run above design) may produce a discharge that exceeds permit limits even when the control system appears to be operating normally, because the system registers a conductivity that is within setpoint while actual basin concentration has climbed past it. ([40 CFR Part 122, EPA NPDES Permit Regulations](https://www.ecfr.gov/current/title-40/chapter-I/subchapter-D/part-122))

None of this is visible at the level of a single blowdown event. It becomes visible in trends: makeup water consumption trending upward over a season, chemical feed rates increasing without a corresponding change in makeup water quality, blowdown frequency in the historian rising faster than ambient temperature or load would predict.

## The diagnostic that is already in the historian

The same diagnostic approach that reveals [DO sensor drift in aeration systems](/blog/do-sensor-calibration-interval-activated-sludge.html) applies to conductivity sensor drift in cooling tower control. The data is in the historian: blowdown valve timestamps, conductivity sensor readings, makeup water flow, and any makeup water quality monitoring already being logged.

The signature of a sensor reading high is blowdown events that cluster at a conductivity reading just above the setpoint, while makeup water conductivity readings stay constant and blowdown event frequency increases over time on a consistent load. The signature of a sensor reading low is the opposite: infrequent blowdown with conductivity readings that stay below the setpoint even as the tower accumulates load, followed eventually by scale chemistry indicators or pressure-drop increases in the heat exchangers.

This is a temporal version of the spatial drift problem described in a parallel-equipment analysis. In that case, two identical aeration basins showed diverging blower runtime and energy use that reflected sensor offset rather than actual process differences. Here, the same principle operates over time in a single system: the measurement feeding the control loop has an offset, the loop acts on the offset rather than the process state, and the cost accumulates in the historian before it appears anywhere else.

The full parallel-basin methodology is in [why parallel equipment drifts apart, and what the gap costs](https://aquamesh.ai/blog/why-parallel-equipment-drifts.html). For data centers where cooling tower blowdown directly affects the WUE metric, the connection between sensor drift and reported efficiency is covered in [data center WUE: what the metric measures, what it misses, and what it takes to move it](https://aquamesh.ai/blog/data-center-wue-measurement-gap.html).

## What accurate conductivity measurement enables

When the conductivity sensor controlling blowdown is reading accurately and corrected between calibration intervals, the control system can run the tower at the cycles of concentration the water treatment program was designed for. The 20 to 50 percent water savings the DOE documents from moving from three to six cycles are achievable without chemistry changes or capital investment -- they require that the measurement driving the control loop reflects actual basin conditions.

For industrial facilities with large cooling loads -- power generation, petrochemical, food and beverage processing, large manufacturing plants -- the difference between running at three cycles and six cycles is not a marginal optimization. At the scale of a 2,000-ton cooling tower system, it is a question of hundreds of thousands of gallons per day.

The diagnostic questions are straightforward. Is the conductivity sensor reading the same at the start and end of a calibration interval? Does blowdown frequency track makeup water conductivity the way it should, or does it drift independently? Are blowdown events triggering at the expected conductivity setpoint, or consistently below it? The answers are in the historian. The constraint is having a way to pull the data at the resolution that shows blowdown-event-level behavior over a long enough window to separate sensor drift from process variation.

---

If your cooling tower water use has trended upward or your blowdown frequency looks inconsistent with your system load, the control data is already in your historian.

See what a water system measurement review looks like at an operating industrial facility: [a membrane-bioreactor water reuse plant case study](https://aquamesh.ai/case-studies/water-reuse-plant.html). Or [reach out to schedule a working session with the team](https://aquamesh.ai/#contact).

*Alex Towfigh is a founder at AquaMesh.*
