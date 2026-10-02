# AQUORA — Machine Authentication Protocol

## Overview
AQUORA dispensing machines (System 2) and payment terminals (System 1) connect directly to the cloud backend (Supabase) via authenticated REST/Realtime channels. Service role keys and database master passwords are never placed in firmware.

---

## Device Identity & Credentials

Each physical hardware unit has a unique identity stored in the database:
- **`payment_terminals`**: Identified by `terminal_id` (e.g., `AQ-PT-001`).
- **`dispensing_machines`**: Identified by `machine_id` (e.g., `AQ-DM-001`).

Firmware stores:
1. `AQUORA_MACHINE_ID` / `AQUORA_TERMINAL_ID` in `config.h`
2. `AQUORA_DEVICE_TOKEN` / `AQUORA_MACHINE_SECRET` in `secrets.h` (excluded from git)

---

## Authentication Flow

### 1. Job Retrieval (System 2 Polling / Realtime)
When System 2 queries for queued jobs:
- System 2 requests jobs matching:
  `machine_id = eq.AQ-DM-001 AND status = eq.QUEUED`
- Authorization header transmits machine API token / Bearer token.
- Row-Level Security (RLS) restricts access so `AQ-DM-001` can only claim jobs addressed to itself.

### 2. Job Execution Lock
Before starting dispensing:
- Machine updates `dispense_jobs.status` to `DISPENSING` with timestamp `started_at = now()`.
- Machine verifies that the job ID has not been previously executed or marked expired.

### 3. Hardware Completion
Once pulses confirm exact volume dispensed:
- System 2 sends PATCH request updating:
  - `status = 'DISPENSED'`
  - `dispensed_volume_ml = <measured_volume>`
  - `completed_at = now()`
- Supabase triggers / application logic update parent order status to `DISPENSED`.

---

## Heartbeat & Telemetry
System 2 transmits periodic heartbeat updates every 30 seconds to table `machine_telemetry`:
- `machine_id`: String (e.g. `AQ-DM-001`)
- `status`: `IDLE` | `DISPENSING` | `ERROR` | `SAFE_MODE`
- `active_pump`: Channel integer (or null)
- `current_pulses`: Pulse counter
- `emergency_stop`: Boolean status of GPIO 36
- `wifi_rssi`: Signal strength in dBm
- `uptime_seconds`: Running time since boot
