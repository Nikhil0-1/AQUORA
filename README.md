# 🇮🇳 AQUORA — Smart Sanitizer Vending Machine

> **PAY. DISPENSE. DONE.**  
> A commercial, production-grade Dual-Controller IoT & Full-Stack Sanitizer Vending Machine Platform designed for India deployment.

---

## 🏛 1. Core Architecture: Two Physically Separate Machines

AQUORA strictly separates payment handling from fluid actuation across two isolated microcontrollers:

```
┌────────────────────────────────────────────────────────┐
│               SYSTEM 1: PAYMENT TERMINAL               │
│                      (AQ-PT-001)                       │
│  • CrowPanel 7.0" ESP32-S3 HMI (800×480 Touchscreen)   │
│  • Product selection (5 Sanitizer formulas)            │
│  • Volume selection (50ml, 100ml, 150ml, 250ml, 500ml) │
│  • Dynamic UPI QR code & Payment verification          │
│  • NO DIRECT PUMP CONNECTIONS OR GPIO ACTUATION        │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS / WebSockets
                           ▼
┌────────────────────────────────────────────────────────┐
│                   AQUORA CLOUD BACKEND                 │
│         (Node.js / Express / Supabase / PostgreSQL)    │
│  • Authoritative state machine & Webhook verification  │
│  • Idempotency key tracking (zero duplicate jobs)      │
│  • Cryptographic HMAC-SHA256 Signed Job Dispatcher     │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS / WSS Polling
                           ▼
┌────────────────────────────────────────────────────────┐
│              SYSTEM 2: DISPENSING MACHINE              │
│                      (AQ-DM-001)                       │
│  • ESP32 38-pin Controller                             │
│  • 5 Independent DC Pumps (MOSFET / Relay Driver)      │
│  • 5 Hall-effect Flow Sensors (IRAM ISR Pulse Counters)│
│  • Single-pump hardware interlock (Max 1 pump active)  │
│  • Hardware E-Stop (GPIO 36, Active LOW Interrupt)     │
│  • 3-Second No-Flow Protection & 45s Timeout           │
└────────────────────────────────────────────────────────┘
```

### Critical Safety Enforcement
- **Payment Success $\neq$ Pump On**: Actuation requires cryptographically signed job validation from the backend.
- **Single-Pump Interlock**: Firmware and server strictly reject simultaneous pump operations to prevent power brownouts and nozzle cross-contamination.
- **Fail-Safe Flow Detection**: If no pulses arrive within 3 seconds of pump start, the controller trips `ERR_FLOW_TIMEOUT` and shuts down the pump immediately.

---

## 📂 2. Project Directory Structure

```text
AQUORA/
│
├── apps/
│   ├── payment-terminal/       # 800×480 Landscape Touchscreen Kiosk (React + Vite + Tailwind)
│   ├── admin-dashboard/        # Fleet, Calibrations, Telemetry & Tank Inventory Dashboard
│   └── machine-simulator/      # Real-time System 2 Hardware & Pulse Sensor Emulator
│
├── firmware/
│   ├── system-1-payment-terminal/ # Elecrow CrowPanel ESP32-S3 HMI (LVGL, 800×480 RGB LCD, GT911)
│   └── system-2-dispensing-machine/ # ESP32 Controller (5 Pumps, 5 Flow Sensors, ISR, Watchdog)
│
├── backend/                    # Authoritative Node.js/Express & Supabase API & Realtime Service
│
├── database/
│   ├── schema.sql              # Complete 19-table production PostgreSQL schema
│   ├── migrations/             # Incremental RLS & schema migrations
│   └── seed/                   # Seed data for 5 products, 5 channels, and machines
│
├── packages/
│   ├── shared-types/           # TypeScript models, enums, order states
│   ├── machine-protocol/       # V1 machine communication packets & 17 error codes
│   ├── validation/             # Strict Zod schemas for orders, webhooks & telemetry
│   ├── api-client/             # Type-safe HTTP/WebSocket API client
│   └── ui/                     # Shared UI constants, colors & INR currency formatting
│
├── hardware/
│   ├── wiring/                 # Power distribution, MOSFET/Relay, Flow sensor schematics
│   ├── pinout/                 # Complete GPIO pinout tables for System 1 & System 2
│   └── diagrams/               # Electrical block diagrams & system topology
│
├── docs/                       # Comprehensive engineering specifications & runbooks
├── tests/                      # Vitest End-to-End integration test suite
├── .env.example                # Unified environment template
└── README.md
```

---

## ⚡ 3. Quick Start & Execution

### Prerequisites
- **Node.js** v18+ and `npm` (v9+)
- Windows, Linux, or macOS host

### Installation
```bash
npm install
```

### Running Applications
```bash
# Start Cloud Backend Service (Port 3001)
npm run dev:backend

# Start System 1 Payment Terminal Kiosk UI (Port 5173 - 800×480 Landscape)
npm run dev:terminal

# Start Operator Admin Dashboard (Port 5174)
npm run dev:admin

# Start System 2 Machine Hardware Simulator (Port 5175)
npm run dev:simulator
```

### Building Workspace Packages
```bash
npm run build
```

### Running End-to-End Test Suite
```bash
npm test
```
*Executes all 7 automated test stages: channel configuration, order creation, 5× webhook idempotency deduplication, job queue delivery, pulse counting progress, target volume auto-cutoff, and hardware fault handling.*

---

## 🔌 4. Hardware Pinout Reference

### System 1: Payment Terminal (Elecrow CrowPanel 7.0" ESP32-S3 HMI)
- **LCD Controller**: ST7262 (16-bit RGB Interface: DE=GPIO 40, VSYNC=GPIO 41, HSYNC=GPIO 39, PCLK=GPIO 42, Backlight=GPIO 2)
- **Touch Controller**: Goodix GT911 (I2C: SDA=GPIO 19, SCL=GPIO 20, INT=GPIO 18, RST=GPIO 38)
- **Flash / PSRAM**: 16MB Quad SPI Flash, 8MB Octal PSRAM

### System 2: Dispensing Machine (ESP32 Dev Module 38-Pin)
| Channel | Formula / Product | Pump GPIO (Output) | Flow Sensor GPIO (Input Pullup) |
|---|---|---|---|
| **Channel 1** | Classic Hand Sanitizer | **GPIO 25** | **GPIO 34** (IRAM ISR) |
| **Channel 2** | Aloe Vera Soothing Gel | **GPIO 26** | **GPIO 35** (IRAM ISR) |
| **Channel 3** | Herbal Neem Disinfectant | **GPIO 27** | **GPIO 32** (IRAM ISR) |
| **Channel 4** | Premium Moisturizing | **GPIO 14** | **GPIO 33** (IRAM ISR) |
| **Channel 5** | Family Antimicrobial | **GPIO 12** | **GPIO 39** (IRAM ISR) |
| **E-Stop** | Emergency Stop Switch | — | **GPIO 36** (Active LOW, Falling Edge ISR) |
| **Status LED** | System Health Indicator | **GPIO 2** (Blink / Solid) | — |

---

## 💳 5. Payment Flow & Idempotency Guarantee

```text
1. Customer selects Aloe Vera (100ml, ₹30) on System 1 Terminal (AQ-PT-001).
2. Backend creates Order (status: CREATED) and generates dynamic UPI QR payload.
3. Razorpay webhook fires POST /api/v1/payment/webhook with signature header.
4. Backend verifies HMAC-SHA256 signature and checks Idempotency Key table.
   → If webhook received 5 times, exactly 1 payment recorded, exactly 1 job created.
5. Dispensing Job (AQ-JOB-xxx) signed with Machine Secret and queued for AQ-DM-001.
6. System 2 polls /api/v1/machine/jobs/next, verifies signature, runs startup self-test.
7. System 2 engages single-pump interlock, energizes GPIO 26, counts pulses on GPIO 35.
8. Upon reaching target pulses (Volume × Pulses/ml), GPIO 26 switches OFF immediately.
9. System 2 posts job completion report; Backend marks Order COMPLETED and deducts inventory.
10. System 1 receives WebSocket completion event and displays "THANK YOU! TAKE BOTTLE".
```

---

## 🛡 6. Production Safety Protocols
- **Hardware Watchdog**: System 1 & 2 run hardware WDT (8s / 10s timeout); auto-reboots if main loop hangs.
- **NVS Persistent Replay Defense**: Completed job IDs are committed to ESP32 non-volatile storage (NVS) across power cuts.
- **Fail-Safe Startup**: On boot, all pump GPIOs are explicitly held LOW before peripheral initialization.
- **Dry-Run / Low-Flow Protection**: If pulse delta $< 3$ pulses within 3,000ms, pump trips off immediately.
- **Maximum Run-Time Cap**: Hard cutoff at 45 seconds to guard against sensor disconnections.

---

## 🇮🇳 7. Indian Market Tailoring
- Full rupee symbol (**₹**) pricing throughout terminal, admin, and database.
- Standard Indian bottle volumes: **50 ml, 100 ml, 150 ml, 250 ml, 500 ml**.
- Supports NPCI UPI intent strings and dynamic QR codes (`upi://pay?pa=...`).
- Ambient temperature thermal compensation ready.
#   A Q U O R A  
 