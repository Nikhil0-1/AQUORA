# AQUORA Machine Protocol

## Single-Pump Isolation Policy
To protect physical hardware and maintain 12V SMPS current limits:
- **Rule**: Only ONE pump can be active at any given moment.
- **Enforcement**:
  - In ESP32 Firmware: `pumpController.startPump(ch)` LOWs all 5 pumps, delays 50ms, then HIGHs target channel.
  - In Backend: Job queue validator rejects multi-pump commands.

## Dispensing Sequence

1. **Backend Verification**: Server receives payment webhook, validates HMAC signature, and marks payment `PAID`.
2. **Job Issuance**: Backend creates single `DispenseJob` `{ job_id, machine_id, channel, target_volume_ml }`.
3. **ESP32 Validation**: ESP32 checks `machine_id`, channel (1..5), target volume, and NVS duplicate job history.
4. **Pump Activation**: Target Pump N turns HIGH; Flow Sensor N counts ISR pulses.
5. **Progress Telemetry**: ESP32 posts `/dispense/progress` every 500ms; frontend displays live volume (`25 ml / 100 ml`).
6. **Automatic Stop**: When `dispensed_ml >= target_volume_ml`, Pump N turns LOW immediately.
7. **Completion Report**: ESP32 posts `/dispense/complete`; order marked `DISPENSED`.
