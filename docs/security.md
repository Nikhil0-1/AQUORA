# AQUORA Security Architecture & Hardening Guide

## 1. Zero Direct Actuation Principle (Section 69 & 128)
* Browsers and terminals NEVER send raw pump commands (e.g. `POST /pump/1/on` does NOT exist).
* Only the authoritative backend can issue a cryptographically signed Dispensing Job upon verified payment.
* System 2 validates the cryptographic HMAC signature, expiration timestamp, and machine identity before activating any GPIO pin.

## 2. Payment Webhook Security & Idempotency (Section 22)
* Razorpay webhook signature verified using HMAC-SHA256 with server-side `PAYMENT_WEBHOOK_SECRET`.
* Idempotency keys tracked on both payment ID and order ID. If a webhook arrives 5 times, exactly ONE payment status update, ONE order state update, and ONE dispensing job is authorized.

## 3. Machine-to-Cloud Authentication
* System 2 uses an API Key and unique machine identifier to obtain an ephemeral session token (`POST /api/v1/machine/auth`).
* All telemetry and status packets must include valid Bearer authorization.

## 4. Supabase Row Level Security (RLS)
* Customer anon access restricted to reading available products and categories.
* Dispense jobs, telemetry, audit logs, and machine credentials require Supabase `service_role` access.
* Database audit logs record administrative actions, price modifications, and calibration changes.
