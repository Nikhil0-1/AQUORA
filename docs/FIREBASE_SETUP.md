# AQUORA — Firebase Authentication Setup Guide for Admin Panel

> **CRITICAL ARCHITECTURAL BOUNDARY:**
> Firebase is used **STRICTLY AND SOLELY FOR ADMIN AUTHENTICATION**.
> Supabase remains the **SINGLE SOURCE OF TRUTH** for all database tables: products, variants, prices, inventory, orders, payments, dispense jobs, terminals, and machine telemetry.
> **DO NOT** create Firestore databases or Realtime Database in Firebase.
> **DO NOT** commit real Firebase credentials or server secrets to Git.

---

## 1. Create or Select a Firebase Project

1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or select your existing company/organization project).
3. Project Name: `aquora-admin` (or similar).
4. Google Analytics is optional (enable or disable per your company preference).
5. Click **Create project**.

---

## 2. Enable Authentication Provider

1. In the Firebase console left sidebar, navigate to **Build** → **Authentication**.
2. Click **Get started**.
3. Under the **Sign-in method** tab, choose:
   - **Email/Password**: Click and toggle **Enable**. (Do NOT enable email link passwordless unless desired).
   - *(Optional)* **Google**: Enable if you prefer corporate Google Workspace single sign-on.
4. Click **Save**.

---

## 3. Register Web Application

1. In Project Overview, click the **Web icon (`</>`)** to add an app.
2. App nickname: `AQUORA Admin Web`.
3. Check or leave unchecked "Also set up Firebase Hosting" (AQUORA Admin is deployable to Vercel).
4. Click **Register app**.

---

## 4. Obtain Web Configuration

Firebase will display your client SDK configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "aquora-admin.firebaseapp.com",
  projectId: "aquora-admin",
  storageBucket: "aquora-admin.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef..."
};
```

These client variables are safe for the frontend browser.

---

## 5. Add Environment Variables

In your deployment environment (Vercel) or local `.env` file (copied from `.env.example`), provide:

```env
# Firebase Web Auth Client (Admin Panel)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=aquora-admin.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=aquora-admin
VITE_FIREBASE_STORAGE_BUCKET=aquora-admin.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef...
```

> If these environment variables are left blank in local development, the AQUORA Admin Panel enters **Safe Offline Development Mode** where any valid email can sign in with simulated role mapping.

---

## 6. Create Admin Users in Firebase Console

1. In the Firebase Console, go to **Authentication** → **Users**.
2. Click **Add user**.
3. Enter the admin credentials:
   - Email: `admin@aquora.com`
   - Password: `[Secure Admin Password]`
4. Click **Add user**. Copy the generated **User UID** (e.g., `dK7x...`).

---

## 7. Map Firebase UID to AQUORA Admin Role in Supabase

In Supabase SQL Editor, execute an insert into the `admin_users` table to grant permissions:

```sql
-- Map Firebase user to an AQUORA administrative role:
-- Supported roles: 'SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'TECHNICIAN'

INSERT INTO admin_users (firebase_uid, email, role, display_name, is_active)
VALUES (
  'dK7x...',                      -- Firebase User UID
  'admin@aquora.com',             -- Firebase Email
  'SUPER_ADMIN',                  -- Role
  'AQUORA Lead Administrator',    -- Display name
  TRUE
)
ON CONFLICT (firebase_uid) 
DO UPDATE SET 
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;
```

### Role Hierarchy & Permissions

| Role | Catalog CRUD | Price Edit | Stock Adjust | Orders View | Flow Calibration |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **SUPER_ADMIN** | Yes | Yes | Yes | Yes | Yes |
| **ADMIN** | Yes | Yes | Yes | Yes | Yes |
| **OPERATOR** | View | View | Refill | Yes | View |
| **TECHNICIAN**| View | View | Calibration | View | Yes |

---

## 8. Test Admin Login

1. Open the AQUORA Admin Panel at `/` or `/admin`.
2. Click **Admin Login** in the upper right navigation bar.
3. Enter the email and password created in Firebase.
4. Click **Sign In**.
5. The widget displays the authenticated admin email and the mapped badge (e.g. `SUPER_ADMIN`).

---

## 9. Test Protected Routes & Mutations

1. Modify a product variant price (e.g. 100 ml ₹35 $\rightarrow$ ₹40).
2. The mutation is authorized and sent to Supabase.
3. Test logging out: click the logout icon. Notice that modification forms and actions require re-authentication.

---

## Summary Checklist
- [x] Firebase Project created
- [x] Email/Password provider enabled
- [x] Web app registered & config copied to `.env`
- [x] Admin user created in Firebase Authentication
- [x] Firebase UID mapped to `admin_users` table in Supabase
- [x] Tested login & role authorization
