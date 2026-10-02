# AQUORA Production Deployment Checklist

## 1. Hardware Verification
- [ ] 12V 10A SMPS output measured under load (12.0V - 12.2V DC).
- [ ] Buck converter output measured at 5.05V DC to ESP32 board.
- [ ] Emergency stop physical switch verified: cuts 12V pump rail immediately upon depression.
- [ ] Flyback diodes verified installed across all 5 pump motor terminals.
- [ ] Pull-down resistors (10kΩ) verified on all 5 MOSFET gates.
- [ ] Food/sanitizer grade tubing (silicone/Viton) clamped and leak-tested.

## 2. Firmware Flashing & Configuration
- [ ] System 1 (CrowPanel 7.0 ESP32-S3 HMI) flashed with `firmware/system-1-payment-terminal`.
- [ ] System 2 (Dispenser ESP32) flashed with `firmware/system-2-dispensing-machine`.
- [ ] WiFi credentials configured and static IP / DHCP reservation assigned.
- [ ] Calibration factor determined for each channel with real liquid and stored in NVS.

## 3. Cloud & Backend Configuration
- [ ] PostgreSQL / Supabase database migrated (`001_initial_schema.sql`, `002_security_rls.sql`).
- [ ] Seed data populated (`database/seed/seed.sql`).
- [ ] `PAYMENT_WEBHOOK_SECRET` and `MACHINE_SECRET_KEY` set in production environment variables.
- [ ] Razorpay webhook URL configured to `https://api.aquora.example.com/api/v1/payment/webhook`.

## 4. End-to-End Operational Verification
- [ ] System 1 displays Welcome screen on 800x480 HMI display.
- [ ] Product selection loads 5 distinct formulas with volume choices.
- [ ] Dynamic UPI QR renders and verifies payment on gateway.
- [ ] Authorized job dispatches to System 2 without direct frontend GPIO exposure.
- [ ] Target volume dispenses accurately with live sensor percentage feedback.
- [ ] Pump turns off automatically upon target volume pulse count.
- [ ] Terminal resets session and returns to Home screen.
