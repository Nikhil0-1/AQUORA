# AQUORA — Required Configuration Audit

This document defines the configuration audit and environment parameters for the AQUORA Smart Sanitizer Vending Machine platform.

## Configuration Audit Matrix

| Configuration | Status | Where configured | Required |
|---|---|---|---|
| Supabase URL | VERIFIED | Project `vxcqywbycvasmjngolps` (`https://vxcqywbycvasmjngolps.supabase.co`) / Admin Panel `.env` / Backend `.env` / System 1 & 2 `config.h` | YES |
| Supabase publishable key | VERIFIED | Supabase Project API Keys / Admin Panel `.env` (`VITE_SUPABASE_ANON_KEY`) / System 1 `config.h` | YES |
| Razorpay Key ID | MISSING | Razorpay Dashboard -> API Keys / Backend `.env` (`RAZORPAY_KEY_ID`) / Supabase Edge Function Secrets | YES |
| Razorpay Key Secret | MISSING | Razorpay Dashboard -> API Keys / Backend `.env` (`RAZORPAY_KEY_SECRET`) / Supabase Edge Function Secrets | YES |
| Razorpay Webhook Secret | MISSING | Razorpay Dashboard (Webhook setup) / Supabase Edge Function Secrets (`RAZORPAY_WEBHOOK_SECRET`) | YES |
| SYSTEM 1 Terminal ID | VERIFIED | `AQ-PT-001` (seeded in Supabase `payment_terminals`) / `config.h` (`AQUORA_TERMINAL_ID`) | YES |
| SYSTEM 2 Machine ID | VERIFIED | `AQ-DM-001` (seeded in Supabase `dispensing_machines`) / `config.h` (`AQUORA_MACHINE_ID`) | YES |
| Machine credential | VERIFIED | API Token / HMAC Auth in `AuthenticationManager` / `ApiClient` / DB `dispensing_machines.api_key_hash` / `secrets.h` | YES |
| Backend URL | VERIFIED | Supabase REST API `https://vxcqywbycvasmjngolps.supabase.co/rest/v1` and Edge Function `https://vxcqywbycvasmjngolps.supabase.co/functions/v1/razorpay-webhook` | YES |
| Exact display GPIO | VERIFIED | Elecrow CrowPanel 7.0" ESP32-S3 HMI (800x480 RGB): DE:40, VSYNC:41, HSYNC:39, PCLK:42, R:[45,48,47,21,14], G:[5,6,7,15,16,4], B:[8,3,46,9,1], BL:2 | YES |
| Exact touch GPIO | VERIFIED | Goodix GT911 Capacitive Touch I2C: SDA:19, SCL:20, INT:-1 (polled), RST:38 | YES |
| Pump GPIOs | VERIFIED | Channels 1–5: GPIO 25, 26, 27, 14, 12 | YES |
| Flow GPIOs | VERIFIED | Channels 1–5: GPIO 34, 35, 32, 33, 39 | YES |
| Emergency stop GPIO | VERIFIED | GPIO 36 (Active LOW, normally closed with hardware pull-up) | YES |
| Calibration | UNVERIFIED | Default baseline 10 pulses/ml (configurable in System 2 NVS & DB `machine_channels.pulses_per_ml`; requires fluid testing) | YES |

---

## Explanation of Statuses

- **VERIFIED**: Confirmed against the active codebase, database schema, remote Supabase instance, or verified hardware pinout definitions.
- **MISSING**: Production or user-specific credentials that must be configured in the Supabase Dashboard secrets or local `.env` / `secrets.h` files before live operations.
- **UNVERIFIED**: Hardware parameters (such as pulse-to-ml flow sensor calibration for physical liquid viscosity) that can only be finalized during physical liquid dispensing testing.
- **NOT REQUIRED**: Optional auxiliary systems not part of the core direct architecture.
