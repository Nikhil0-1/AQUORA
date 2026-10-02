# AQUORA — Razorpay Test Mode Guide

## 1. Test Mode Verification

Razorpay Test Mode allows simulating UPI and card payments without exchanging real currency.

**Webhook URL:**
```
https://vxcqywbycvasmjngolps.supabase.co/functions/v1/razorpay-webhook
```

---

## 2. Configured Events

1. `payment.captured`
2. `order.paid`
3. `payment.failed`

Status in Razorpay: **ENABLED**

---

## 3. Testing with Razorpay Dashboard Webhook Simulator

You can test webhook delivery directly from your Razorpay Dashboard:
1. Go to **Settings** → **Webhooks** → Select your webhook.
2. Click **Deliveries** / **Send Test Event**.
3. Select `payment.captured` or `payment.failed`.
4. Ensure the JSON payload `notes.order_id` references a valid order in your AQUORA database.
5. Send the event and check the HTTP 200 response.

---

## 4. Automated Verification Suite

Run all 13 comprehensive end-to-end scenarios locally:

```bash
npx vitest run tests/razorpay_webhook_all_scenarios.test.ts
```

All 13 tests verify:
- Reachability & signature verification
- Cross-event idempotency (`payment.captured` + `order.paid` resulting in exactly ONE job)
- Duplicate retry deduplication
- Amount mismatch rejection
- Flow sensor pulse counting and hardware completion
- ESP32 reboot recovery
