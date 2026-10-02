# 🖥 AQUORA ADMIN PANEL & CLOUD BACKEND PLATFORM

This folder contains the complete, production-grade **AQUORA Admin Panel and Cloud Backend** infrastructure.
It is an authoritative, web-based management suite built for fleet operators, technicians, and store administrators to remotely manage machines, products, orders, live telemetry, inventory, and dispensing calibrations over the internet.

---

## 🏛 Architecture & Tech Stack

```text
AQUORA_ADMIN_PANEL/
├── frontend/             # Operator Web Dashboard (React 18, TypeScript, Vite, Tailwind, Framer Motion)
├── backend/              # Authoritative Express API, WebSockets & Idempotent Payment Router
├── database/             # PostgreSQL 19-table Production Schema & Seed Catalogs
├── supabase/             # Supabase Migrations, RLS Policies & Deno Edge Functions
├── README.md             # This document
├── SETUP_GUIDE.md        # Local development and installation runbook
├── DEPLOYMENT_GUIDE.md   # Cloud deployment (Vercel, Railway, Supabase Cloud, Docker)
├── ENVIRONMENT_VARIABLES.md # Detailed environment key documentation
├── API_DOCUMENTATION.md  # Complete REST & WebSocket API specification
└── TEST_REPORT.md        # Automated verification matrix and test logs
```

---

## ⚡ Key Capabilities

1. **Fleet & Telemetry Monitoring**: Live heartbeats, uptime tracking, Wi-Fi RSSI, and real-time pump/flow states for all connected `AQ-DM-xxx` machines.
2. **Dynamic Product & Price Management**: Remotely update sanitizer formula names, descriptions, prices in INR (₹), and volume variants without touching firmware.
3. **Order & Payment Lifecycle**: Full audit log of all transactions, webhook HMAC verification, and payment refund processing.
4. **Flow Sensor Calibration Panel**: Field calibration tool for technicians to adjust pulse-per-ml factors per liquid channel.
5. **Inventory Tracking**: 5-tank estimated remaining levels with low-stock alerts and refill logging.
6. **Multi-Role RBAC**: Built-in access levels for `SUPER_ADMIN`, `ADMIN`, `OPERATOR`, and `TECHNICIAN` protected by Supabase Row-Level Security (RLS).
