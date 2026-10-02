# AQUORA — Complete Payment Flow Specification

## 1. End-to-End Sequence

```text
Customer              System 1 (ESP32-S3)         Supabase Backend           Razorpay Gateway        System 2 (ESP32)
   │                           │                         │                          │                       │
   │── 1. Selects Product ────>│                         │                          │                       │
   │   & Volume (e.g. 100ml)   │                         │                          │                       │
   │                           │── 2. Create Order ─────>│                          │                       │
   │                           │<─ 3. Return Order ──────│                          │                       │
   │                           │      (Status: CREATED)  │                          │                       │
   │                           │                         │                          │                       │
   │                           │── 4. Generate QR ───────┼─────────────────────────>│                       │
   │<─ 5. Displays UPI QR ─────│                         │                          │                       │
   │                           │                         │                          │                       │
   │── 6. Scans & Pays (UPI) ──┼─────────────────────────┼─────────────────────────>│                       │
   │                           │                         │                          │                       │
   │                           │                         │<─ 7. Webhook POST ───────│                       │
   │                           │                         │   (payment.captured)     │                       │
   │                           │                         │   [x-razorpay-signature] │                       │
   │                           │                         │                          │                       │
   │                           │                         │── 8. Verify HMAC-SHA256  │                       │
   │                           │                         │── 9. Check Idempotency   │                       │
   │                           │                         │── 10. Amount Check       │                       │
   │                           │                         │── 11. Payments: PAID     │                       │
   │                           │                         │── 12. Orders: QUEUED     │                       │
   │                           │                         │── 13. Create Job (ONE)   │                       │
   │                           │                         │                          │                       │
   │                           │                         │<─────────────────────────┼────── 14. Poll Next ──│
   │                           │                         │                          │           Job         │
   │                           │                         │──────────────────────────┼─────> 15. Return Job ─│
   │                           │                         │                          │                       │
   │                           │                         │                          │      [Pump ON]        │
   │                           │                         │                          │   [Sensor pulses]     │
   │                           │                         │                          │      [Pump OFF]       │
   │                           │                         │<─────────────────────────┼───── 16. Complete ────│
   │                           │                         │                          │          Report       │
   │                           │                         │── 17. Orders: DISPENSED  │                       │
   │<─ 18. "DISPENSE COMPLETE"─┼─────────────────────────│                          │                       │
```

---

## 2. State Progression Table

| Phase | Table: `orders` | Table: `payments` | Table: `dispense_jobs` | Physical Hardware |
|-------|-----------------|-------------------|------------------------|-------------------|
| Customer selects item | `CREATED` | — | — | Pumps OFF |
| QR Code displayed | `PAYMENT_PENDING` | `PENDING` | — | Pumps OFF |
| Razorpay captures payment | `PAID` | `PAID` | `QUEUED` | Pumps OFF |
| System 2 accepts job | `AUTHORIZED` | `PAID` | `ACCEPTED` | Safety self-check |
| Pump energized | `DISPENSING` | `PAID` | `DISPENSING` | Pump Running, Sensor Counting |
| Flow sensor hits target volume | `DISPENSED` | `PAID` | `COMPLETED` | Pump OFF immediately |
| Hardware Fault (e.g. no flow) | `FAILED` | `PAID` | `FAILED` | Pump OFF immediately |

---

## 3. Idempotency Guarantees

1. **Webhook Delivery Retries**:
   Razorpay retries webhooks on network timeouts. The `webhook_events` table checks `razorpay_event_id`. If already processed, it responds `HTTP 200` with `ignored_duplicate_event`. No second dispense job is created.

2. **Database Constraint**:
   The `dispense_jobs` table enforces `UNIQUE(order_id)`. At the PostgreSQL engine level, two jobs cannot exist for the same order.

3. **Payment Record Protection**:
   Existing payment records are updated by `order_id` or `provider_payment_id`. Repeated webhooks never create duplicate financial transactions.
