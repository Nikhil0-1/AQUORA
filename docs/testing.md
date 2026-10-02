# AQUORA End-to-End Testing & Failure Scenario Guide

## End-to-End Test Routine

1. Power machine & start Backend, Kiosk UI, Admin Dashboard, and Machine Simulator.
2. Open 800×480 Kiosk UI (`/kiosk`).
3. Customer touches **TOUCH TO START**.
4. Customer selects **Aloe Vera Sanitizer** (Channel 2).
5. Customer selects **100 ml** quantity (₹35).
6. Customer reviews Order Summary and clicks **PROCEED TO PAY**.
7. Payment modal opens; click **SIMULATE SUCCESSFUL PAYMENT**.
8. Backend verifies payment, marks payment `PAID`, and issues `DispenseJob` for Channel 2.
9. Machine Simulator receives job:
   - Pump 2 turns HIGH (Pumps 1, 3, 4, 5 remain LOW).
   - Flow Sensor 2 counts pulses and reports progress.
   - When 100 ml reached, Pump 2 turns LOW automatically.
10. Kiosk UI updates live progress (`0 ml / 100 ml` → `100 ml / 100 ml`).
11. Kiosk displays **✓ DISPENSING COMPLETE**.
12. Admin Dashboard updates revenue (₹35), volume dispensed (+100 ml), and orders count.

## Failure Scenarios Tested
- **Payment Failed / Cancelled**: No dispensing job created.
- **Duplicate Payment Callback**: Idempotency key ensures only 1 job created.
- **Emergency Stop Pressed**: ESP32 ISR kills pump instantly & transitions to `SAFE_MODE`.
- **No Flow Timeout**: If pump is ON for >3s with 0 pulses, pump stops & reports `FLOW_ERROR`.
- **Wi-Fi Loss**: Automatic non-blocking reconnection attempt every 10s.
