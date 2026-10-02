# AQUORA API Reference

## Public & Customer Endpoints

### `GET /api/v1/products`
Returns list of active sanitizer products with dynamic volume options.

### `POST /api/v1/orders`
Creates a new pending order.
```json
{
  "machine_code": "AQ-VM-001",
  "items": [
    { "product_id": "prod-aloe-vera", "quantity": 1, "volume_ml": 100 }
  ]
}
```

### `POST /api/v1/payments/process`
Verifies server payment callback / test mode execution.
```json
{
  "order_id": "ORD-1001",
  "simulate_result": "SUCCESS",
  "payment_method": "UPI_RAZORPAY"
}
```

---

## Machine Protocol Endpoints (ESP32 / Simulator)

- `POST /api/v1/machine/heartbeat` — Sends periodic telemetry (RSSI, state, heap).
- `POST /api/v1/machine/dispense/start` — Reports pump activation.
- `POST /api/v1/machine/dispense/progress` — Reports live volume dispensed (ml).
- `POST /api/v1/machine/dispense/complete` — Reports job completion (final ml, total pulses).
- `POST /api/v1/machine/dispense/fail` — Reports hardware fault or E-Stop abort.

---

## Admin Endpoints

- `GET /api/v1/admin/stats` — Executive metrics (revenue ₹, orders, dispensed volume).
- `GET /api/v1/admin/machines` — Live machine fleet telemetry.
- `GET /api/v1/admin/inventory` — Tank level monitors.
- `PATCH /api/v1/admin/machines/:id/channels/:ch` — Calibration factor update.
