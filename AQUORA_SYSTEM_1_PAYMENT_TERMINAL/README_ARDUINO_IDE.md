# 📦 AQUORA SYSTEM 1 (PAYMENT TERMINAL) — ARDUINO IDE FIRMWARE PACKAGE

This folder contains the complete, upload-ready firmware package for **AQUORA System 1 (Payment Receiving Terminal, Terminal ID: `AQ-PT-001`)**, packaged specifically for direct compilation and flashing via **Arduino IDE 2.x**.

---

## 📂 Folder Contents

```text
AQUORA_SYSTEM_1_PAYMENT_TERMINAL/
├── AQUORA_SYSTEM_1_PAYMENT_TERMINAL.ino   # Main Arduino sketch (setup & loop)
├── config.h                               # Central terminal settings & timings
├── pins.h                                 # Complete ST7262 RGB & GT911 touch pinout
├── version.h                              # Firmware (1.0.0) & protocol tags
├── secrets.h.example                      # Wi-Fi & API key template
├── secrets.h                              # Active credentials (git-ignored)
├── src/                                   # Subsystem modules (.cpp and .h)
│   ├── app.cpp / .h                       # Application coordinator
│   ├── display_manager.cpp / .h           # ST7262 16-bit RGB bus display driver
│   ├── touch_manager.cpp / .h             # GT911 capacitive touch controller
│   ├── lvgl_manager.cpp / .h              # Double-buffered LVGL engine in Octal PSRAM
│   ├── ui_manager.cpp / .h                # 8 complete 800×480 landscape screens
│   ├── wifi_manager.cpp / .h              # Non-blocking Wi-Fi station
│   ├── api_client.cpp / .h                # Catalog, order & status REST client
│   ├── payment_manager.cpp / .h           # Dynamic QR code & payment state
│   ├── order_manager.cpp / .h             # Cart & active transaction lifecycle
│   ├── realtime_manager.cpp / .h          # Live dispensing telemetry listener
│   ├── printer_manager.cpp / .h           # Optional thermal receipt printer
│   ├── state_manager.cpp / .h             # Terminal state machine
│   ├── state_machine.cpp / .h             # 19 explicit terminal states
│   ├── storage_manager.cpp / .h           # Non-volatile settings storage
│   ├── watchdog_manager.cpp / .h          # Hardware task watchdog
│   └── logger.cpp / .h                    # Serial diagnostic logger
├── include/                               # Hardware headers
│   ├── board_config.h                     # CrowPanel 7.0" resolution & buffer settings
│   └── api_config.h                       # API endpoint constants
├── libraries/                             # Library documentation
│   └── README.txt                         # Arduino Library Manager instructions
├── README_ARDUINO_IDE.md                  # This file
├── SETUP_GUIDE.md                         # Step-by-step setup in Arduino IDE
├── UPLOAD_GUIDE.md                        # Flashing instructions & port selection
├── USER_CONFIGURATION.md                  # Configuration guide (MUST vs OPTIONAL)
├── HARDWARE_CONFIGURATION.md              # Board specs & pin tables
└── TROUBLESHOOTING.md                     # Troubleshooting runbook
```

---

## ⚡ Quick Start

1. Open **`AQUORA_SYSTEM_1_PAYMENT_TERMINAL.ino`** in Arduino IDE.
2. Select Board: **ESP32S3 Dev Module** (PSRAM: `OPI PSRAM`, Flash: `16MB`).
3. Edit **`secrets.h`** with your Wi-Fi SSID and backend IP.
4. Press **`Ctrl + R`** to compile.
5. Press **`Ctrl + U`** to upload.
