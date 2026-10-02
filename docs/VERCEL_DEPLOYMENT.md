# AQUORA — Vercel Deployment Guide

## Overview

This guide explains how to deploy the AQUORA Admin Panel frontend to Vercel.

---

## Prerequisites

- GitHub account with the AQUORA repository
- Vercel account (free tier works)
- Supabase project with anon key

---

## Step 1: Push Repository to GitHub

Ensure your latest code is pushed:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

## Step 2: Open Vercel

Go to [https://vercel.com](https://vercel.com) and sign in with your GitHub account.

---

## Step 3: Import GitHub Repository

1. Click **"Add New..."** → **"Project"**
2. Select the **AQUORA** repository from your GitHub account
3. Click **"Import"**

---

## Step 4: Configure Project Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `AQUORA_ADMIN_PANEL/frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

> **Important:** Set the Root Directory to `AQUORA_ADMIN_PANEL/frontend` since the admin panel is not at the repository root.

---

## Step 5: Configure Build Settings

Since the frontend uses a tsconfig that extends the root `tsconfig.base.json`, you may need to override the build command:

```
Build Command: npx tsc --noEmit --skipLibCheck && npx vite build
```

Or modify the tsconfig.json in the frontend to be self-contained (recommended for Vercel).

---

## Step 6: Add Environment Variables

In the Vercel project settings → **Environment Variables**, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | `https://vxcqywbycvasmjngolps.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | *(your anon key)* | Public anon key from Supabase |
| `VITE_API_BASE_URL` | *(your backend URL)* | Backend API URL |
| `VITE_PAYMENT_PROVIDER` | `NOT_CONFIGURED` | Will be updated later |

> **NEVER** add `SUPABASE_SERVICE_ROLE_KEY` or any server secrets as Vercel frontend environment variables. Variables prefixed with `VITE_` are embedded in the client bundle and publicly visible.

---

## Step 7: Deploy

Click **"Deploy"**. Vercel will:

1. Clone your repository
2. Navigate to the root directory
3. Install dependencies
4. Run the build command
5. Deploy the static output

First deployment typically takes 1-2 minutes.

---

## Step 8: Verify

After deployment, verify these routes work:

| Route | Expected |
|-------|----------|
| `/` | Dashboard or login page |
| `/login` | Login page |
| `/dashboard` | Main dashboard |
| `/products` | Products management |
| `/orders` | Orders list |
| `/machines` | Machine management |

> SPA routing is handled by `vercel.json` which rewrites all paths to `index.html`.

---

## Custom Domain (Optional)

1. Go to Vercel project → **Settings** → **Domains**
2. Add your custom domain (e.g., `admin.aquora.io`)
3. Update DNS records as instructed by Vercel
4. Vercel automatically provisions SSL

---

## Redeployment

Vercel automatically redeploys when you push to the `main` branch. You can also trigger manual deployments from the Vercel dashboard.

---

## Troubleshooting

### Build fails with TypeScript errors

Ensure the tsconfig in the frontend directory is self-contained or the build command skips type checking:

```
Build Command: npx vite build
```

### Routes return 404

Ensure `vercel.json` exists in the frontend directory with SPA rewrite rules:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Environment variables not working

- Ensure variable names start with `VITE_`
- Redeploy after adding new variables
- Check that variables are set for the correct environment (Production/Preview/Development)
