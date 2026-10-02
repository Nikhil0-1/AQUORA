# AQUORA — System 1 (Payment Terminal) Setup & Hardware Guide

## Hardware Overview
- **Microcontroller**: ESP32-S3 (WROOM-1 / N16R8, 16MB Flash, 8MB PSRAM)
- **Display**: Elecrow CrowPanel 7.0-inch 800x480 RGB HMI LCD (ST7262 driver)
- **Touch**: Goodix GT911 Capacitive Touch Screen (I2C)
- **Target Sketch**: `AQUORA_SYSTEM_1_PAYMENT_TERMINAL/AQUORA_SYSTEM_1_PAYMENT_TERMINAL.ino`

---

## Pinout Definitions

### 16-Bit RGB LCD Interface
| Signal | GPIO | Description |
|---|---|---|
| DE | 40 | Data Enable |
| VSYNC | 41 | Vertical Sync |
| HSYNC | 39 | Horizontal Sync |
| PCLK | 42 | Pixel Clock |
| R0 – R4 | 45, 48, 47, 21, 14 | Red Color Bus |
| G0 – G5 | 5, 6, 7, 15, 16, 4 | Green Color Bus |
| B0 – B4 | 8, 3, 46, 9, 1 | Blue Color Bus |
| Backlight | 2 | PWM Backlight Dimming |

### GT911 Capacitive Touch (I2C)
| Signal | GPIO | Description |
|---|---|---|
| SDA | 19 | I2C Data |
| SCL | 20 | I2C Clock |
| RST | 38 | Reset Pin |
| INT | -1 (Polled) | Interrupt Pin (or GPIO 18) |

---

## Operating Flow
1. **Boot**: Initializes display, backlight, and touch controller. Displays AQUORA splash banner.
2. **Network**: Connects to configured Wi-Fi via `secrets.h`.
3. **Product Catalog**: Fetches available active products and volume pricing from Supabase REST API (`/rest/v1/products` and `/rest/v1/product_variants`).
4. **Order Creation**: Client selects product, volume, and quantity. Submits order request to backend server/Supabase.
5. **Payment QR**: Displays Razorpay UPI dynamic QR code generated server-side.
6. **Payment Status**: Subscribes to Supabase Realtime / polls order status for `PAID` state.
7. **Dispensing Feedback**: Displays real-time dispensing progress once System 2 updates state to `DISPENSING`.
8. **Completion**: When System 2 completes and database reflects `DISPENSED`, shows success animation and resets to home.

---

## Safety & Security Rules
- System 1 **never** holds Razorpay Secret Keys or Supabase Service Role keys.
- System 1 **never** controls GPIO pumps or direct dispensing hardware.
- System 1 prices are server-driven; it cannot modify product price snapshots.
