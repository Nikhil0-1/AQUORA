# 🔑 AQUORA ADMIN PANEL & BACKEND — ENVIRONMENT VARIABLES SPECIFICATION

This document outlines all environment keys required for local execution and production deployment.

---

## 1. Backend Environment Variables (`backend/.env`)

| Variable Name | Required | Default / Example | Description |
|---|---|---|---|
| `PORT` | Yes | `3001` | TCP port for the Express REST and WebSocket API. |
| `NODE_ENV` | Yes | `development` | Set to `production` in live deployments. |
| `SUPABASE_URL` | Optional | `https://xyz.supabase.co` | Your Supabase project URL (falls back to memory DB if omitted). |
| `SUPABASE_ANON_KEY` | Optional | `ey...` | Public anonymous key for client validation. |
| `SUPABASE_SERVICE_ROLE_KEY`| Optional | `ey...` | Privileged key for server-side operations and RLS bypass. |
| `RAZORPAY_KEY_ID` | Optional | `rzp_test_xxx` | Public Key ID from Razorpay Dashboard. |
| `RAZORPAY_KEY_SECRET` | Optional | `secret_xxx` | Secret key for initiating orders and payments. |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | `webhook_sec_xxx` | Secret used to verify HMAC-SHA256 signature on incoming webhooks. |
| `MACHINE_SECRET_KEY` | Yes | `aquora_machine_secret_key_demo_change_in_prod` | Pre-shared HMAC key matching System 2 (`AQ-DM-001`) `secrets.h`. |

---

## 2. Frontend Environment Variables (`frontend/.env`)

| Variable Name | Required | Default / Example | Description |
|---|---|---|---|
| `VITE_API_URL` | Yes | `http://localhost:3001` | URL of the running AQUORA backend service. |
| `VITE_WS_URL` | Yes | `ws://localhost:3001/ws` | WebSocket endpoint for real-time telemetry streaming. |
| `VITE_SUPABASE_URL` | Optional | `https://xyz.supabase.co` | Supabase URL for client-side Auth. |
| `VITE_SUPABASE_ANON_KEY` | Optional | `ey...` | Supabase Anonymous Key. |
| `VITE_PAYMENT_PROVIDER` | No | `RAZORPAY` | Default payment gateway provider name. |
