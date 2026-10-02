# AQUORA — Troubleshooting Guide

## Admin Panel

### Build fails with "Cannot find module '@aquora/api-client'"

The admin panel uses monorepo workspace packages. Run `npm install` from the project root first:

```bash
cd /path/to/AQUORA
npm install
```

### Blank page after Vercel deployment

Ensure `vercel.json` exists in the frontend directory with SPA rewrites:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Environment variables not loading

- Frontend: Variables must be prefixed with `VITE_`
- Restart the dev server after changing `.env`
- For Vercel: Redeploy after adding variables

---

## Supabase

### "Permission denied for table" errors

RLS is enabled. Ensure:
1. You're authenticated with the correct role
2. RLS policies exist for your use case
3. The anon key is correct in your `.env`

### "relation does not exist" errors

Migrations haven't been applied. Run:
```sql
-- In Supabase SQL Editor
-- Copy and run database/schema.sql
```

---

## Hardware / ESP32

### Wi-Fi connection fails

1. Check SSID and password in `secrets.h`
2. Ensure 2.4GHz Wi-Fi (ESP32 doesn't support 5GHz)
3. Check signal strength

### Backend connection fails

1. Verify `BACKEND_URL` in `config.h`
2. Ensure backend server is running and accessible
3. Check firewall/port rules

### Flow sensor not reading

1. Check wiring on the correct GPIO pin (see `pins.h`)
2. Verify sensor power supply (5V/3.3V as required)
3. Run calibration procedure

---

## Payment

### Payment status stuck on "PENDING"

Payment webhook not configured. See `docs/PAYMENT_SETUP.md`.

### "Payment Successful" but no dispensing

Dispense job creation requires:
1. Webhook to verify payment
2. Backend to create dispense job
3. Machine to poll and accept job

Check each step in sequence.

---

## General

### Ports in use

Default ports:
- Backend: 3001
- Frontend dev: 3002
- WebSocket: 3001 (same as backend)

If a port is in use, change it in the respective `.env` or config file.
