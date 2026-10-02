# AQUORA Database Schema & Supabase Configuration

## Entity Relationship Diagram Overview

- **products**: 5 Sanitizer products mapped to 5 machine channels.
- **product_variants**: Volume options (50ml, 100ml, 150ml, 250ml, 500ml) with INR prices.
- **machines**: Registered machines (code: `AQ-VM-001`), location, firmware version, RSSI, status.
- **machine_channels**: Channel 1 to 5 mapping (product_id, current_level_ml, max_capacity_ml, calibration_factor).
- **orders**: Customer orders (order_number, total amount ₹, payment_status, order_status).
- **order_items**: Products and volume requested per order.
- **payments**: Razorpay transaction IDs, payment status, idempotency keys.
- **dispense_jobs**: Single dispense jobs issued to ESP32 (channel_number, target_volume_ml, dispensed_volume_ml, status).
- **machine_telemetry**: Logged hardware metrics (uptime, heap, RSSI, state).
- **machine_errors**: Error logs (code, message, severity, channel_number).
- **inventory**: Tank stock levels and low-threshold alerts.

## SQL Schema & Migrations
See `services/backend/migrations/001_initial_schema.sql` and `002_seed_data.sql`.
