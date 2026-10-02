# AQUORA — Hardware Flow Sensor & Pump Calibration

## Overview
Because liquid viscosity, tubing length, and pump tolerances vary between sanitizer formulations (e.g., watery liquid alcohol vs. thick aloe vera gel), each dispensing channel requires precise calibration.

---

## Calibration Formula

The microcontroller computes volume strictly via:
$$\text{Dispensed Volume (ml)} = \frac{\text{Sensor Pulses Counted}}{\text{Calibration Factor (pulses/ml)}}$$

Target pulses required for a job:
$$\text{Target Pulses} = \text{Target Volume (ml)} \times \text{Calibration Factor (pulses/ml)}$$

---

## Default Calibration & Baseline

| Channel | Formula / Product | Default Pulses/ml | 100ml Pulse Target |
|---|---|---|---|
| Channel 1 | Classic Liquid Sanitizer | 10.0 (or 0.45 baseline) | 1,000 pulses |
| Channel 2 | Aloe Vera Gel | 10.0 (or 0.38 baseline) | 1,000 pulses |
| Channel 3 | Disinfectant / Herbal | 10.0 (or 0.45 baseline) | 1,000 pulses |
| Channel 4 | Moisturizing Formula | 10.0 (or 0.42 baseline) | 1,000 pulses |
| Channel 5 | Standard Formulation | 10.0 (or 0.45 baseline) | 1,000 pulses |

*Note: Default firmware and database configuration sets 10 pulses/ml as the baseline reference, but calibration must be performed with actual liquid on physical hardware.*

---

## Step-by-Step Field Calibration Procedure

1. **Prepare Equipment**:
   - High-precision graduated cylinder or digital scale (1g = ~1ml for standard liquid sanitizer).
   - Sanitizer formulation loaded into target channel reservoir.

2. **Trigger Calibration Dispense**:
   - Run a test dispense command of 1,000 pulses on the target channel:
     ```cpp
     CalibrationManager::performTestDispense(channel, 1000);
     ```

3. **Measure Actual Volume**:
   - Read the fluid volume collected in the graduated cylinder (e.g. 98.5 ml).

4. **Calculate Factor**:
   $$\text{New Factor} = \frac{1000 \text{ pulses}}{\text{Actual ml}}$$
   Example:
   $$\frac{1000}{98.5} = 10.152 \text{ pulses/ml}$$

5. **Store in System 2 NVS & Supabase**:
   - Apply factor locally in System 2:
     ```cpp
     CalibrationManager::applyAndSave(channel, 10.152);
     ```
   - Update `machine_channels.pulses_per_ml` in Supabase for cloud tracking.
