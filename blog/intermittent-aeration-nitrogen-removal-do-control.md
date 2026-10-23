---
title: Intermittent aeration for nitrogen removal: what DO sensor precision actually controls
slug: intermittent-aeration-nitrogen-removal-do-control
date: 2026-10-23
section: Field notes
description: Plants using intermittent aeration for biological nitrogen removal rely on dissolved oxygen control precision. Here is what happens to both nitrogen performance and energy savings when that measurement drifts.
tags: nitrogen removal, intermittent aeration, dissolved oxygen, SND, wastewater treatment
---

Biological nitrogen removal is one of the more demanding process control challenges in activated sludge treatment. Plants with tight effluent nitrogen limits need to run two competing biological processes: nitrification under aerobic conditions and denitrification under anoxic ones, efficiently, in the same biological system. For plants using intermittent aeration to accomplish this in a single-basin configuration, the precision of dissolved oxygen control during aeration cycles is not an instrumentation detail. It is the variable that determines whether the strategy works.

## What intermittent aeration is trying to do

Conventional biological nitrogen removal stages aerobic and anoxic zones in sequence: ammonia is nitrified to nitrate in an aerated zone, then denitrified to nitrogen gas in a downstream anoxic zone. The system is reliable but capital-intensive and requires careful hydraulic design.

Intermittent aeration takes a different path: the same basin alternates between aerobic and anoxic phases by cycling blowers on and off. During the aerated phase, nitrifiers convert ammonia to nitrate. During the unaerated phase, denitrifiers reduce nitrate to nitrogen gas, using carbon already present in the mixed liquor. Some organisms can carry out both reactions near-simultaneously at low dissolved oxygen concentrations, a phenomenon called simultaneous nitrification-denitrification (SND). The EPA Nutrient Control Design Manual identifies low-DO operation, typically below 1.0 mg/L, as a condition that promotes SND in conventional activated sludge by creating anoxic microsites within biological flocs. ([EPA, Nutrient Control Design Manual, 2010, Section 5](https://www.epa.gov/sites/default/files/2019-08/documents/nutrient-control-design-manual.pdf))

A 2022 review in Chemical Engineering Journal analyzed over 50 intermittent aeration studies and found that precise DO control during aeration phases was the most consistent predictor of nitrogen removal efficiency, ahead of cycle length or influent carbon-to-nitrogen ratio. ([Miao et al., 2022, Chemical Engineering Journal, doi:10.1016/j.cej.2021.133516](https://www.sciencedirect.com/science/article/abs/pii/S1385894721047604))

The practical appeal is real: intermittent aeration can achieve substantial nitrogen removal without a separate anoxic zone, with lower aeration energy than continuous-aeration systems, and with flexible response to variable influent loads. These advantages depend on cycle timing, and cycle timing depends on DO measurement.

## Where DO control precision comes in

The cycle timing in intermittent aeration is almost always governed by a dissolved oxygen setpoint rather than a fixed timer. Aeration turns on when DO falls below a lower bound; it turns off when DO rises above an upper bound. The accuracy of that DO band controls the effectiveness of the strategy:

**Sensor reading low (common fouling failure):** A sensor that reads 0.4 mg/L when actual DO is 1.8 mg/L keeps blowers running long past the point where nitrification has completed. The aerobic phase extends beyond the design intent. The anoxic fraction shrinks. Denitrification suffers, nitrogen removal drops, and the plant uses more electricity than the intermittent strategy was supposed to require.

**Sensor reading high:** Aeration shuts off early. The basin does not complete nitrification in one cycle. Ammonia carries over. In a plant with a permit nitrogen limit, this is an effluent compliance risk, not just an energy problem.

**Fouling that accumulates between cycles:** Mixed liquor accumulates on membrane or optical sensor surfaces during the unaerated phase. When aeration restarts, the sensor enters the aerobic phase with an offset that compounds over successive cycles if cleaning intervals are not calibrated to match actual fouling rates.

The cumulative effect is that the DO setpoints operators specify on the control screen may not correspond to the dissolved oxygen concentration the organisms experience. The blower control loop optimizes against a sensor output, not against the process state.

## What this looks like in practice

The same phenomenon described in the parallel-basin aeration analysis applies here in a temporal rather than spatial dimension. In that case, two basins running simultaneously showed a DO divergence that reflected sensor drift rather than process differences: one blower was pinned at maximum output, consuming over $3,000 per year more than its twin, for the full 25-day record. The spatial version was visible by comparing basins side by side. The parallel equipment drift analysis is in [why parallel equipment drifts apart](https://aquamesh.ai/blog/why-parallel-equipment-drifts/), and the full historian data methodology is in [what 25 days of historian data actually shows about a treatment plant](https://aquamesh.ai/blog/what-25-days-of-historian-data-shows/).

The temporal version in intermittent aeration requires a different analysis: charting DO sensor output against blower on/off timestamps at five-minute or finer resolution, and comparing aerobic phase duration over time. A sensor reading accurately produces aerobic phases of consistent duration for a given influent load. A sensor that is drifting produces phases that systematically lengthen (reading low, blowers run long) or shorten (reading high, blowers cut off early) in ways that do not track influent load changes.

Both versions share the same root cause: the measurement feeding the control loop has an offset that the loop cannot self-detect, because there is no independent reference running alongside it.

## The energy calculation for intermittent aeration

The aeration energy baseline for secondary treatment, around 1,500 kWh per million gallons for activated sludge, assumes reasonably continuous aeration. Intermittent aeration in a nitrogen-removal configuration typically aims to reduce aeration runtime to 50 to 70 percent of total time, depending on the carbon-to-nitrogen ratio of the influent and the cycle design. That would imply aeration energy in the range of 750 to 1,050 kWh per million gallons when timing is accurate.

At a 10 MGD plant and the current EIA industrial rate of $0.0977 per kWh ([EIA Electric Power Monthly, September 2026](https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a)), the difference between accurate intermittent aeration (approximately 900 kWh/MG as a midpoint) and sensor-extended aeration (1,500 kWh/MG because the sensor is holding blowers on too long) is approximately $215,000 per year at that scale.

**Modelled example for a 10 MGD plant with intermittent aeration:**

| | Accurate DO control | DO sensor drifting low |
|---|---|---|
| Aeration runtime share | 60% | 100% (effectively continuous) |
| Estimated kWh/MG | 900 | 1,500 |
| Annual energy cost at $0.098/kWh | $193,100 | $321,900 |
| Annual cost difference | | $128,800 |

This is a modelled example using published benchmarks; actual values depend on plant-specific loading, cycle design, and the degree of sensor offset. The direction is consistent: sensor drift in an intermittent aeration system does not only affect nitrogen removal performance. It erodes the energy savings that justified the intermittent strategy in the first place.

## What accurate DO measurement enables

When DO measurement in an intermittent aeration system is continuous, accurate, and corrected against drift between calibration intervals, the control loop can do what it was designed for: maintain the aerobic-to-anoxic balance that both nitrification and denitrification require.

For plants approaching permit limits on total nitrogen, the margin for process error is narrow. A sensor that introduces a systematic offset into the timing of aeration cycles is a measurement problem that manifests as an effluent compliance risk. The issue is usually visible in the historian data before it appears in the permit reporting: aerobic phase durations extending over time, DO baseline at cycle start gradually increasing, nitrogen removal efficiency declining in ways that do not correlate with influent load.

The diagnostic questions are the same ones that apply to continuous aeration systems. Are the DO sensors reading accurately between calibrations? Does blower runtime at a given influent load match what the setpoints predict? Are cycle times stable, or are they drifting? The methodology for that analysis is in [aeration energy at wastewater plants: the cost, the waste, and the measurement gap](https://aquamesh.ai/blog/aeration-energy-cost-wastewater-plants/).

None of this analysis requires new hardware. The data is in the historian. The constraint is having a way to extract it at the resolution that shows cycle-level behavior, over a long enough window, against a reference that was not subject to the same drift.

---

If your plant uses intermittent aeration for nitrogen removal and you want to understand whether your DO control is performing as designed, the place to start is the cycle data already in your historian.

See what that review looked like at an operating plant: [a membrane-bioreactor water reuse plant case study](https://aquamesh.ai/case-studies/water-reuse-plant.html). Or [reach out to schedule a working session with the team](https://aquamesh.ai/#contact).

*Alex Towfigh is a founder at AquaMesh.*
