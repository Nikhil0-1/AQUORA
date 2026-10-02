# AQUORA — Hardware Setup Guide

## Overview

AQUORA uses two ESP32-based systems that communicate with the Supabase backend over HTTPS.

---

## System 1 — Payment Terminal (ESP32-S3)

### Hardware

- ESP32-S3 DevKitC or equivalent
- TFT LCD Touchscreen (ILI9488 / ILI9341)
- Wi-Fi connectivity

### Firmware Setup

1. Install **Arduino IDE 2.x**
2. Add ESP32 board package (Espressif Systems)
3. Install required libraries (see `ARDUINO_LIBRARIES.md`)
4. Open `AQUORA_SYSTEM_1_PAYMENT_TERMINAL/AQUORA_SYSTEM_1_PAYMENT_TERMINAL.ino`
5. Copy `secrets.h.example` to `secrets.h`:

```bash
cp secrets.h.example secrets.h
```

6. Edit `secrets.h` with your credentials:

```cpp
#define AQUORA_WIFI_SSID        "YourWiFi"
#define AQUORA_WIFI_PASSWORD    "YourPassword"
#define AQUORA_TERMINAL_API_KEY "your_terminal_api_key"
```

7. Select board: **ESP32-S3 Dev Module**
8. Upload to device

### Configuration Files

| File | Purpose |
|------|---------|
| `config.h` | Backend URL, terminal ID, protocol version |
| `pins.h` | GPIO pin assignments for display, buttons |
| `version.h` | Firmware version |
| `secrets.h` | Wi-Fi credentials, API keys (NEVER commit) |

---

## System 2 — Dispensing Machine (ESP32)

### Hardware

- ESP32 DevKitC or equivalent
- 5× Relay modules (pump control)
- 5× Flow sensors (YF-S201 or equivalent)
- 12V power supply
- Motor driver board (optional)

### Firmware Setup

1. Open `AQUORA_SYSTEM_2_DISPENSING_MACHINE/AQUORA_SYSTEM_2_DISPENSING_MACHINE.ino`
2. Copy `secrets.h.example` to `secrets.h`:

```bash
cp secrets.h.example secrets.h
```

3. Edit `secrets.h` with your credentials:

```cpp
#define AQUORA_WIFI_SSID        "YourWiFi"
#define AQUORA_WIFI_PASSWORD    "YourPassword"
#define AQUORA_MACHINE_SECRET   "your_machine_secret"
#define AQUORA_DEVICE_TOKEN     "your_device_token"
```

4. Select board: **ESP32 Dev Module**
5. Upload to device

### Configuration Files

| File | Purpose |
|------|---------|
| `config.h` | Backend URL, machine ID, protocol version |
| `pins.h` | GPIO pin assignments for relays, flow sensors |
| `version.h` | Firmware version |
| `secrets.h` | Wi-Fi credentials, machine secrets (NEVER commit) |

---

## Wiring Reference

See detailed wiring diagrams in:

- `docs/wiring.md`
- `docs/pinout.md`
- `hardware/diagrams/`

---

## Security Reminders

- **NEVER** commit `secrets.h` to Git (it's in `.gitignore`)
- **NEVER** put `SUPABASE_SERVICE_ROLE_KEY` in firmware
- Use only controlled Edge Function endpoints from ESP32
- Use token-based machine authentication
- All credentials are stored in `secrets.h` which is gitignored

---

## Compile Verification

> **ARDUINO COMPILE VERIFICATION PENDING**
>
> Full compilation requires the ESP32 board package and all library dependencies installed in Arduino IDE. Compilation cannot be verified without the physical Arduino IDE toolchain. See `ARDUINO_LIBRARIES.md` for the complete dependency list.
