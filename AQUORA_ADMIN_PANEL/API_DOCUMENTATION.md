# 📡 AQUORA REST & WEBSOCKET API SPECIFICATION (VERSION 1)

Base URL: `http://localhost:3001` or `https://api.yourdomain.com`

---

## 1. Catalog & Customer Endpoints

### `GET /api/v1/products`
Returns the active product catalog, formulas, prices, and volume variants.
- **Response**: `200 OK`
```json
[
  {
    "id": "p1111111-1111-1111-1111-111111111111",
    "name": "AQUORA Classic Sanitizer",
    "price": 40,
    "currency": "INR",
    "volume_ml": 50,
    "channel_id": 1,
    "variants": [
      { "id": "v11", "volume_ml": 50, "price": 40 },
      { "id": "v12", "volume_ml": 100, "price": 70 }
    ],
    "is_available": true
  }
]
```

### `POST /api/v1/orders`
Creates a customer order initiated from System 1 Terminal.
- **Request Body**:
```json
{
  "terminal_code": "AQ-PT-001",
  "machine_code": "AQ-DM-001",
  "items": [
    {
      "product_id": "p2222222-2222-2222-2222-222222222222",
      "quantity": 1,
      "volume_ml": 100,
      "channel_id": 2
    }
  ]
}
```
- **Response**: `201 Created`
```json
{
  "id": "65f3e376-f4a8-4a79-8357-d7c10ad2e389",
  "order_number": "ORD-2026-0001",
  "amount": 60,
  "currency": "INR",
  "order_status": "CREATED"
}
```

### `GET /api/v1/orders/:id/status`
Polls order payment and dispensing lifecycle status.
- **Response**: `200 OK`
```json
{
  "id": "65f3e376-f4a8-4a79-8357-d7c10ad2e389",
  "order_status": "PAID",
  "payment_status": "PAID",
  "dispense_status": "DISPENSING",
  "dispensed_ml": 45,
  "target_ml": 100,
  "progress_percentage": 45
}
```

---

## 2. Payment Gateway & Webhook Endpoints

### `POST /api/v1/payments/create`
Initiates a payment transaction and generates a dynamic UPI QR intent.
- **Request Body**: `{ "order_id": "uuid", "provider": "RAZORPAY" }`
- **Response**: `200 OK`
```json
{
  "payment_id": "pay_xxx",
  "provider_order_id": "order_xxx",
  "amount": 60,
  "qr_code_data": "upi://pay?pa=aquora@icici&pn=AQUORA&am=60&tr=ORD-2026-0001"
}
```

### `POST /api/v1/payment/webhook`
Authoritative server-side webhook endpoint.
- **Headers**: `X-Razorpay-Signature: <hmac_sha256_hash>`
- **Processing**:
  1. Validates HMAC signature against raw request body.
  2. Idempotency check: duplicate deliveries return `200 OK` without creating duplicate jobs.
  3. Transitions Order to `PAID`.
  4. Generates single cryptographically signed job for System 2.

---

## 3. System 2 Dispensing Machine Protocol

### `POST /api/v1/machine/auth`
Exchanges machine ID and pre-shared secret for a session token.

### `GET /api/v1/machine/jobs/next?machine_id=AQ-DM-001`
Polls queue for authorized dispensing jobs.
- **Response**: `200 OK`
```json
{
  "job_id": "AQ-JOB-1790885903",
  "order_id": "65f3e376-f4a8-4a79-8357-d7c10ad2e389",
  "machine_id": "AQ-DM-001",
  "channel": 2,
  "product_id": "p2222222-2222-2222-2222-222222222222",
  "target_volume_ml": 100,
  "protocol_version": 1,
  "signature": "hmac_sha256_job_signature"
}
```

### `POST /api/v1/machine/jobs/progress`
Reports real-time pulse-counted dispensing progress.

### `POST /api/v1/machine/jobs/complete`
Reports target volume reached and pump shutoff confirmation. Deducts inventory and marks order `COMPLETED`.

### `POST /api/v1/machine/heartbeat` & `POST /api/v1/machine/telemetry`
Transmits periodic health, temperature, Wi-Fi RSSI, pump states, and sensor pulse counts.
