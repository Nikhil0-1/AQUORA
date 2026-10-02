# AQUORA — Complete Step-by-Step User Setup & Configuration Guide

> **Document Version:** 1.0.0  
> **Status:** READY FOR EXECUTION  
> **Audience:** Machine Operators, Hardware Integrators, Software Deployers  

Follow this sequential 12-step guide to take the AQUORA platform from fresh repository clone to live, production-grade vending operation.

---

## Step 1: Wi-Fi Network Setup

Both **System 1** (Customer Payment Terminal) and **System 2** (Sanitizer Dispenser) require a steady 2.4 GHz Wi-Fi connection with Internet and local subnet routing.

1. Ensure your router broadcasts on the **2.4 GHz** frequency (ESP32 microcontrollers do not support 5 GHz Wi-Fi).
2. For commercial kiosks, assign **static IP addresses** or set DHCP MAC reservation for:
   - System 1 (Payment Terminal): e.g., `192.168.1.101`
   - System 2 (Dispenser): e.g., `192.168.1.102`
   - Backend Host Server: e.g., `192.168.1.100`

---

## Step 2: Backend IP / Domain Configuration

The microcontrollers must know the address of the AQUORA API server.

1. Find the local IP address of your host machine running the backend:
   ```powershell
   ipconfig
   # Look for "IPv4 Address", e.g., 192.168.1.100
   ```
2. In `AQUORA_SYSTEM_1_PAYMENT_TERMINAL/config.h`:
   ```c
   #define AQUORA_API_URL "http://192.168.1.100:3001"
   ```
3. In `AQUORA_SYSTEM_2_DISPENSING_MACHINE/config.h`:
   ```c
   #define AQUORA_API_URL "http://192.168.1.100:3001"
   ```
   *(For production, replace `http://192.168.1.100:3001` with your HTTPS domain, e.g., `https://api.aquora.io`)*.

---

## Step 3: Supabase Cloud Database & Tables

For persistent storage across restarts and remote fleet monitoring:

1. Log in to [Supabase](https://supabase.com) and click **New Project**.
2. Select your cloud region and set a strong database password.
3. Open the **SQL Editor** tab in the Supabase Dashboard.
4. Copy the entire contents of [`database/schema.sql`](file:///c:/Users/DELL/Desktop/client%20hardware/database/schema.sql) and paste into the query window, then click **Run**.
5. Confirm that all **19 tables** are created:
   * Core: `profiles`, `roles`, `products`, `product_variants`
   * Hardware: `payment_terminals`, `dispensing_machines`, `machine_channels`, `machine_credentials`, `calibrations`
   * Operations: `orders`, `order_items`, `payments`, `dispense_jobs`, `inventory`
   * Telemetry & Audit: `machine_events`, `machine_telemetry`, `machine_errors`, `audit_logs`, `idempotency_keys`
6. Go to **Project Settings > API** and copy:
   - **Project URL**
   - **anon / public key**
   - **service_role key** (keep this secret!)
7. Paste these keys into [`AQUORA_ADMIN_PANEL/backend/.env`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_ADMIN_PANEL/backend/.env).

---

## Step 4: Razorpay Test Account & API Keys

To generate real UPI QR codes on the customer screen:

1. Create a free merchant account at [Razorpay](https://razorpay.com).
2. Toggle the dashboard switch from **Live Mode** to **Test Mode**.
3. Navigate to **Account & Settings > API Keys > Generate Key**.
4. You will receive:
   - `Key ID` (format: `rzp_test_xxxxxxxxxx`)
   - `Key Secret` (format: `xxxxxxxxxxxxxxxxxxxx`)
5. Open [`AQUORA_ADMIN_PANEL/backend/.env`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_ADMIN_PANEL/backend/.env) and populate:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
   ```

---

## Step 5: Webhook Configuration

When a customer scans the QR code and pays on their phone, Razorpay notifies AQUORA instantly via webhook.

1. If testing locally, use a secure tunnel (such as Cloudflare Tunnel or ngrok) to expose port 3001:
   ```bash
   ngrok http 3001
   ```
2. In Razorpay Dashboard, go to **Account & Settings > Webhooks > Add New Webhook**.
3. Set Webhook URL:
   ```text
   https://<your-tunnel-or-domain>/api/v1/payments/webhook
   ```
4. Enter a strong secret string under **Secret** (e.g., `whsec_aquora_prod_2026`).
5. Check the following event triggers:
   - [x] `payment.captured`
   - [x] `payment.failed`
   - [x] `order.paid`
6. Copy that same secret into [`AQUORA_ADMIN_PANEL/backend/.env`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_ADMIN_PANEL/backend/.env):
   ```env
   RAZORPAY_WEBHOOK_SECRET=whsec_aquora_prod_2026
   ```

---

## Step 6: System 1 Firmware Secrets & Upload

1. Open [`AQUORA_SYSTEM_1_PAYMENT_TERMINAL/secrets.h`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_SYSTEM_1_PAYMENT_TERMINAL/secrets.h).
2. Update with your Wi-Fi credentials:
   ```c
   #define AQUORA_WIFI_SSID        "Your_Actual_SSID"
   #define AQUORA_WIFI_PASSWORD    "Your_Actual_Password"
   #define AQUORA_TERMINAL_API_KEY "pt_sec_99a8b7c6d5e4f3a2"
   ```
3. Connect the Elecrow CrowPanel 7.0" ESP32-S3 HMI to your PC via USB-C (use the **UART/PROG** port).
4. Launch Arduino IDE and open [`AQUORA_SYSTEM_1_PAYMENT_TERMINAL.ino`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_SYSTEM_1_PAYMENT_TERMINAL/AQUORA_SYSTEM_1_PAYMENT_TERMINAL.ino).
5. Set Board Settings:
   - **Board:** `ESP32S3 Dev Module`
   - **USB CDC On Boot:** `Enabled`
   - **Flash Size:** `16MB (128Mb)`
   - **Partition Scheme:** `16MB Flash (3MB APP / 9.9MB FATFS)`
   - **PSRAM:** `OPI PSRAM`
6. Select your COM Port and click **Upload**.

---

## Step 7: System 2 Firmware Secrets & Upload

1. Open [`AQUORA_SYSTEM_2_DISPENSING_MACHINE/secrets.h`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_SYSTEM_2_DISPENSING_MACHINE/secrets.h).
2. Update with your Wi-Fi credentials and generate a secure HMAC secret:
   ```c
   #define AQUORA_WIFI_SSID        "Your_Actual_SSID"
   #define AQUORA_WIFI_PASSWORD    "Your_Actual_Password"
   #define AQUORA_MACHINE_SECRET   "your_generated_64_char_machine_secret"
   ```
3. Connect your ESP32 Dispenser Controller board via micro-USB / USB-C.
4. Open [`AQUORA_SYSTEM_2_DISPENSING_MACHINE.ino`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_SYSTEM_2_DISPENSING_MACHINE/AQUORA_SYSTEM_2_DISPENSING_MACHINE.ino) in Arduino IDE.
5. Set Board Settings:
   - **Board:** `ESP32 Dev Module`
   - **Upload Speed:** `921600`
   - **Flash Frequency:** `80MHz`
   - **Partition Scheme:** `Default 4MB with spiffs (1.2MB APP / 1.5MB SPIFFS)`
6. Select COM Port and click **Upload**.

---

## Step 8: System 2 Machine Secret Key Matching

The backend rejects any job polling or telemetry submissions from System 2 unless the HMAC machine signature matches.

1. Ensure the secret string in `AQUORA_SYSTEM_2_DISPENSING_MACHINE/secrets.h`:
   ```c
   #define AQUORA_MACHINE_SECRET "your_generated_64_char_machine_secret"
   ```
2. Matches the secret string in `AQUORA_ADMIN_PANEL/backend/.env`:
   ```env
   MACHINE_SECRET_KEY=your_generated_64_char_machine_secret
   ```
3. When both match, System 2 will authenticate with the server and show a green connection indicator.

---

## Step 9: Flow Sensor Bench Calibration (Pulses per mL)

Different sanitizer liquid formulations (gel vs. alcohol liquid) exhibit different viscosities that affect turbine flow sensors.

1. Fill Channel 1 reservoir with fluid.
2. Place a calibrated measuring cylinder under Nozzle 1.
3. In the Admin Dashboard or via manual test trigger, dispense 100 mL.
4. Check the Serial Monitor (`115200 baud`) on System 2 for the total raw pulses recorded.
5. Calculate the factor:
   $$\text{Pulses per mL} = \frac{\text{Raw Pulses Recorded}}{100}$$
6. Update `DEFAULT_PULSES_PER_ML_CH1` in `AQUORA_SYSTEM_2_DISPENSING_MACHINE/config.h` or store it in the database `calibrations` table.
7. Repeat for Channels 2 through 5.

---

## Step 10: E-Stop Wiring Verification

Safety certification requires the physical E-Stop to cut dispensing instantly:

1. Wire a normally-closed (NC) red mushroom button switch between `GPIO 36` and `GND`.
2. Start a test dispense cycle.
3. Hit the E-Stop button during pumping:
   - All MOSFET gate pins (`GPIO 25, 26, 27, 14, 12`) must drop to `LOW` within **50 microseconds**.
   - System 2 must report an `EMERGENCY_STOP_ACTIVATED` event to the backend.
   - The job must transition to `HALTED_ESTOP`.

---

## Step 11: End-to-End Test in Test Mode

1. Start the backend:
   ```powershell
   cd "c:\Users\DELL\Desktop\client hardware\AQUORA_ADMIN_PANEL\backend"
   npm run dev
   ```
2. System 1 screen will display the customer catalog with products (e.g., Hand Sanitizer 75% Alcohol, Gel Sanitizer, Foam Sanitizer).
3. Tap **Select Product** -> Tap **100 mL** -> Tap **Proceed to Pay**.
4. Dynamic Razorpay QR code appears on screen.
5. Scan QR code using your UPI sandbox test app or simulate payment via Admin Panel.
6. Observe:
   - Payment confirmed on terminal.
   - Job dispatched to System 2.
   - System 2 activates Pump 1, measures flow pulses up to 100 mL, and shuts off cleanly.
   - System 1 shows "Dispense Complete — Thank You!".

---

## Step 12: Production Deployment Checklist

Before leaving the kiosk unattended in a public venue:
- [ ] Rotate all default secrets (`AQUORA_MACHINE_SECRET`, `AQUORA_TERMINAL_API_KEY`).
- [ ] Switch Razorpay keys from `rzp_test_...` to `rzp_live_...`.
- [ ] Connect backend to production Supabase cloud database with Row Level Security (RLS) enabled.
- [ ] Enforce HTTPS on API domain.
- [ ] Fasten all plumbing clamps, inspect tubing for kinks, and prime lines to clear air bubbles.
- [ ] Lock the physical enclosure door and secure all cable entries.
