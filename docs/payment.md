# AQUORA Payment Gateway & Security Guide

## Security Principle
**NEVER TRUST THE FRONTEND FOR PAYMENT SUCCESS.**

```
Customer → Kiosk → Backend creates payment → Razorpay Gateway
                                                   │
Customer completes payment                         │
                                                   ▼
Gateway Webhook Callback → Backend verifies HMAC Signature → Payment = PAID
                                                                  │
                                                                  ▼
                                                      Backend creates Dispense Job
                                                                  │
                                                                  ▼
                                                      ESP32 receives Job
```

## Idempotency & Duplicate Callback Protection
If Razorpay re-sends the payment webhook multiple times:
- Database unique constraint on `order_id` / `payment_id` prevents duplicate job creation.
- Repeated callback returns existing `DispenseJob` without creating new jobs.

## Supported Gateway Providers
- **Razorpay** (Primary India provider for UPI, GPay, PhonePe, Cards, Netbanking)
- **Cashfree** / **PayU** (Abstraction interface allows easy switching)
