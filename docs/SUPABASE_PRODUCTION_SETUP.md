# AQUORA — Supabase Production Setup

## Status: REQUIRES CONFIGURATION

This guide explains how to set up Supabase for production after the repository is deployed.

---

## Prerequisites

- Supabase project created (already done: `vxcqywbycvasmjngolps`)
- Access to Supabase Dashboard

---

## Step 1: Apply Database Migrations

Go to the **SQL Editor** in the Supabase Dashboard and run:

1. `database/schema.sql` — Full initial schema
2. `AQUORA_ADMIN_PANEL/supabase/migrations/002_security_rls.sql` — RLS policies

---

## Step 2: Get API Keys

Go to **Settings** → **API** and copy:

- **Project URL**: `https://vxcqywbycvasmjngolps.supabase.co`
- **Anon Key** (public): Safe for frontend
- **Service Role Key** (secret): Server-side only

---

## Step 3: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** authentication
3. Optional: Configure Google/GitHub OAuth

---

## Step 4: Create Admin User

1. **Authentication** → **Users** → **Add User**
2. Enter admin email and password
3. Run SQL to assign role:

```sql
-- After creating the auth user, get their UUID from the Users list
INSERT INTO profiles (user_id, full_name, email, role)
VALUES ('AUTH_USER_UUID', 'Admin Name', 'admin@aquora.com', 'SUPER_ADMIN');
```

---

## Step 5: Configure Storage

Create buckets:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('product-images', 'product-images', true),
  ('machine-documents', 'machine-documents', false),
  ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;
```

---

## Step 6: Enable Realtime

Go to **Database** → **Replication** and enable for:

- `orders`
- `dispense_jobs`
- `machine_events`

---

## Step 7: Deploy Edge Functions

```bash
supabase functions deploy payment-webhook --project-ref vxcqywbycvasmjngolps
```

Or deploy via Supabase Dashboard → **Edge Functions**.

---

## Step 8: Set Edge Function Secrets

```bash
supabase secrets set RAZORPAY_WEBHOOK_SECRET=your_secret --project-ref vxcqywbycvasmjngolps
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key --project-ref vxcqywbycvasmjngolps
```

---

## Step 9: Update Environment Variables

### Admin Panel (Vercel)

```
VITE_SUPABASE_URL=https://vxcqywbycvasmjngolps.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Backend Server

```
SUPABASE_URL=https://vxcqywbycvasmjngolps.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Step 10: Verify

- [ ] Tables created successfully
- [ ] RLS enabled on all tables
- [ ] Auth working (can create user, can login)
- [ ] Storage buckets created
- [ ] Realtime subscriptions working
- [ ] Edge Functions deployed
- [ ] Admin panel connects to Supabase
