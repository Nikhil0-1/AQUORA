# AQUORA System 2 — Sanitizer Dispensing Machine

## Firmware Architecture & Safety Controls
* **Target Hardware:** ESP32 (WROOM-32D / Industrial Control PCB)
* **Actuation:** 5 Independent 12V DC Pumps driven by logic-level MOSFETs with flyback diodes
* **Measurement:** 5 Independent Hall-effect turbine flow sensors on external interrupt pins
* **Hardware Interlock:** Single-pump software and GPIO verification ensures only one pump is energized at any time
* **Safety Rules:**
  - 3-second no-flow auto-abort
  - 45-second maximum pump runtime timeout
  - Hardware Emergency Stop input (Active LOW on GPIO 36)
  - Duplicate job protection (persisted NVS hash table)
  - Hardware Task Watchdog (10-second window)

## GPIO Pinout Table
| Channel | Function | Pump GPIO (MOSFET Gate) | Flow Sensor GPIO (Interrupt) |
| :--- | :--- | :--- | :--- |
| Channel 1 | Classic Sanitizer | GPIO 25 | GPIO 34 |
| Channel 2 | Aloe Vera Sanitizer | GPIO 26 | GPIO 35 |
| Channel 3 | Herbal Sanitizer | GPIO 27 | GPIO 32 |
| Channel 4 | Premium Sanitizer | GPIO 14 | GPIO 33 |
| Channel 5 | Family Sanitizer | GPIO 12 | GPIO 39 |

* **Emergency Stop Input:** GPIO 36 (Active LOW with pullup)
* **Status LED:** GPIO 2

## PlatformIO Build Instructions
```bash
cd firmware/system-2-dispensing-machine
pio run
pio run --target upload
```
