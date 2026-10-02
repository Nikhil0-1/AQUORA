# AQUORA — Vercel Deployment Guide

## Overview

The AQUORA platform is configured for **effortless, zero-config deployment on Vercel**.
Both the **Public Online Customer Web App** and the **Firebase-Protected Admin Panel** can be deployed together or independently.

---

## Deployment Option 1: Unified Full Platform Deployment (RECOMMENDED)

Deploy the entire repository in one click. Both the Public Customer Web and Admin Panel will be hosted on the same domain.

### Route Mapping
- `https://your-app.vercel.app/` $\rightarrow$ **Public Customer Online Web App** (No auth required, direct product ordering & Razorpay payment)
- `https://your-app.vercel.app/admin` $\rightarrow$ **AQUORA Admin Portal** (Protected by Firebase Auth `aquora-e7eb0`)
- `https://your-app.vercel.app/kiosk` $\rightarrow$ **Full-Screen Hardware Kiosk Mode**

### Vercel Project Settings

| Setting | Value |
| :--- | :--- |
| **Framework Preset** | Vite (or Other) |
| **Root Directory** | `./` *(Leave empty / root)* |
| **Build Command** | `npm run build` *(Default)* |
| **Output Directory** | `dist` *(Default)* |
| **Install Command** | `npm install` *(Default)* |

---

## Deployment Option 2: Standalone Admin Panel Only

If you prefer to deploy **only** the Admin Panel to its own dedicated Vercel project:

### Vercel Project Settings

| Setting | Value |
| :--- | :--- |
| **Framework Preset** | Vite |
| **Root Directory** | `AQUORA_ADMIN_PANEL/frontend` *(or `apps/admin-dashboard`)* |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

---

## Deployment Option 3: Standalone Public Customer Web App Only

If you prefer to deploy **only** the Customer Store to its own dedicated customer-facing domain:

### Vercel Project Settings

| Setting | Value |
| :--- | :--- |
| **Framework Preset** | Vite |
| **Root Directory** | `apps/payment-terminal` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

---

## Environment Variables to Add in Vercel

In Vercel **Project Settings** $\rightarrow$ **Environment Variables**, add the following:

```env
# Backend API URL (Your deployed backend server or Supabase URL)
VITE_API_URL=https://your-aquora-backend.com

# Supabase Public Keys
VITE_SUPABASE_URL=https://vxcqywbycvasmjngolps.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4Y3F5d2J5Y3Zhc21qbmdvbHBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1OTE2MDYsImV4cCI6MjA1OTE2NzYwNn0.Vd3P2w59nKk05y30Lw2hH_9x7zZ5b0s2sF714242424

# Firebase Web Auth Client (Admin Authentication)
VITE_FIREBASE_API_KEY=AIzaSyC7JLagW2qQM8ORNrJ3R6cYWoV7SfoUP04
VITE_FIREBASE_AUTH_DOMAIN=aquora-e7eb0.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=aquora-e7eb0
VITE_FIREBASE_STORAGE_BUCKET=aquora-e7eb0.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=918822102243
VITE_FIREBASE_APP_ID=1:918822102243:web:d82efc62ac3f2a3588d1d6
VITE_FIREBASE_MEASUREMENT_ID=G-PN03R4ZBW2
```

> **SECURITY NOTICE:** NEVER add `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, or `RAZORPAY_WEBHOOK_SECRET` in frontend Vercel deployments. Those belong strictly on the backend / Supabase Edge Functions.

---

## Verifying Deployment

1. **Customer Web (`/`)**: Opens immediately with zero login required. You can select products, adjust volume, and checkout.
2. **Admin Portal (`/admin`)**: Opens the secure Firebase Admin Gatekeeper. Sign in using your Firebase administrator email and password (`aquora-e7eb0`).
