# AQUORA — Smart Sanitizer Vending Machine Platform

> IoT-powered automated sanitizer dispensing with ESP32, Supabase, and React

---

## What is AQUORA?

AQUORA is a **production-grade smart vending machine platform** for automated liquid sanitizer dispensing. It combines embedded hardware (ESP32), a cloud backend (Supabase/PostgreSQL), a React admin panel, and a secure payment flow to create a fully automated, remotely manageable vending experience.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AQUORA PLATFORM                          │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   SYSTEM 1   │   SUPABASE   │  ADMIN PANEL │   SYSTEM 2     │
│  Payment     │   Backend    │  Management  │  Dispensing     │
│  Terminal    │              │  Dashboard   │  Machine        │
│  (ESP32-S3)  │  PostgreSQL  │  (React/Vite)│  (ESP32)        │
│              │  Auth / RLS  │              │                 │
│  Touchscreen │  Edge Funcs  │  Vercel      │  5-Channel      │
│  UPI/QR Pay  │  Realtime    │  Deployment  │  Pump Control   │
│              │  Storage     │              │  Flow Sensors   │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────┘
       │              │              │                │
       │    HTTPS     │              │     HTTPS      │
       └──────────────┤              ├────────────────┘
                      │              │
              ┌───────▼──────────────▼───────┐
              │      SUPABASE CLOUD          │
              │   (Central Source of Truth)   │
              │                              │
              │  Products, Orders, Payments  │
              │  Machines, Telemetry, Logs   │
              └──────────────────────────────┘
```

### Flow

```
Customer → Touchscreen (System 1) → Select Product → UPI Payment
    → Payment Verified (Webhook) → Dispense Job Created
    → System 2 Receives Job → Pump Activates → Flow Sensor Measures
    → Dispensing Complete → Customer Receives Product
    → Admin Panel Shows Real-Time Status
```

---

## Repository Structure

```
AQUORA/
│
├── AQUORA_SYSTEM_1_PAYMENT_TERMINAL/    # ESP32-S3 Touchscreen Payment Kiosk
│   ├── *.ino                            # Arduino main sketch
│   ├── config.h / pins.h / version.h    # Hardware configuration
│   ├── secrets.h.example                # Credential template
│   └── src/ / include/ / libraries/     # Source code & dependencies
│
├── AQUORA_SYSTEM_2_DISPENSING_MACHINE/  # ESP32 5-Channel Dispensing Controller
│   ├── *.ino                            # Arduino main sketch
│   ├── config.h / pins.h / version.h    # Hardware configuration
│   ├── secrets.h.example                # Credential template
│   └── src/ / include/ / libraries/     # Source code & dependencies
│
├── AQUORA_ADMIN_PANEL/                  # Web Admin Dashboard
│   ├── frontend/                        # React + Vite + Tailwind
│   ├── backend/                         # Express.js API Server
│   ├── supabase/                        # Migrations, Functions, Seeds
│   └── database/                        # Schema reference
│
├── apps/                                # Monorepo workspace apps
│   ├── admin-dashboard/                 # Admin dashboard app
│   ├── payment-terminal/                # Payment terminal web app
│   └── machine-simulator/              # Hardware simulator
│
├── backend/                             # Core backend server
├── packages/                            # Shared packages
│   ├── api-client/                      # API client library
│   ├── shared-types/                    # TypeScript type definitions
│   ├── machine-protocol/                # Machine communication protocol
│   ├── validation/                      # Shared validation logic
│   └── ui/                              # Shared UI components
│
├── database/                            # Database schema & migrations
├── docs/                                # Technical documentation
├── firmware/                            # Firmware source references
├── hardware/                            # Hardware diagrams & schematics
├── tests/                               # End-to-end test suites
│
├── .env.example                         # Environment variable template
├── .gitignore                           # Git exclusion rules
├── LICENSE                              # MIT License
└── README.md                            # This file
```

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase** account and project
- **Arduino IDE** 2.x (for ESP32 firmware)
- **Git**

### 1. Clone

```bash
git clone https://github.com/Nikhil0-1/AQUORA.git
cd AQUORA
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Supabase URL, keys, etc.
```

### 4. Run Admin Panel (Development)

```bash
cd AQUORA_ADMIN_PANEL/frontend
cp .env.example .env
# Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

### 5. Run Backend Server (Development)

```bash
cd AQUORA_ADMIN_PANEL/backend
cp .env.example .env
# Add your server-side secrets
npm install
npm run dev
```

---

## Supabase Configuration

See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) for complete Supabase setup including:

- Project creation
- Database migrations
- Authentication & roles
- Row Level Security (RLS)
- Storage buckets
- Edge Functions
- Realtime configuration

---

## Vercel Deployment

See [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) for step-by-step deployment of the Admin Panel to Vercel.

---

## Payment Gateway

See [docs/PAYMENT_SETUP.md](docs/PAYMENT_SETUP.md) for payment gateway configuration.

**Status: NOT CONFIGURED YET** — Payment credentials (Razorpay/UPI) will be configured separately during production setup.

---

## Hardware Setup

See individual system guides:

- [AQUORA_SYSTEM_1_PAYMENT_TERMINAL/SETUP_GUIDE.md](AQUORA_SYSTEM_1_PAYMENT_TERMINAL/SETUP_GUIDE.md)
- [AQUORA_SYSTEM_2_DISPENSING_MACHINE/SETUP_GUIDE.md](AQUORA_SYSTEM_2_DISPENSING_MACHINE/SETUP_GUIDE.md)

For Arduino firmware:
1. Copy `secrets.h.example` to `secrets.h`
2. Fill in your Wi-Fi credentials and backend URL
3. Upload via Arduino IDE

---

## Security

- **No secrets in source code** — All credentials use `.env` / `secrets.h` (gitignored)
- **Service Role Key** — Server-side only, never in frontend or firmware
- **RLS Policies** — Row Level Security enforced on all Supabase tables
- **Machine Authentication** — ESP32 devices use token-based auth via Edge Functions
- **Payment Verification** — Webhook signature verification, server-side only

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| System 1 (Payment Terminal) | ESP32-S3, LVGL, TFT Touchscreen |
| System 2 (Dispensing Machine) | ESP32, Relay Drivers, Flow Sensors |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions) |
| Admin Panel | React 18, Vite, Tailwind CSS |
| Payment | Razorpay UPI (to be configured) |
| Deployment | Vercel (Admin Panel), Supabase Cloud |
| Protocol | HTTPS, WebSocket, JSON |

---

## License

MIT — See [LICENSE](LICENSE)