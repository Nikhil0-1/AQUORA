# AQUORA — Razorpay Test Mode Webhook Setup

## 1. Overview

The `razorpay-webhook` Edge Function is deployed on Supabase to receive webhook callbacks from Razorpay when a customer completes a payment on System 1 (ESP32-S3 Payment Terminal).

**Deployed Endpoint URL:**
```
https://vxcqywbycvasmjngolps.supabase.co/functions/v1/razorpay-webhook
```

---

## 2. Architecture & Responsibilities

```
Razorpay
   │  (HTTPS POST with x-razorpay-signature)
   ▼
Supabase Edge Function: razorpay-webhook
   │  1. Verifies raw body HMAC-SHA256 signature
   │  2. Checks idempotency (webhook_events table)
   │  3. Verifies payment amount vs order amount
   │  4. Updates Payment: PAID
   │  5. Updates Order: PAID → QUEUED
   │  6. Creates exactly ONE Dispense Job in dispense_jobs table
   ▼
SYSTEM 2 (ESP32 Dispensing Machine)
   │  1. Polls /machine/jobs/next via HTTPS
   │  2. Validates machine ID, job signature, channel, volume
   │  3. Starts single assigned pump
   │  4. Measures liquid in real-time with pulse flow sensor
   │  5. Cuts off pump immediately upon target volume
   │  6. Reports hardware completion report
   ▼
Supabase Database: Order status updated to DISPENSED
   │
   ▼ Realtime broadcast
System 1 Terminal & Admin Panel updated to DISPENSED
```

### What the Webhook DOES:
- Receives raw HTTP requests and verifies the `x-razorpay-signature` header using `RAZORPAY_WEBHOOK_SECRET` via HMAC-SHA256.
- Prevents double processing of the same Razorpay event ID (idempotency via `webhook_events`).
- Server-side validates that the paid amount matches the order amount.
- Updates the existing `payments` record to `PAID`.
- Updates the existing `orders` record to `PAID` / `QUEUED`.
- Creates **exactly one** record in `dispense_jobs` with a cryptographic signature.

### What the Webhook DOES NOT DO:
- **NO direct pump or hardware control**: The webhook never touches GPIOs, relays, or MOSFETs.
- **NO fake dispensing**: The webhook does **NOT** mark an order as `DISPENSED`. Only physical flow sensor completion from System 2 marks an order `DISPENSED`.
- **NO Raspberry Pi**: The architecture is 100% direct from Supabase to ESP32.
- **NO order creation**: Webhook never generates new orders; it strictly matches existing pre-created orders.

---

## 3. Configuring the Webhook Secret in Supabase

The webhook secret **MUST NEVER** be placed in code or client-side files. It must be set as a server-side secret in Supabase.

### Steps to Configure in Supabase Dashboard:
1. Open the [Supabase Dashboard](https://supabase.com/dashboard/project/vxcqywbycvasmjngolps).
2. Go to **Settings** (gear icon in sidebar) → **Edge Functions** (or **Vault** / **Environment Variables**).
3. Under **Function Secrets**, click **Add New Secret**:
   - **Name**: `RAZORPAY_WEBHOOK_SECRET`
   - **Value**: Your Razorpay Test Mode webhook secret (e.g. from your Razorpay Dashboard).
4. Click **Save**.

Alternatively, via Supabase CLI:
```bash
supabase secrets set RAZORPAY_WEBHOOK_SECRET="your_test_webhook_secret_here" --project-ref vxcqywbycvasmjngolps
```

---

## 4. Configuring Razorpay Dashboard (Test Mode)

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Toggle the switch in the header to **Test Mode**.
3. Navigate to **Settings** → **Webhooks**.
4. Click **+ Add New Webhook**.
5. Fill in the configuration:
   - **Webhook URL**: `https://vxcqywbycvasmjngolps.supabase.co/functions/v1/razorpay-webhook`
   - **Secret**: Enter the exact same secret you set as `RAZORPAY_WEBHOOK_SECRET` in Supabase.
   - **Alert Email**: Your operator email.
   - **Active Events**:
     - `payment.captured` (Primary payment success event)
     - `order.paid` (Order completion event)
     - `payment.failed` (Payment failure / cancellation event)
6. Click **Save**.

---

## 5. Webhook Signature Verification Details

Razorpay generates an HMAC-SHA256 signature using the raw HTTP request body and your webhook secret:
$$\text{Signature} = \text{HMAC-SHA256}(\text{raw\_body}, \text{secret})$$

The signature is transmitted in the header:
```http
x-razorpay-signature: <hex_digest>
```

In the Supabase Edge Function, this is validated using the Web Crypto API before JSON parsing occurs. If the signature is invalid or missing, the Edge Function returns `401 Unauthorized` or `400 Bad Request` and terminates immediately.

---

## 6. Troubleshooting & Failure Recovery

| Issue | Cause | Resolution |
|-------|-------|------------|
| HTTP 500: Server webhook configuration error | `RAZORPAY_WEBHOOK_SECRET` not set in Supabase | Add `RAZORPAY_WEBHOOK_SECRET` in Supabase Dashboard → Settings → Edge Functions → Secrets. |
| HTTP 401: Invalid webhook signature | Secret mismatch or body modified in transit | Ensure the secret in Razorpay Dashboard matches `RAZORPAY_WEBHOOK_SECRET` exactly. |
| HTTP 400: Missing x-razorpay-signature | Request did not come from Razorpay or header stripped | Check proxy/firewall header forwarding. |
| HTTP 400: Payment amount mismatch | Customer paid a different amount than order | Inspect `webhook_events` error logs. No dispensing will occur. |
| HTTP 404: Order not found | Order ID missing in payment notes | Ensure System 1 passes `notes.order_id` during Razorpay order creation. |
| Event Ignored: `ignored_duplicate_event` | Webhook retried by Razorpay | Expected idempotent behavior. Only one dispense job was created. |
