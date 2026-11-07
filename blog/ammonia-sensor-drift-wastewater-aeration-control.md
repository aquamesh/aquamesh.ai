---
title: Ammonia sensor drift in wastewater aeration control
slug: ammonia-sensor-drift-wastewater-aeration-control
date: 2026-11-07
section: Field notes
description: How ammonium sensor drift degrades ABAC aeration control, wastes blower energy and creates nitrogen permit compliance gaps.
tags: wastewater, sensors, aeration, nitrogen, activated sludge
---

A 1 mg/L positive drift in an online ammonium sensor running ammonia-based aeration control (ABAC) makes the blower work harder than the process needs, every hour the bias persists. A negative drift at a permit-sensitive plant does the opposite: the process under-aerates, nitrification stalls, and the next grab sample surprises the operator. Both are common. Neither shows up in the normal daily walk-through.

This post covers how ammonium sensors drift in activated sludge service, what that drift does to an ABAC control loop, and what operators can check to catch it before it costs money or compliance points.

## How ABAC uses the ammonium signal

In a fixed-setpoint system, the operator sets a dissolved oxygen (DO) target and blower airflow modulates to hold it. In ABAC, the DO setpoint is a function of the measured ammonium concentration in the aeration basin. When ammonium is high and nitrification demand is high, the system raises the DO setpoint; when ammonium is low, it backs off. The logic trims aeration to the actual nitrogen load rather than the worst-case load.

The energy benefit is real. The [U.S. EPA Nutrient Control Design Manual](https://cfpub.epa.gov/si/si_public_record_report.cfm?dirEntryId=236566) documents that properly tuned ABAC systems can reduce aeration energy 10 to 30 percent relative to fixed-DO operation by eliminating the over-aeration margin that fixed setpoints require when loading is low (EPA Report No. 600/R-10/100, Chapter 5). That saving disappears when the ammonium sensor reading the setpoint signal is wrong.

## Why ammonium sensors drift

Most online ammonium analyzers used in municipal and industrial wastewater use ion-selective electrodes (ISEs), the same measurement principle as benchtop ammonium probes. An ISE generates a voltage proportional to the logarithm of ammonium activity. Two mechanisms cause that voltage to drift in field conditions.

**Reference electrode fouling.** The ISE measurement is a potential difference between the measuring electrode and a reference electrode. The reference electrode contains a fill solution that contacts the sample through a small junction. In a wastewater aeration basin, biological solids, oils, and sulfide compounds can clog or coat that junction over weeks. As the junction fouls, the reference potential drifts, and the ammonium reading drifts with it. [pH sensors face the same fouling mechanism at the reference junction](/blog/ph-sensor-drift-wastewater-activated-sludge.html), and ammonium ISEs show similar calibration drift timelines in mixed liquor service.

**Ion interference.** Ammonium ISE membranes select for NH4+ based on ionic size, but potassium (K+) and sodium (Na+) interfere because they share similar hydrated ionic radii. At a municipal plant with a stable industrial load, K+ and Na+ concentrations are roughly constant and the interference is corrected during calibration. But when industrial contributions or stormwater dilution shift the background ion matrix, a calibration accurate two weeks ago introduces systematic bias without any physical change to the sensor. The [Standard Methods for the Examination of Water and Wastewater](https://www.standardmethods.org/) (Method 4500-NH3) documents the ionic strength adjustment and interference correction procedures that apply to ISE ammonium measurement in wastewater matrices.

**Temperature effects.** ISE sensitivity follows the Nernst equation, which is temperature-dependent. A 10 degree C shift in sample temperature changes the theoretical electrode slope by roughly 3.4 percent. Most instruments include automatic temperature compensation, but if the compensation was characterized during summer commissioning, it may carry a fixed offset in winter operation.

None of these failure modes produce an alarm. The sensor stays online, the reading stays in a plausible range, and the ABAC loop responds to a signal that does not match the actual ammonium concentration in the basin.

## What drift does to the control loop

Consider an ABAC plant where the target is 2.0 mg/L NH4-N at the end of the aeration zone. The control logic holds DO at a setpoint calculated as: DO setpoint = 1.5 + (measured ammonium / 2). At true ammonium = 1.0 mg/L, the DO setpoint is 2.0 mg/L.

If the ammonium sensor drifts positive by 1.5 mg/L, the measured reading is 2.5 mg/L where the true value is 1.0 mg/L. The control loop calculates a DO setpoint of 2.75 mg/L instead of 2.0 mg/L, a 37.5 percent increase in the target. The blower runs harder to hold that inflated setpoint.

In a modelled example for a 5 MGD activated sludge plant with 200 kW of installed blower capacity running at 65 percent load, a 37.5 percent increase in DO setpoint translates to roughly 75 kW of additional blower load. (This is a simplification; [aeration energy scales non-linearly with airflow and diffuser backpressure](/blog/aeration-energy-cost-wastewater-plants.html), and actual response depends on blower type and control architecture.) At $0.10/kWh operating continuously, that is approximately $5,400 per month in avoidable blower cost for every month the bias persists undetected. This is a modelled example; actual costs depend on plant size, blower efficiency, diffuser condition, and local electricity tariff.

A negative drift carries permit risk. If the ammonium sensor reads low when ammonium is actually elevated, the ABAC system backs off aeration while the actual nitrogen load requires more. [NPDES nitrogen permit limits are evaluated against 30-day and 7-day average discharge values](/blog/nitrogen-permit-compliance-sampling-gap.html), so a persistent bias can accumulate into a reportable violation even if no individual grab sample triggers an immediate alarm.

## Where the problem hides

In a plant running [continuous DO sensor monitoring](/blog/do-sensor-calibration-interval-activated-sludge.html), a step change or sudden sensor failure is usually visible: the DO reading spikes or drops, the blower response changes, and the operator notices. Gradual ammonium sensor drift does not produce a visible step. The ABAC loop chases the drifting signal smoothly; blower energy creeps upward over two to six weeks; effluent quality degrades slowly.

The diagnostic signature is a divergence between the online ammonium reading and the periodic grab sample from the same location. Most plants collect a grab sample from the end of the aeration zone one to three times per week. If the online reading and the grab sample disagree by more than the expected diurnal and analytical variation, the sensor needs investigation.

In [intermittent aeration systems running ABAC](/blog/intermittent-aeration-nitrogen-removal-do-control.html), where the ammonium signal drives both the DO setpoint and the aerobic/anoxic cycle timing, a drifted sensor can simultaneously waste energy and distort the nitrogen removal cycle. The performance loss compounds across both dimensions.

## Calibration and validation intervals

Published guidance from the [Water Environment Federation Nutrient Removal Manual of Practice No. 34](https://www.wef.org/resources/publications/manuals-of-practice/) recommends site-specific calibration schedules for online analyzers based on the fouling rate observed during commissioning, updated when the operating load changes significantly. The EPA Nutrient Control Design Manual recommends verifying online analyzers against grab samples at least weekly during initial commissioning and recalibrating when deviations exceed 10 percent of the measured value.

A practical starting point for most activated sludge plants in continuous aeration service:

- Weekly: compare the online ammonium reading to a grab sample analyzed on-site or sent to a certified laboratory.
- Every two weeks: inspect the reference electrode junction and replace fill solution if cloudy or discolored.
- Monthly: run a two-point calibration using fresh standard solutions prepared from a traceable standard.
- After any chemical slug load such as an industrial spill, septage acceptance, or a step change in industrial contribution: re-verify immediately.

## Detection with continuous data

A sensor drifting gradually produces a consistent bias rather than random noise. If historical data is available from a SCADA historian or continuous monitoring platform, plotting the rolling difference between online readings and grab sample values over time reveals whether the divergence is growing. A trend in that difference is the signature of gradual drift; random scatter around zero indicates a calibrated sensor.

The same pattern-based approach applies across [multiple sensors in parallel or sequential service](/blog/spectral-change-analysis-vs-calibrated-parameters.html): when two ammonium sensors at different basin locations both drift in the same direction at the same rate, a shared environmental driver such as a temperature shift or ion matrix change is more likely than independent mechanical failure. Separating those two causes matters because the corrective actions are different.

Ammonium sensor drift in ABAC service is predictable, slow-moving, and detectable. That makes it preventable. The cost of a weekly grab-sample comparison and a monthly calibration is a fraction of one month of avoidable blower energy or a single permit exceedance.

---

If your plant runs ABAC or is evaluating ammonium-based setpoint control, AquaMesh can show you how continuous ammonium monitoring integrates with existing SCADA and historian data to detect sensor drift before it affects blower operation. [Request a demo.](https://aquamesh.ai/#contact)

*Alex Towfigh is a founder at AquaMesh.*
