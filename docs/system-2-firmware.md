# AQUORA System 2 Firmware Specification

## Overview
System 2 is the industrial Sanitizer Dispensing Controller running on an ESP32, actuating 5 DC pumps and counting pulses from 5 turbine flow sensors.

## Architectural Enforcements
1. **Single-Pump Interlock (Section 32):**
   - Software and hardware verification ensures only ONE pump output is active at any time.
   - All pumps are explicitly pulled LOW before any single pump is energized.
2. **Pulse Counting ISR (Section 33):**
   - 5 independent rising-edge interrupt service routines in IRAM.
   - Minimal operation: single pulse counter increment. No network, formatting, or JSON inside ISR.
3. **Safety Watchdogs & Timeouts:**
   - 3-second no-flow auto-abort (protects pumps from running dry).
   - 45-second maximum single-job runtime timeout.
   - Hardware Emergency Stop input (Active LOW with latched safe mode).
   - ESP32 Hardware Task Watchdog (10s reset window).
4. **Duplicate & Expiry Job Protection (Sections 43, 44):**
   - Cryptographic HMAC job signature verification.
   - Completed job IDs persisted in NVS (survives sudden power loss or reboots).
   - Jobs older than 5 minutes automatically rejected.
5. **Independent Channel Calibration (Section 35):**
   - Pulses-per-mL factor stored in non-volatile Preferences for each channel.
