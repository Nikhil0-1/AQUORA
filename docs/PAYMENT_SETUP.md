# AQUORA — Payment Gateway Setup

## Status: NOT CONFIGURED YET

Payment credentials will be configured separately during production setup.

---

## Overview

AQUORA uses a payment gateway (Razorpay recommended for India) to process UPI/QR code payments at the kiosk terminal.

### Payment Flow

```
Customer → Touchscreen → Select Product → Backend Creates Order
    → Backend Creates Razorpay Order → QR Code Displayed
    → Customer Scans & Pays → Razorpay Webhook → Backend Verifies
    → Payment Confirmed → Dispense Job Created → Machine Dispenses
```

---

## What Will Be Configured Later

| Item | Description | Where |
|------|------------|-------|
| **Payment Provider Account** | Razorpay merchant account | [razorpay.com](https://razorpay.com) |
| **API Key ID** | Public key for creating orders | `RAZORPAY_KEY_ID` in backend `.env` |
| **API Key Secret** | Server-side secret for verification | `RAZORPAY_KEY_SECRET` in backend `.env` |
| **Webhook Secret** | HMAC signature verification secret | `RAZORPAY_WEBHOOK_SECRET` in backend `.env` |
| **Webhook URL** | Public endpoint for payment notifications | Razorpay Dashboard → Webhooks |
| **UPI Configuration** | UPI VPA/handle for receiving payments | Razorpay Dashboard |
| **Test vs Live Mode** | Start with test keys, switch to live | Razorpay Dashboard → API Keys |

---

## Step-by-Step (To Be Done Later)

### 1. Create Razorpay Account

1. Sign up at [https://razorpay.com](https://razorpay.com)
2. Complete KYC verification
3. Get approved for UPI payments

### 2. Get API Keys

1. Go to **Settings** → **API Keys** → **Generate Key**
2. Copy `Key ID` (starts with `rzp_test_` or `rzp_live_`)
3. Copy `Key Secret` (shown only once — save it securely)

### 3. Configure Webhook

1. Go to **Settings** → **Webhooks** → **Add New Webhook**
2. Set URL: `https://your-backend-url.com/api/v1/payments/webhook`
3. Select events: `payment.authorized`, `payment.captured`, `payment.failed`
4. Generate webhook secret and save it

### 4. Add to Environment

```env
# In AQUORA_ADMIN_PANEL/backend/.env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 5. Test Mode First

Always start with test keys (`rzp_test_...`). Only switch to live keys (`rzp_live_...`) after full end-to-end testing.

### 6. Switch to Live

1. Complete Razorpay activation
2. Replace test keys with live keys
3. Update webhook URL to production domain
4. Test with a real ₹1 payment

---

## Security Requirements

- **NEVER** put `RAZORPAY_KEY_SECRET` in frontend code
- **NEVER** put `RAZORPAY_WEBHOOK_SECRET` in frontend code
- **NEVER** trust client-side payment status — always verify via webhook
- **ALWAYS** verify webhook signature using HMAC-SHA256
- **ALWAYS** use idempotency keys to prevent duplicate processing

---

## Alternative Providers

If Razorpay is not suitable, the architecture supports:

- **Cashfree** — Similar UPI integration
- **PayU** — Indian payment gateway
- **PhonePe PG** — Direct PhonePe integration

The backend payment flow is provider-agnostic. Only the provider-specific API calls and webhook verification need to change.
