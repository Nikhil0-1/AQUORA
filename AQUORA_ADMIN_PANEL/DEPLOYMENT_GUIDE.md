# 🚀 AQUORA ADMIN PANEL — CLOUD DEPLOYMENT GUIDE

This guide explains how to deploy the AQUORA Admin Panel, Backend API, and Supabase database to cloud production environments.

---

## 1. Supabase Database & Auth Deployment

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase SQL Editor:
   - Run [`database/schema.sql`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_ADMIN_PANEL/database/schema.sql) to create all 19 production tables and foreign keys.
   - Run [`supabase/migrations/002_security_rls.sql`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_ADMIN_PANEL/supabase/migrations/002_security_rls.sql) to enable Row-Level Security policies.
   - Run [`database/seed/seed.sql`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_ADMIN_PANEL/database/seed/seed.sql) to populate initial product catalogs and machines.
3. Deploy Edge Function:
   ```bash
   npx supabase functions deploy payment-webhook --project-ref YOUR_PROJECT_REF
   ```

---

## 2. Backend API Deployment (Railway / Render / AWS EC2)

1. Connect your repository to **Railway** or **Render**.
2. Set Root Directory to `AQUORA_ADMIN_PANEL/backend`.
3. Set Build Command: `npm install && npm run build`
4. Set Start Command: `npm start`
5. Configure Environment Variables:
   - `PORT=3001`
   - `SUPABASE_URL=https://your-project.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`
   - `RAZORPAY_KEY_ID=rzp_live_xxx`
   - `RAZORPAY_KEY_SECRET=your_secret`
   - `RAZORPAY_WEBHOOK_SECRET=your_webhook_secret`
   - `MACHINE_SECRET_KEY=aquora_machine_secret_key_prod`

---

## 3. Frontend Admin Dashboard Deployment (Vercel / Netlify)

1. Connect repository to **Vercel** or **Netlify**.
2. Set Root Directory to `AQUORA_ADMIN_PANEL/frontend`.
3. Set Framework: **Vite**.
4. Set Environment Variables:
   - `VITE_API_URL=https://api.yourdomain.com`
   - `VITE_WS_URL=wss://api.yourdomain.com/ws`
   - `VITE_SUPABASE_URL=https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=your-anon-key`
5. Deploy. Access your admin dashboard at `https://admin.yourdomain.com`.
