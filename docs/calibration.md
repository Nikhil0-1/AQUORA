# AQUORA Flow Sensor Calibration Guide

## Why Calibration is Essential
Sanitizer viscosity varies significantly between 70% alcohol sprays and Aloe Vera gels. A water-only flow sensor factor will miscalculate volume. Each channel must be calibrated experimentally.

## Calibration Procedure

1. Open **Admin Dashboard** → Navigate to **Sensor Calibration**.
2. Select target Channel (1 to 5).
3. Place a graduated 250ml laboratory beaker under the nozzle.
4. Set **Test Target Volume** to `100 ml` and trigger test dispense.
5. Read actual liquid volume output in beaker (e.g. `95 ml`).
6. Enter `95` into **Actual Measured Output**.
7. Click **Recalibrate Channel & Save Factor**.

## Formula
$$\text{New Factor} = \text{Current Factor} \times \left( \frac{\text{Test Target Volume}}{\text{Actual Measured Volume}} \right)$$

The new factor is saved to non-volatile storage (NVS) on the ESP32 via `/api/v1/admin/machines/:id/channels/:ch`.
