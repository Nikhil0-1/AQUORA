# 📦 AQUORA SYSTEM 2 (DISPENSING MACHINE) — ARDUINO IDE FIRMWARE PACKAGE

This folder contains the complete, standalone, production-grade firmware package for **AQUORA System 2 (Dispensing Controller, Machine ID: `AQ-DM-001`)**, packaged specifically for direct compilation and flashing via **Arduino IDE 2.x**.

---

## 📂 Folder Contents

```text
AQUORA_SYSTEM_2_DISPENSING_MACHINE/
├── AQUORA_SYSTEM_2_DISPENSING_MACHINE.ino   # Main Arduino sketch (setup & loop)
├── config.h                                 # Central machine settings & timing
├── pins.h                                   # GPIO mappings for pumps, sensors & E-Stop
├── version.h                                # Firmware (1.0.0) & protocol (v1) tags
├── secrets.h.example                        # Wi-Fi & backend secret template
├── secrets.h                                # Active credentials (git-ignored)
├── src/                                     # Subsystem modules (.cpp and .h)
│   ├── wifi_manager.cpp / .h                # Non-blocking Wi-Fi station
│   ├── api_client.cpp / .h                  # HTTPS job polling & reporting
│   ├── authentication.cpp / .h              # HMAC-SHA256 machine auth
│   ├── job_manager.cpp / .h                 # Job lifecycle & validation
│   ├── machine_state.cpp / .h               # 14 explicit dispenser states
│   ├── pump_controller.cpp / .h             # Single-pump interlock driver
│   ├── flow_sensor.cpp / .h                 # 5 independent IRAM ISR counters
│   ├── dispensing_controller.cpp / .h       # Closed-loop pulse tracking & auto-stop
│   ├── calibration.cpp / .h                 # Pulses-to-ml calibration
│   ├── safety_manager.cpp / .h              # 3s no-flow & 45s run-time cutoffs
│   ├── emergency_stop.cpp / .h              # Active LOW hardware E-stop interrupt
│   ├── telemetry.cpp / .h                   # Real-time state & metric reporting
│   ├── inventory_manager.cpp / .h           # Tank level tracking
│   ├── storage_manager.cpp / .h             # NVS persistent replay attack defense
│   ├── watchdog_manager.cpp / .h            # Hardware watchdog timer
│   └── logger.cpp / .h                      # Serial diagnostic logging
├── include/                                 # Hardware configuration headers
│   ├── board_config.h                       # Board electrical definitions
│   ├── safety_limits.h                      # Hardware limits & thresholds
│   └── machine_config.h                     # Static channel hardware table
├── libraries/                               # Dependency specifications
│   └── README.txt                           # Library Manager guide (ArduinoJson)
├── README_ARDUINO_IDE.md                    # This document
├── SETUP_GUIDE.md                           # Step-by-step setup in Arduino IDE
├── UPLOAD_GUIDE.md                          # Flashing instructions & port selection
├── USER_CONFIGURATION.md                    # What to edit (MUST vs OPTIONAL)
├── HARDWARE_CONFIGURATION.md                # Electrical schematics & pin details
└── TROUBLESHOOTING.md                       # Diagnostic fixes for common issues
```

---

## ⚡ Quick Start

1. Open **`AQUORA_SYSTEM_2_DISPENSING_MACHINE.ino`** in Arduino IDE.
2. Select Board: **ESP32 Dev Module**.
3. Edit **`secrets.h`** with your Wi-Fi SSID and backend IP.
4. Press **`Ctrl + R`** to compile.
5. Press **`Ctrl + U`** to upload.
