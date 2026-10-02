# AQUORA — Comprehensive Environment Variables & Security Matrix

> **Document Version:** 1.0.0  
> **Status:** AUDITED & COMPLETE  
> **Scope:** Full Platform (System 1, System 2, Backend, Admin Frontend, Supabase Database & Edge Functions)  

This specification catalogs every environment key, compile-time secret, and configuration parameter across all AQUORA software components, with explicit security classification: **PUBLIC** vs. **SECRET — NEVER EXPOSE**.

---

## 1. Backend Environment Variables (`AQUORA_ADMIN_PANEL/backend/.env`)

| Variable Name | Required | Security Level | Default / Example | Purpose / Impact if Missing |
|---|---|---|---|---|
| `PORT` | Yes | 🌐 **PUBLIC** | `3001` | TCP listening port for Express API & WebSocket server. |
| `NODE_ENV` | Yes | 🌐 **PUBLIC** | `development` | Environment mode (`development` / `production`). Controls stack trace exposure. |
| `SUPABASE_URL` | Optional (Local)<br>**Required (Prod)** | 🌐 **PUBLIC** | `https://xyz.supabase.co` | Supabase Cloud API URL. If absent locally, backend falls back gracefully to in-memory DB. |
| `SUPABASE_ANON_KEY` | Optional (Local)<br>**Required (Prod)** | 🌐 **PUBLIC** | `eyJhbGci...` | Supabase Anonymous Client Key. Safe for public/browser consumption. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional (Local)<br>**Required (Prod)** | 🔒 **SECRET — NEVER EXPOSE** | `eyJhbGci...` | Privileged admin key with Row Level Security (RLS) bypass. Never expose to client applications! |
| `RAZORPAY_KEY_ID` | Optional (Local)<br>**Required (Pay)** | 🌐 **PUBLIC** | `rzp_test_1DP5mmOlF5G5ag` | Razorpay public Merchant Key ID. Used to generate orders and render payment UI. |
| `RAZORPAY_KEY_SECRET` | Optional (Local)<br>**Required (Pay)** | 🔒 **SECRET — NEVER EXPOSE** | `s8xKz2qW9bL1mN3p` | Merchant Secret used for server-to-server Razorpay API signing. Keep confidential. |
| `RAZORPAY_WEBHOOK_SECRET` | Optional (Local)<br>**Required (Pay)** | 🔒 **SECRET — NEVER EXPOSE** | `whsec_99018273645` | HMAC secret for verifying authenticity of incoming Razorpay payment webhooks. |
| `MACHINE_SECRET_KEY` | **YES** | 🔒 **SECRET — NEVER EXPOSE** | `aquora_machine_secret_key_demo_change_in_prod` | Pre-shared HMAC-SHA256 key matching System 2 (`secrets.h`). Must be 32-64 random bytes in production. |
| `CORS_ORIGIN` | Optional | 🌐 **PUBLIC** | `*` | Allowed CORS origins. In production, restrict strictly to the Admin Panel domain. |

---

## 2. Admin Panel Frontend Environment Variables (`AQUORA_ADMIN_PANEL/frontend/.env`)

> ⚠️ **CRITICAL SECURITY NOTE:** All `VITE_` prefixed variables are embedded into client-side JavaScript bundles during build. **NEVER** place secret keys, service role keys, or database passwords in this file.

| Variable Name | Required | Security Level | Default / Example | Purpose / Impact if Missing |
|---|---|---|---|---|
| `VITE_API_URL` | **YES** | 🌐 **PUBLIC** | `http://localhost:3001` | Base URL of the AQUORA Backend API for REST calls. |
| `VITE_WS_URL` | **YES** | 🌐 **PUBLIC** | `ws://localhost:3001/ws` | WebSocket endpoint for real-time telemetry, error logs, and job status streaming. |
| `VITE_SUPABASE_URL` | Optional | 🌐 **PUBLIC** | `https://xyz.supabase.co` | Supabase URL for client-side authentication and session management. |
| `VITE_SUPABASE_ANON_KEY` | Optional | 🌐 **PUBLIC** | `eyJhbGci...` | Supabase Public Anonymous Key. Safe for browser execution. |
| `VITE_PAYMENT_PROVIDER` | No | 🌐 **PUBLIC** | `RAZORPAY` | Default payment processor brand displayed in admin settings. |

---

## 3. Firmware Secrets & Constants

### A. System 1 Payment Terminal (`AQUORA_SYSTEM_1_PAYMENT_TERMINAL`)

| Parameter | Location | Security Level | Current State | Purpose |
|---|---|---|---|---|
| `AQUORA_WIFI_SSID` | `secrets.h` | 🔒 **SECRET** | `"Aquora-WiFi"` | Wi-Fi network SSID for 2.4 GHz connection. |
| `AQUORA_WIFI_PASSWORD` | `secrets.h` | 🔒 **SECRET** | `"AquoraPass123"` | Wi-Fi WPA2 pre-shared passphrase. |
| `AQUORA_TERMINAL_API_KEY` | `secrets.h` | 🔒 **SECRET** | `"terminal_api_key_sample"` | Bearer token authenticating terminal to `/api/v1/orders`. |
| `AQUORA_TERMINAL_ID` | `config.h` | 🌐 **PUBLIC** | `"AQ-PT-001"` | Unique hardware identifier for this terminal. |
| `AQUORA_API_URL` | `config.h` | 🌐 **PUBLIC** | `"http://192.168.1.100:3001"` | Target URL of the AQUORA API server. |
| `AQUORA_API_BASE_PATH` | `config.h` | 🌐 **PUBLIC** | `"/api/v1"` | REST API base route prefix. |

### B. System 2 Dispensing Machine (`AQUORA_SYSTEM_2_DISPENSING_MACHINE`)

| Parameter | Location | Security Level | Current State | Purpose |
|---|---|---|---|---|
| `AQUORA_WIFI_SSID` | `secrets.h` | 🔒 **SECRET** | `"Aquora-WiFi"` | Wi-Fi network SSID for 2.4 GHz connection. |
| `AQUORA_WIFI_PASSWORD` | `secrets.h` | 🔒 **SECRET** | `"AquoraPass123"` | Wi-Fi WPA2 pre-shared passphrase. |
| `AQUORA_MACHINE_SECRET` | `secrets.h` | 🔒 **SECRET — NEVER EXPOSE** | Demo Key | Cryptographic HMAC secret matching backend `MACHINE_SECRET_KEY`. |
| `AQUORA_MACHINE_ID` | `config.h` | 🌐 **PUBLIC** | `"AQ-DM-001"` | Unique hardware identifier for the 5-channel dispensing unit. |
| `AQUORA_API_URL` | `config.h` | 🌐 **PUBLIC** | `"http://192.168.1.100:3001"` | Target URL of the AQUORA API server. |
| `AQUORA_API_BASE_PATH` | `config.h` | 🌐 **PUBLIC** | `"/api/v1/machine"` | Machine controller REST endpoint prefix. |

---

## 4. Production Security Protocol Checklist

1. **Secret Rotation:** Before commercial commissioning, generate a 256-bit cryptographically secure random key for `MACHINE_SECRET_KEY` and update both backend `.env` and System 2 `secrets.h`.
2. **Never Commit Secrets:** Confirm that `.env`, `secrets.h`, and `*.pem` are listed in `.gitignore`. Only `.env.example` and `secrets.h.example` may be tracked in git.
3. **HTTPS / WSS Transport Security:** Never transmit raw payment data or dispensing commands over unencrypted HTTP across the public Internet.
4. **Role Isolation:** Ensure `SUPABASE_SERVICE_ROLE_KEY` is only used inside secure backend server runtimes and Supabase Edge Functions. It must never appear in frontend bundles or ESP32 firmware source code.
