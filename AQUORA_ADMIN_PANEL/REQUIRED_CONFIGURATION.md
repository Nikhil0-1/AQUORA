# AQUORA — Master Required Configuration & Credentials Audit

> **Document Version:** 1.0.0  
> **Status:** AUDITED & VERIFIED  
> **Target Platform:** AQUORA Smart Sanitizer Vending Machine Platform  

This document serves as the single source of truth for all environment variables, cryptographic secrets, hardware identifiers, GPIO mappings, and external service credentials required across the AQUORA platform:
* **System 1:** Customer Payment Terminal (`AQ-PT-001`, CrowPanel 7.0" ESP32-S3 HMI)
* **System 2:** Sanitizer Dispensing Machine (`AQ-DM-001`, ESP32 Dev Module 5-Channel Controller)
* **System 3:** AQUORA Admin Panel & Backend (`AQUORA_ADMIN_PANEL`, Express/TypeScript API + Vite/React UI + Supabase Cloud)

---

## 1. Master Configuration Table

| Item | Required? | Used By | Where To Add | Current Status | Classification | Example / Expected Format |
|---|---|---|---|---|---|---|
| **Wi-Fi SSID** | **YES** | System 1 & 2 | `secrets.h` (`AQUORA_WIFI_SSID`) | `DEFAULT (Aquora-WiFi)` | 🔒 Secret | `"YourOfficeSSID"` |
| **Wi-Fi Password** | **YES** | System 1 & 2 | `secrets.h` (`AQUORA_WIFI_PASSWORD`) | `DEFAULT (AquoraPass123)` | 🔒 Secret | `"WPA2SecretPassword!"` |
| **Backend API URL** | **YES** | System 1 & 2 | `config.h` (`AQUORA_API_URL`) | `SET (http://192.168.1.100:3001)` | 🌐 Public / Internal | `"http://192.168.1.50:3001"` or `"https://api.aquora.io"` |
| **Terminal ID** | **YES** | System 1 | `config.h` (`AQUORA_TERMINAL_ID`) | `SET (AQ-PT-001)` | 🌐 Identifier | `"AQ-PT-001"` |
| **Terminal API Key** | Optional | System 1 | `secrets.h` (`AQUORA_TERMINAL_API_KEY`)| `DEFAULT (terminal_api_key_sample)` | 🔒 Secret | `"pt_sec_99a8b7c6d5e4f3a2"` |
| **Machine ID** | **YES** | System 2 | `config.h` (`AQUORA_MACHINE_ID`) | `SET (AQ-DM-001)` | 🌐 Identifier | `"AQ-DM-001"` |
| **Machine Secret Key** | **YES** | System 2 & Backend | `secrets.h` / `backend/.env` | `SET (Demo Key - MUST ROTATE)` | 🔒 Secret — NEVER EXPOSE | 64-char hex string: `a3f8c...90e` |
| **Supabase URL** | **YES (Prod)** | Backend / Frontend | `.env` (`SUPABASE_URL`) | `OPTIONAL (Memory DB Fallback)` | 🌐 Public | `"https://xyzcompany.supabase.co"` |
| **Supabase Anon Key** | **YES (Prod)** | Admin Frontend | `.env` (`SUPABASE_ANON_KEY`) | `OPTIONAL (Memory DB Fallback)` | 🌐 Public Client Key | `"eyJhbGciOiJIUzI1NiIsIn..."` |
| **Supabase Service Role** | **YES (Prod)** | Backend / Edge Fn | `.env` (`SUPABASE_SERVICE_ROLE_KEY`) | `MISSING (Cloud DB required)` | 🔒 Secret — NEVER EXPOSE | `"eyJhbGciOiJIUzI1NiIsIn..."` |
| **Razorpay Key ID** | **YES (Pay)** | Backend / Admin | `backend/.env` (`RAZORPAY_KEY_ID`) | `MISSING (User must provide)` | 🌐 Public API Key | `"rzp_test_1DP5mmOlF5G5ag"` |
| **Razorpay Key Secret** | **YES (Pay)** | Backend only | `backend/.env` (`RAZORPAY_KEY_SECRET`)| `MISSING (User must provide)` | 🔒 Secret — NEVER EXPOSE | `"s8xKz2qW9bL1mN3p"` |
| **Razorpay Webhook Secret** | **YES (Pay)** | Backend / Edge Fn | `backend/.env` (`RAZORPAY_WEBHOOK_SECRET`)| `MISSING (User must provide)` | 🔒 Secret — NEVER EXPOSE | `"whsec_99018273645"` |
| **Protocol Version** | **YES** | All Systems | Codebase (`PROTOCOL_VERSION`) | `CONFIGURED (1)` | 🌐 Constant | `1` |
| **Firmware Version** | **YES** | System 1 & 2 | `version.h` | `CONFIGURED (1.0.0)` | 🌐 Constant | `"1.0.0"` |
| **Display RGB GPIOs** | **YES** | System 1 | `pins.h` | `VERIFIED (CrowPanel 7.0")` | ⚙️ Hardware Spec | Direct HW Pinout (ST7262 RGB) |
| **Touch I2C GPIOs** | **YES** | System 1 | `pins.h` | `VERIFIED (SDA 19, SCL 20, RST 38)`| ⚙️ Hardware Spec | GT911 Capacitive Touch |
| **Pump Output GPIOs** | **YES** | System 2 | `pins.h` | `VERIFIED (25, 26, 27, 14, 12)` | ⚙️ Hardware Spec | 5x Logic MOSFET Gates |
| **Flow Sensor GPIOs** | **YES** | System 2 | `pins.h` | `VERIFIED (34, 35, 32, 33, 39)` | ⚙️ Hardware Spec | 5x Hall Effect Sensor ISR |
| **Emergency Stop GPIO** | **YES** | System 2 | `pins.h` | `VERIFIED (GPIO 36)` | ⚙️ Hardware Spec | Active-LOW NC contact |
| **Flow Pulses/mL Cal** | **YES** | System 2 | `config.h` | `DEFAULT ESTIMATE (0.38 - 0.45)` | ⚙️ Calibration | Pulses per mL per channel |
| **Payment Webhook URL**| **YES (Pay)** | Payment Provider | Razorpay Dashboard | `MISSING (Public domain needed)` | 🌐 Public Webhook Endpoint | `"https://api.aquora.io/api/v1/payments/webhook"` |
| **Admin Panel Domain** | Production | Web Host / DNS | Hosting Provider / Cloudflare | `OPTIONAL (localhost:3002 local)`| 🌐 Domain | `"https://admin.aquora.io"` |
| **Storage Bucket** | Optional | Supabase | Storage Dashboard | `OPTIONAL (Not required for v1)` | 🌐 Storage Bucket | `"sanitizer-product-images"` |

---

## 2. Categorized Requirements Inventory

### Category A: Required Before Build (Code Compilation)
All requirements in this category are **FULLY SATISFIED** in the codebase.
- [x] **Arduino Core:** ESP32 Board Core v2.0.17 installed.
- [x] **Arduino Libraries:**
  - `ArduinoJson` v6.21.5 (Installed in global and local Arduino libraries).
  - `TAMC_GT911` v1.0.2 (Installed for capacitive touch).
  - `lvgl` v8.3.11 with configured `lv_conf.h` (`LV_COLOR_DEPTH 16`, `LV_USE_QRCODE 1`).
- [x] **Node.js Dependencies:** Root and package dependencies installed (`express`, `vite`, `react`, `zod`, `vitest`).
- [x] **TypeScript Types:** Packages (`shared-types`, `machine-protocol`, `api-client`) built and linked.
- [x] **Firmware Compilation Verification:**
  - System 1 compiles with Exit Code 0 (Flash: 83%, RAM: 29%).
  - System 2 compiles with Exit Code 0 (Flash: 71%, RAM: 14%).
- [x] **Backend & Frontend Build Verification:**
  - `npm run build` succeeds across all workspaces.

---

### Category B: Required Before First Upload (Flashing Hardware)
The user must review and adjust these settings in `secrets.h` and `config.h` before flashing physical microcontrollers:
1. **System 1 Payment Terminal:**
   - [ ] `AQUORA_WIFI_SSID`: Enter actual 2.4GHz Wi-Fi network SSID in `AQUORA_SYSTEM_1_PAYMENT_TERMINAL/secrets.h`.
   - [ ] `AQUORA_WIFI_PASSWORD`: Enter actual Wi-Fi WPA2 pre-shared key in `AQUORA_SYSTEM_1_PAYMENT_TERMINAL/secrets.h`.
   - [ ] `AQUORA_API_URL`: Replace `http://192.168.1.100:3001` in `config.h` with the actual IP address or domain of the host running the AQUORA Backend.
2. **System 2 Dispensing Machine:**
   - [ ] `AQUORA_WIFI_SSID`: Enter actual 2.4GHz Wi-Fi network SSID in `AQUORA_SYSTEM_2_DISPENSING_MACHINE/secrets.h`.
   - [ ] `AQUORA_WIFI_PASSWORD`: Enter actual Wi-Fi password in `AQUORA_SYSTEM_2_DISPENSING_MACHINE/secrets.h`.
   - [ ] `AQUORA_API_URL`: Replace `http://192.168.1.100:3001` in `config.h` with the backend host address.
   - [ ] `AQUORA_MACHINE_SECRET`: Change the demo secret in `AQUORA_SYSTEM_2_DISPENSING_MACHINE/secrets.h` to a strong random key and mirror it into `AQUORA_ADMIN_PANEL/backend/.env` under `MACHINE_SECRET_KEY`.

---

### Category C: Required Before Payment Test
To execute real or sandbox payment transactions with QR codes:
1. **Razorpay Merchant Account:**
   - [ ] Sign up or log into [Razorpay Dashboard](https://dashboard.razorpay.com).
   - [ ] Switch to **Test Mode**.
   - [ ] Navigate to **Settings > API Keys** and generate a new key pair:
     - `RAZORPAY_KEY_ID`: Copy key id (starts with `rzp_test_...`) into `AQUORA_ADMIN_PANEL/backend/.env`.
     - `RAZORPAY_KEY_SECRET`: Copy secret key into `AQUORA_ADMIN_PANEL/backend/.env`.
2. **Webhook Verification Secret:**
   - [ ] In Razorpay Dashboard, go to **Settings > Webhooks** and add your endpoint:
     - URL: `https://<YOUR_PUBLIC_DOMAIN>/api/v1/payments/webhook` (or ngrok/tunnel during local testing).
     - Events to enable: `payment.captured`, `payment.failed`, `order.paid`.
     - Webhook Secret: Generate a secret and add it to `AQUORA_ADMIN_PANEL/backend/.env` under `RAZORPAY_WEBHOOK_SECRET`.

---

### Category D: Required Before Real Dispensing (Physical Hardware & Fluidics)
Before filling tanks with sanitizer or powering high-current pump lines:
1. **Emergency Stop (E-Stop) Line:**
   - [ ] Wire normally-closed (NC) physical push button between `GPIO 36` and `GND`.
   - [ ] Verify that pulling the switch immediately halts all PWM/MOSFET gate drivers (`GPIO 25, 26, 27, 14, 12`).
2. **Flow Sensor Calibration (Bench Test):**
   - [ ] Place a graduated cylinder (100 mL or 250 mL) below the nozzle of Channel 1.
   - [ ] Execute a test dispense of 100 mL with water or sanitizer solution.
   - [ ] Count raw pulses generated and compute:
     $$\text{Pulses per mL} = \frac{\text{Total Pulses Recorded}}{\text{Volume Measured in Cylinder (mL)}}$$
   - [ ] Update `DEFAULT_PULSES_PER_ML_CH1` through `CH5` in `AQUORA_SYSTEM_2_DISPENSING_MACHINE/config.h` (or through the Admin Panel calibration interface).
3. **Power Isolation:**
   - [ ] Verify separate ground return paths for 12V/24V pump inductive loads and ESP32 logic ground to prevent EMI resets.
   - [ ] Ensure flyback diodes (e.g., 1N4007 or 1N5819) are installed in anti-parallel across all inductive pump coils.

---

### Category E: Required Before Production Deployment
1. **Public Domain & SSL/TLS:**
   - [ ] Acquire a valid domain name (e.g., `aquora.io`).
   - [ ] Provision TLS certificates (Let's Encrypt / Cloudflare) to ensure all communications over HTTPS (`https://`) and secure WebSockets (`wss://`).
2. **Supabase Cloud Database:**
   - [ ] Create a project in [Supabase Cloud](https://supabase.com).
   - [ ] Run `database/schema.sql` via Supabase SQL Editor.
   - [ ] Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `AQUORA_ADMIN_PANEL/backend/.env`.
3. **CORS & Firewall Policies:**
   - [ ] Lock down `CORS_ORIGIN` in backend to the specific domain hosting the Admin Panel.
   - [ ] Set rate limiting headers on public `/api/v1/payments/` endpoints.

---

### Category F: Optional / Phase 2 Enhancements
- [ ] **Thermal Receipt Printer:** If physical paper receipts are needed, set `PRINTER_ENABLED_DEFAULT 1` in System 1 `config.h` and connect TTL thermal printer to `TX 43, RX 44`.
- [ ] **Supabase Storage Bucket:** For uploading and serving product bottle images dynamically from the Admin Panel.
- [ ] **Cellular / LTE Fallback:** SIM7600 4G module over secondary UART for remote kiosk installations lacking reliable Wi-Fi.
