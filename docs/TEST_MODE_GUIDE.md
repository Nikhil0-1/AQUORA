# AQUORA — Razorpay Test Mode Verification Guide

## 1. Razorpay Test Mode Overview

In Razorpay Test Mode:
- No real money is moved or charged.
- Razorpay provides test UPI handles and dummy card/netbanking simulators.
- Webhooks send genuine HTTPS POST requests signed with your Test Mode Webhook Secret.

---

## 2. Setting Up Test Mode in Razorpay

1. Log in to [https://dashboard.razorpay.com](https://dashboard.razorpay.com).
2. Toggle to **Test Mode** (orange badge in top navigation).
3. Under **Settings** → **API Keys**:
   - Generate your Test Key ID and Key Secret (used for test order generation).
4. Under **Settings** → **Webhooks**:
   - Click **Add New Webhook**.
   - **URL**: `https://vxcqywbycvasmjngolps.supabase.co/functions/v1/razorpay-webhook`
   - **Secret**: Enter a secure random string (e.g. `rzp_test_secret_aquora_2026`).
   - **Events to Select**:
     - `payment.captured`
     - `order.paid`
     - `payment.failed`
   - Click **Save**.

---

## 3. Configuring Supabase with the Test Secret

In Supabase Dashboard:
1. Open Project `vxcqywbycvasmjngolps`.
2. Go to **Settings** → **Edge Functions** → **Secrets**.
3. Add:
   - Name: `RAZORPAY_WEBHOOK_SECRET`
   - Value: `<your_test_secret_entered_in_razorpay>`

---

## 4. Triggering a Test Webhook from Razorpay Dashboard

Razorpay allows you to send test webhook payloads directly from their dashboard:
1. Go to **Settings** → **Webhooks**.
2. Select the webhook you created.
3. Click the **Send Test Event** or **Deliveries** tab.
4. Select `payment.captured`.
5. Enter a test payload containing `notes.order_id` matching an active order in your database.
6. Click **Send Test Event**.
7. Confirm that Razorpay displays `200 OK` response with:
   ```json
   {
     "success": true,
     "order_id": "...",
     "payment_status": "PAID",
     "dispense_job_id": "...",
     "job_status": "QUEUED"
   }
   ```

---

## 5. Automated 10-Scenario Test Suite

You can execute the automated test suite locally at any time:

```bash
npx vitest run tests/razorpay_webhook_all_scenarios.test.ts
```

This verifies all 10 edge cases:
1. Valid webhook $\rightarrow$ payment verified $\rightarrow$ order updated $\rightarrow$ single job created.
2. Invalid signature $\rightarrow$ 401 rejected $\rightarrow$ zero database mutations.
3. Duplicate webhook $\rightarrow$ detected $\rightarrow$ no duplicate job created.
4. Payment failure $\rightarrow$ order marked FAILED $\rightarrow$ zero pump jobs.
5. Amount mismatch $\rightarrow$ rejected safely $\rightarrow$ zero dispensing.
6. Missing order $\rightarrow$ safe 404 error $\rightarrow$ zero dispensing.
7. Expired job $\rightarrow$ System 2 rejects job $\rightarrow$ pump stays OFF.
8. Flow sensor error $\rightarrow$ pump stops within 3000ms $\rightarrow$ dispense FAILED.
9. Physical dispensing $\rightarrow$ flow pulses reached $\rightarrow$ hardware marks DISPENSED.
10. ESP32 reboot mid-cycle $\rightarrow$ state reconciled via Supabase $\rightarrow$ no duplicate dispensing.
