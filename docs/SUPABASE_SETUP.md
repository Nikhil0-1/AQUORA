# AQUORA — Supabase Setup Guide

## Overview

Supabase is the central backend for AQUORA, providing PostgreSQL database, authentication, Row Level Security, Edge Functions, Realtime, and Storage.

---

## 1. Supabase Project

The AQUORA Supabase project is configured at:

- **Project Name:** Nikhil0-1's Project
- **Project ID:** `vxcqywbycvasmjngolps`
- **Region:** `ap-south-1` (Mumbai)
- **Database Version:** PostgreSQL 17

---

## 2. Database Schema

The complete schema is defined in:

- `database/schema.sql` — Full consolidated schema
- `AQUORA_ADMIN_PANEL/supabase/migrations/` — Incremental migrations

### Core Tables

| Table | Purpose |
|-------|---------|
| `roles` | Role definitions (SUPER_ADMIN, ADMIN, OPERATOR, TECHNICIAN) |
| `profiles` | User profiles linked to Supabase Auth |
| `products` | Product catalog |
| `product_variants` | Volume/price variants per product |
| `payment_terminals` | System 1 terminal registry |
| `dispensing_machines` | System 2 machine registry |
| `machine_channels` | 5 channels per machine with product mapping |
| `orders` | Customer orders |
| `order_items` | Line items with price snapshots |
| `payments` | Payment records from gateway |
| `dispense_jobs` | Machine dispensing jobs |
| `machine_events` | Machine event log |
| `machine_telemetry` | Machine health telemetry |
| `machine_errors` | Error tracking |
| `inventory` | Tank level estimates |
| `calibrations` | Flow sensor calibration history |
| `machine_credentials` | Secure machine authentication |
| `audit_logs` | Administrative action audit trail |
| `idempotency_keys` | Duplicate prevention |

---

## 3. Apply Migrations

Migrations can be applied via:

### Option A: Supabase Dashboard

1. Go to **SQL Editor** in the Supabase Dashboard
2. Copy and paste the content of `database/schema.sql`
3. Click **Run**

### Option B: Supabase CLI

```bash
supabase db push
```

### Option C: Supabase MCP

Use the `apply_migration` tool with the project ID.

---

## 4. Authentication

AQUORA uses Supabase Auth for the Admin Panel.

### Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. Configure email templates if needed

### Create Initial Admin User

1. Go to **Authentication** → **Users** → **Add User**
2. Enter the admin email and password
3. After user is created, note the user ID
4. Insert a profile record:

```sql
INSERT INTO profiles (id, user_id, full_name, email, role)
VALUES (
  uuid_generate_v4(),
  'THE_AUTH_USER_UUID',
  'Admin Name',
  'admin@aquora.com',
  'SUPER_ADMIN'
);
```

---

## 5. Row Level Security (RLS)

RLS must be enabled on all tables. See `AQUORA_ADMIN_PANEL/supabase/migrations/002_security_rls.sql`.

### Key Policies

| Table | Public Access | Admin Access | Machine Access |
|-------|--------------|-------------|----------------|
| `products` | READ (active only) | FULL | — |
| `product_variants` | READ (active only) | FULL | — |
| `orders` | — | FULL | — |
| `payments` | — | FULL | — |
| `dispense_jobs` | — | FULL | Via Edge Functions |
| `machine_credentials` | — | — | — (Edge Functions only) |

---

## 6. Storage

Create these buckets in **Storage**:

| Bucket | Public | Purpose |
|--------|--------|---------|
| `product-images` | Yes | Product catalog images |
| `machine-documents` | No | Machine manuals, certificates |
| `reports` | No | Generated reports |

### Create via SQL

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('product-images', 'product-images', true),
  ('machine-documents', 'machine-documents', false),
  ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;
```

---

## 7. Realtime

Enable Realtime on these tables for live dashboard updates:

- `orders` — New orders and status changes
- `dispense_jobs` — Dispensing progress
- `machine_events` — Machine online/offline
- `machine_telemetry` — Health updates

Go to **Database** → **Replication** → Enable the tables.

---

## 8. Edge Functions

Edge Functions handle secure server-side operations:

| Function | Purpose |
|----------|---------|
| `payment-webhook` | Verify payment signatures, update order status |
| `create-order` | Validate and create orders with backend pricing |
| `machine-auth` | Authenticate ESP32 devices |
| `machine-next-job` | Return queued jobs for machines |
| `machine-complete-job` | Record dispense completion |

Deploy from `AQUORA_ADMIN_PANEL/supabase/functions/`.

---

## 9. Environment Variables

### Frontend (Public)

```env
VITE_SUPABASE_URL=https://vxcqywbycvasmjngolps.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Backend (Server Secret)

```env
SUPABASE_URL=https://vxcqywbycvasmjngolps.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Get these from **Settings** → **API** in the Supabase Dashboard.

---

## 10. Machine Registration

Register a new machine:

```sql
INSERT INTO dispensing_machines (machine_code, name, location, status, firmware_version)
VALUES ('AQ-DM-001', 'AQUORA Dispenser 1', 'Site A', 'OFFLINE', 'v1.0.0');

INSERT INTO payment_terminals (terminal_code, name, location, assigned_dispensing_machine_code, status)
VALUES ('AQ-PT-001', 'AQUORA Terminal 1', 'Site A', 'AQ-DM-001', 'OFFLINE');
```

---

## 11. Testing

1. Apply migrations
2. Insert seed data from `AQUORA_ADMIN_PANEL/supabase/seed.sql`
3. Verify tables are created with `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`
4. Test RLS policies by querying as anon vs authenticated user
5. Test Edge Functions via curl or the Supabase Dashboard
