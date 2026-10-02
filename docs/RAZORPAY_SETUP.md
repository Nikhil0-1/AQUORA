# AQUORA — Razorpay Setup Guide

## 1. Webhook URL

The existing deployed Supabase Edge Function URL is:

```
https://vxcqywbycvasmjngolps.supabase.co/functions/v1/razorpay-webhook
```

> **IMPORTANT DNS / PROJECT REF NOTE:**
> Please ensure your Razorpay Dashboard is configured with `vxcqywbycvasmjngolps` (spelled with a **q**, matching your real Supabase project URL). Spelling it with a `g` (`vxcgywby...`) will cause DNS resolution to fail (`ENOTFOUND`).

---

## 2. Selected Events

In the Razorpay Dashboard under **Settings → Webhooks**:

| Event | Purpose | AQUORA Action |
|-------|---------|---------------|
| `payment.captured` | Payment successfully captured by bank/UPI | Verifies HMAC signature, checks idempotency, updates Payment & Order to `PAID`, queues exactly 1 dispense job. |
| `order.paid` | Order fully paid | Reconciles state; if dispense job already created by `payment.captured`, does NOT duplicate; otherwise creates the single dispense job. |
| `payment.failed` | Payment cancelled or declined | Updates Payment & Order to `FAILED`. Never triggers dispensing or pump. |

---

## 3. Secret Configuration

### `RAZORPAY_WEBHOOK_SECRET`
Must be set as an Edge Function Secret in your Supabase project:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/vxcqywbycvasmjngolps).
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**.
3. Add a new secret:
   - **Name**: `RAZORPAY_WEBHOOK_SECRET`
   - **Value**: The exact secret string configured in your Razorpay Dashboard webhook.
4. Save.

---

## 4. Razorpay Test Mode API Credentials

For backend order creation:
- `RAZORPAY_KEY_ID`: Starts with `rzp_test_...`
- `RAZORPAY_KEY_SECRET`: Private server-side key

These are configured in your server `.env` file (server-side only, NEVER in frontend or ESP32).

---

## 5. End-to-End Payment to Dispense Chain

```text
Customer scans UPI QR (generated with server-authoritative amount)
  ↓
Razorpay processes payment (TEST MODE)
  ↓
Razorpay fires webhook POST to https://vxcqywbycvasmjngolps.supabase.co/functions/v1/razorpay-webhook
  ↓
Edge Function verifies raw body with HMAC-SHA256(x-razorpay-signature, RAZORPAY_WEBHOOK_SECRET)
  ↓
Edge Function checks idempotency (webhook_events table)
  ↓
Edge Function verifies payment amount matches order.amount
  ↓
Payment updated to PAID | Order updated to PAID / QUEUED
  ↓
Exactly ONE dispense job inserted into dispense_jobs table
  ↓
SYSTEM 2 ESP32 polls /machine/jobs/next, verifies machine ID & signature
  ↓
Correct pump energized (single-pump interlock)
  ↓
Interrupt-driven flow sensor measures real pulses (10 pulses/ml)
  ↓
Target volume reached → Pump OFF immediately
  ↓
ESP32 reports hardware completion to backend/Supabase
  ↓
Order status updated to DISPENSED
  ↓
System 1 Terminal & Admin Panel updated via Supabase Realtime
```

---

## 6. Troubleshooting

- **HTTP 500 (`Server webhook configuration error`)**: `RAZORPAY_WEBHOOK_SECRET` is missing in Supabase Edge Function Secrets. Add it in the Supabase Dashboard.
- **HTTP 401 (`Invalid webhook signature`)**: The secret in Razorpay Dashboard does not match the secret in Supabase.
- **HTTP 400 (`Payment amount mismatch`)**: Paid amount differs from order amount. Job creation aborted.
- **HTTP 200 (`ignored_duplicate_event`)**: Normal idempotent response on webhook retries.
