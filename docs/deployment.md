# AQUORA Kiosk & Platform Deployment Guide

## 1. 800×480 Touchscreen Kiosk Setup

To deploy the touchscreen interface on physical vending hardware (e.g. Raspberry Pi host or Android/Linux SBC connected to 800×480 HDMI display):

1. **Launch Browser in Kiosk Mode**:
   ```bash
   chromium-browser --kiosk --window-size=800,480 --window-position=0,0 http://localhost:3000/kiosk
   ```
2. Disable touch zoom, context menu, and text selection.
3. Configure auto-start systemd service.

## 2. Cloud Server Deployment (Backend & Database)

```bash
# Build production assets
npm run build

# Start production server
npm --workspace=@aquora/backend run start
```
Set environment variables from `.env.example`.
