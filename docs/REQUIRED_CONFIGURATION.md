# AQUORA — Required Configuration

## Overview

This document lists all configuration values that must be provided before AQUORA can operate in production.

---

## Configuration Status

| Configuration | Status | Where to Set |
|--------------|--------|-------------|
| Supabase URL | `REQUIRED` | `.env` → `VITE_SUPABASE_URL` / `SUPABASE_URL` |
| Supabase Anon Key | `REQUIRED` | `.env` → `VITE_SUPABASE_ANON_KEY` / `SUPABASE_ANON_KEY` |
| Supabase Service Role Key | `REQUIRED (server only)` | Backend `.env` → `SUPABASE_SERVICE_ROLE_KEY` |
| Razorpay Key ID | `NOT CONFIGURED` | Backend `.env` → `RAZORPAY_KEY_ID` |
| Razorpay Key Secret | `NOT CONFIGURED` | Backend `.env` → `RAZORPAY_KEY_SECRET` |
| Razorpay Webhook Secret | `NOT CONFIGURED` | Backend `.env` → `RAZORPAY_WEBHOOK_SECRET` |
| Payment Webhook URL | `NOT CONFIGURED` | Razorpay Dashboard |
| Machine Auth Secret | `NOT CONFIGURED` | Backend `.env` → `MACHINE_AUTH_SECRET` |
| Wi-Fi SSID (System 1) | `NOT CONFIGURED` | `secrets.h` → `AQUORA_WIFI_SSID` |
| Wi-Fi Password (System 1) | `NOT CONFIGURED` | `secrets.h` → `AQUORA_WIFI_PASSWORD` |
| Terminal API Key | `NOT CONFIGURED` | `secrets.h` → `AQUORA_TERMINAL_API_KEY` |
| Wi-Fi SSID (System 2) | `NOT CONFIGURED` | `secrets.h` → `AQUORA_WIFI_SSID` |
| Wi-Fi Password (System 2) | `NOT CONFIGURED` | `secrets.h` → `AQUORA_WIFI_PASSWORD` |
| Machine Secret (System 2) | `NOT CONFIGURED` | `secrets.h` → `AQUORA_MACHINE_SECRET` |
| Production Domain | `NOT CONFIGURED` | Vercel → Custom Domains |
| Admin User Email | `NOT CONFIGURED` | Supabase Auth → Users |

---

## Security Classification

### 🟢 PUBLIC (safe for browser/frontend/firmware)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`
- `VITE_PAYMENT_PROVIDER`

### 🔴 SECRET (server-side only — NEVER in frontend/firmware)

- `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `MACHINE_AUTH_SECRET`

### 🟡 DEVICE-LOCAL (firmware secrets.h — NEVER in Git)

- `AQUORA_WIFI_SSID`
- `AQUORA_WIFI_PASSWORD`
- `AQUORA_TERMINAL_API_KEY`
- `AQUORA_MACHINE_SECRET`
- `AQUORA_DEVICE_TOKEN`

---

## Configuration Order (Recommended)

1. Supabase project → Get URL and keys
2. Apply database migrations
3. Create admin user in Supabase Auth
4. Deploy admin panel to Vercel with Supabase keys
5. Set up Razorpay account and get API keys
6. Configure webhook URL
7. Set up machine authentication secrets
8. Flash firmware with Wi-Fi and backend credentials
9. Register machines in the database
10. End-to-end test
