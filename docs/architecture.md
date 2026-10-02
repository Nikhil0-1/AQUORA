# AQUORA Platform Architecture

## End-to-End System Pipeline

```
  ┌──────────────────────────────────────────────────────────────────┐
  │                 SYSTEM 1: ESP32-S3 PAYMENT TERMINAL              │
  │     Elecrow CrowPanel 7.0" (800x480 RGB LCD + GT911 Touch)      │
  │       - Dynamic Server-Authoritative Catalog & Pricing           │
  │       - Razorpay UPI Dynamic QR Code Display                     │
  │       - Realtime Dispensing & Completion Feedback                │
  └───────────────────────────────┬──────────────────────────────────┘
                                  │ HTTPS / Supabase REST
                                  ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │                     SUPABASE BACKEND PLATFORM                    │
  │       PostgreSQL Database with Row-Level Security (RLS)          │
  │       Realtime Subscriptions & Automated Audit Triggers          │
  │       Project Ref: vxcqywbycvasmjngolps (ap-south-1)             │
  └──────────────┬──────────────────────────────────▲────────────────┘
                 │                                  │
                 ▼                                  │
  ┌───────────────────────────────┐                 │
  │   RAZORPAY TEST MODE GATEWAY  │                 │
  │      UPI Dynamic QR Code      │                 │
  └──────────────┬────────────────┘                 │
                 │ Webhook Event                    │
                 ▼                                  │
  ┌─────────────────────────────────────────────────┴────────────────┐
  │       SUPABASE EDGE FUNCTION: razorpay-webhook                   │
  │       - Raw-body HMAC-SHA256 Signature Verification              │
  │       - Event Idempotency & Cross-Event Deduplication            │
  │       - Server-Authoritative Amount Verification                 │
  │       - Updates Order/Payment to PAID                            │
  │       - Creates EXACTLY ONE Dispense Job in dispense_jobs        │
  │       - NEVER Controls Hardware or GPIOs Directly                │
  └───────────────────────────────┬──────────────────────────────────┘
                                  │
                                  ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │               SYSTEM 2: ESP32 DISPENSING MACHINE                 │
  │       - Boot State: All Pumps Forced OFF                         │
  │       - Single-Pump Mutual Exclusion Interlock                   │
  │       - Hardware E-Stop Switch (GPIO 36, Active LOW)             │
  │       - Hardware Watchdog Timer (8s Timeout)                     │
  │       - Channel-Specific Hall-Effect Flow Pulse Counting         │
  │       - No-Flow Detection & Timeout Protection                   │
  │       - Precise Volume Verification: (Pulses / Factor = ml)      │
  │       - Pump Stop -> Update Status to DISPENSED                  │
  └───────────────────────────────┬──────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
          ┌───────────────────┐       ┌───────────────────┐
          │ 5x 12V/24V Pumps  │       │ 5x Flow Sensors   │
          │ GPIO 25,26,27,    │       │ GPIO 34,35,32,    │
          │ 14, 12            │       │ 33, 39            │
          └───────────────────┘       └───────────────────┘

  [NO RASPBERRY PI] [NO MQTT] [NO INTERMEDIARY PC] [DIRECT SECURE PIPELINE]
```

---

## Architectural Principles

1. **Direct Microcontroller to Cloud Architecture**:
   - System 1 (ESP32-S3) and System 2 (ESP32) communicate directly with Supabase via HTTPS REST and Realtime WebSockets.
   - Eliminates fragile local gateways, single points of failure, and intermediate PCs.

2. **Server-Authoritative Pricing & Flow**:
   - Terminal displays prices fetched from Supabase (`products`, `product_variants`).
   - Order creation verifies authoritative amounts server-side before Razorpay order generation.

3. **Strict State Decoupling**:
   - Payment Success $\neq$ Dispense Success.
   - When Razorpay captures payment, order is updated to `PAID` and a dispense job is created in `QUEUED` state.
   - An order is **never** marked `DISPENSED` until System 2 hardware completes flow measurement and shuts off the pump.
