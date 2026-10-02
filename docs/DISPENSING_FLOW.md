# AQUORA — System 2 ESP32 Direct Dispensing Flow

## 1. Physical Hardware Configuration

System 2 is an ESP32 microcontroller controlling 5 independent sanitizer dispensing channels:

| Channel | Formula / Product | Pump GPIO (Output) | Flow Sensor GPIO (Input Pullup) | Tank Capacity |
|---|---|---|---|---|
| **Channel 1** | Classic Hand Sanitizer | **GPIO 25** | **GPIO 34** (IRAM ISR) | 5000 ml |
| **Channel 2** | Aloe Vera Soothing Gel | **GPIO 26** | **GPIO 35** (IRAM ISR) | 5000 ml |
| **Channel 3** | Herbal Neem Disinfectant | **GPIO 27** | **GPIO 32** (IRAM ISR) | 5000 ml |
| **Channel 4** | Premium Moisturizing | **GPIO 14** | **GPIO 33** (IRAM ISR) | 5000 ml |
| **Channel 5** | Family Antimicrobial | **GPIO 12** | **GPIO 39** (IRAM ISR) | 5000 ml |
| **E-Stop** | Emergency Stop Switch | — | **GPIO 36** (Active LOW) | — |
| **Status LED** | System Health Indicator | **GPIO 2** | — | — |

---

## 2. Dispensing Sequence & Safety Rules

### Rule 1: Single-Pump Mutual Exclusion Interlock
Only **ONE** pump may be energized at any instant. Software checks `isAnyPumpActive()` before driving any GPIO HIGH. If a pump is currently running, no new job can start.

### Rule 2: Absolute Boot Safety
On boot, **ALL** pump GPIOs (25, 26, 27, 14, 12) are explicitly driven `LOW` before Wi-Fi, peripherals, or any logic initializes.

### Rule 3: Flow Sensor Feedback — Never Fixed Delays
Actual liquid dispensing is strictly computed from interrupt-driven flow sensor pulses:
$$\text{Target Pulses} = \text{Target Volume (ml)} \times \text{Calibration Factor (pulses/ml)}$$
Standard factory baseline: $10.0\text{ pulses/ml}$ ($1000\text{ pulses} = 100\text{ ml}$).
A fixed delay like `delay(5000)` is **strictly prohibited**.

### Rule 4: Dry-Run / Low-Flow Safety Cutoff
If the pump is energized and fewer than 3 pulses are recorded within 3,000 milliseconds:
1. The pump GPIO is de-energized immediately.
2. The job is marked `FAILED` with error code `FLOW_ERROR`.
3. An event is recorded to prevent pump motor burn-out.

### Rule 5: Hard Runtime Cap
Even under valid flow, the maximum continuous pump runtime is capped at 45 seconds to guard against sensor wiring failures.

### Rule 6: Emergency Stop
GPIO 36 is wired to an active-LOW physical E-stop switch. An immediate falling-edge hardware interrupt trips all pumps LOW in $< 50\mu s$ and places the machine in `SAFE_MODE`.

---

## 3. Persistent Replay & Reboot Reconciliation

1. **NVS Job Tracking**:
   Completed job IDs are committed to ESP32 Non-Volatile Storage (Preferences/NVS). If a machine receives a duplicate or replayed job packet, it checks NVS:
   ```cpp
   if (StorageManager::isJobProcessed(job.jobId)) {
       job.rejectionReason = "DUPLICATE_JOB";
       return false; // Reject execution
   }
   ```

2. **Reboot Recovery**:
   If power is lost mid-dispense, the ESP32 powers on with all pumps LOW. It queries Supabase on reconnection to reconcile job state rather than blindly resuming a half-completed job.
