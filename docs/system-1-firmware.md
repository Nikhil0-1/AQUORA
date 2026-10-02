# AQUORA System 1 Firmware Specification

## Overview
System 1 is the customer-facing Payment Receiving Terminal running on an ESP32-S3 with an Elecrow CrowPanel 7.0-inch 800×480 RGB touchscreen.

## Key Subsystems
1. **Display & Touch:**
   - 16-bit RGB ST7262 parallel bus with hardware DMA in Octal PSRAM.
   - GT911 capacitive touch over I2C at 400kHz.
   - LVGL 8.3 double-buffered graphics engine.
2. **State Machine:**
   - Explicit states: `BOOT`, `CONNECTING_WIFI`, `AUTHENTICATING`, `LOADING_CONFIG`, `READY`, `SELECTING_PRODUCT`, `SELECTING_VOLUME`, `ORDER_REVIEW`, `PAYMENT_PENDING`, `PAYMENT_PROCESSING`, `PAYMENT_SUCCESS`, `QUEUED`, `DISPENSING`, `COMPLETED`, `PAYMENT_FAILED`, `DISPENSING_FAILED`, `OFFLINE`, `MAINTENANCE`, `RESETTING`.
3. **Payment Flow:**
   - Dynamic UPI QR Code generated per order.
   - Non-blocking payment status polling and WebSocket subscription.
4. **Safety & Kiosk Enforcements:**
   - 45-second inactivity timeout resets customer session.
   - System 1 NEVER controls pumps directly.
5. **Peripheral Support:**
   - Optional ESC/POS thermal printer on UART1 for transaction receipts.
