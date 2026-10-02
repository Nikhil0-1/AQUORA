# AQUORA — Public Online Customer Web Application

This folder contains the **standalone, customer-facing public web application** for AQUORA.

Customers can access this web app online from any mobile device, tablet, or desktop to browse formulas, select volumes, pay via Razorpay UPI / Cards, and touchlessly dispense sanitizer at AQUORA station **AQ-DM-001**.

---

## Key Features

- **100% Public Access**: No login, account creation, or Firebase authentication required for customers.
- **Server-Authoritative Pricing**: Formulas, volumes, and prices are resolved by the backend. Client cannot tamper with prices.
- **Controlled Station Assignment**: Orders are automatically routed to active station `AQ-DM-001`. Arbitrary customer machine selection is prevented.
- **Real-Time Dispense Tracking**: Live stepper showing payment verification, job queueing, System 2 pump activation, and completion.
- **Mobile First**: Built with responsive Tailwind CSS, fast loading, and touch-friendly controls.

---

## Local Development

```bash
# Navigate to this folder
cd AQUORA_PUBLIC_WEB

# Install dependencies
npm install

# Start local development server on port 3000
npm run dev
```

---

## Standalone Vercel Deployment

You can deploy this folder directly to Vercel as its own independent project:

1. Import the repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `AQUORA_PUBLIC_WEB`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Add Environment Variables:
   - `VITE_API_URL` (Backend URL)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STATION_CODE=AQ-DM-001`
7. Click **Deploy**.
