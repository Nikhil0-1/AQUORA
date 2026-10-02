# AQUORA — Admin Panel Guide

## Overview
The AQUORA Admin Panel is a high-performance web dashboard built with React, Vite, and Tailwind CSS. It connects directly to Supabase with real-time updates for telemetry, orders, payments, and dispensing status.

---

## Key Modules

### 1. Dashboard
- **Real-Time Counters**: Today's orders, revenue, successful payments, and dispensed volume.
- **Machine Fleet Status**: Live statuses (`ONLINE`, `DISPENSING`, `ERROR`, `OFFLINE`) for all registered machines.
- **Live Stream**: Instant status changes streamed via Supabase Realtime subscriptions.

### 2. Product & Variant Management
- Add, edit, or toggle products.
- Configure formula variants, volume options (e.g. 50ml, 100ml, 250ml), and unit prices.
- Map formulas to machine channels (1 to 5).
- **Server Authoritative**: Price changes take effect in the backend immediately; terminals query updated figures without firmware updates.

### 3. Orders & Payments
- View end-to-end customer order history with snapshots of items, amounts, and statuses.
- Audit Razorpay payment transactions with captured payment IDs, signature statuses, and timestamps.
- Explicit Manual Refund action for administrative troubleshooting.

### 4. Dispense Jobs & Hardware Telemetry
- Inspect queued, active, and completed dispense jobs.
- Inspect pulse feedback, target vs. actual dispensed volume (ml), execution times, and sensor error flags.
- View real-time machine telemetry charts (Wi-Fi RSSI, uptime, and safety switch state).

---

## Local Development & Build
```bash
# Navigate to admin panel directory
cd AQUORA_ADMIN_PANEL

# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```
Production build outputs cleanly to `AQUORA_ADMIN_PANEL/dist/`.
