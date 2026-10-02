# AQUORA — System 2 (Dispensing Machine) Setup & Hardware Guide

## Hardware Overview
- **Microcontroller**: Standard ESP32 Dev Module (38-pin / 30-pin)
- **Actuators**: 5x 12V/24V Peristaltic / Diaphragm Liquid Pumps via MOSFET Driver Board
- **Sensors**: 5x Hall-Effect Liquid Flow Sensors (pulse output)
- **Safety**: 1x Physical Emergency Stop Mushroom Switch (Active LOW)
- **Target Sketch**: `AQUORA_SYSTEM_2_DISPENSING_MACHINE/AQUORA_SYSTEM_2_DISPENSING_MACHINE.ino`

---

## Hardware Pinout

| Channel | Pump GPIO (Output) | Flow Sensor GPIO (Interrupt) | Function |
|---|---|---|---|
| Channel 1 | GPIO 25 | GPIO 34 | Primary Sanitizer |
| Channel 2 | GPIO 26 | GPIO 35 | Aloe Vera / Secondary |
| Channel 3 | GPIO 27 | GPIO 32 | Disinfectant / Herbal |
| Channel 4 | GPIO 14 | GPIO 33 | Premium Moisturizing |
| Channel 5 | GPIO 12 | GPIO 39 | Extra Sanitizer Formula |
| **Emergency Stop** | — | **GPIO 36** | **Hardware Emergency Stop (Active LOW)** |
| Status LED | GPIO 2 | — | Onboard Status Indicator |

---

## Safety Architecture & Verification
1. **Boot Pump State**: On power-up and reset, all pump GPIO pins are driven `LOW` immediately in `PumpController::init()` before network or sensors initialize.
2. **Mutual Exclusion Interlock**: Software interlock prevents more than one pump running simultaneously.
3. **Emergency Stop**: Dedicated hardware interrupt on GPIO 36 immediately disables all pumps in sub-millisecond time.
4. **Hardware Watchdog**: Hardware WDT set to 8 seconds (`WATCHDOG_TIMEOUT_SEC`). If loop hangs, MCU reboots with pumps forced off.
5. **No-Flow Protection**: If a pump is running but no flow sensor pulses are detected within timeout (default 3s), the pump shuts down immediately with error `ERR_NO_FLOW`.
6. **Max Volume Guard**: Physical cap prevents dispensing beyond maximum container capacity even if command is malformed.
7. **Volume Verification**:
   $$\text{Actual Volume (ml)} = \frac{\text{Flow Pulses}}{\text{Calibration Factor (pulses/ml)}}$$
   Pumps shut down when actual measured pulses equal target pulses. Only after pump stop is status updated to `DISPENSED`.
