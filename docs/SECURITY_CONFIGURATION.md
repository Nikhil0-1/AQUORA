# AQUORA — Security Configuration & Key Isolation

## 1. Secret Isolation Matrix

| Secret / Credential | Allowed Locations | Forbidden Locations | Exposure Risk |
|---|---|---|---|
| `RAZORPAY_WEBHOOK_SECRET` | Supabase Edge Function Secrets (`Deno.env`) | Frontend JS, System 1/2 firmware, Git, Logs, DB fields | Tampered webhook attacks |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Edge Functions & Backend Server | Frontend JS, System 1/2 firmware, Git, Public APIs | Full database bypass |
| `SUPABASE_ANON_KEY` | Admin Frontend, System 1 Terminal | Server-only secrets manager | Public query limits enforced by RLS |
| `MACHINE_SECRET` | System 2 ESP32 NVS, Supabase `machine_credentials` | Public APIs, Client browsers, Logs | Rogue hardware impersonation |

---

## 2. Row Level Security (RLS) Enforcement

RLS is enabled on **all 18 tables** in the AQUORA database:

- `products`, `product_variants`, `categories`:
  - `SELECT`: Publicly accessible (`is_available = true`).
  - `INSERT/UPDATE/DELETE`: `service_role` or admin only.
- `orders`, `payments`:
  - `SELECT`: Filtered by order number / terminal code.
  - `INSERT/UPDATE`: `service_role` only. Unauthenticated customers cannot mark payments as `PAID`.
- `dispense_jobs`:
  - `SELECT/UPDATE`: Restricted to `service_role` and authenticated machines.
  - Customers cannot query or create dispense jobs directly.
- `machine_credentials`:
  - `ALL`: Restricted strictly to `service_role`.
- `webhook_events`, `idempotency_keys`:
  - `ALL`: Restricted to `service_role`.

---

## 3. Webhook Security Verification Flow

1. Raw HTTP body received as string via `await req.text()`.
2. Extract header `x-razorpay-signature`.
3. Compute `HMAC-SHA256(raw_body, RAZORPAY_WEBHOOK_SECRET)` using Web Crypto API.
4. Execute constant-time comparison to prevent side-channel timing attacks.
5. If invalid $\rightarrow$ Reject with `HTTP 401 Unauthorized` before any database queries or JSON parsing.
