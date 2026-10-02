# ⚙️ AQUORA SYSTEM 1 (PAYMENT TERMINAL) — USER CONFIGURATION GUIDE

This document lists **every configurable parameter** for the Payment Terminal, categorized into:
1. **MUST EDIT** (Required before first upload)
2. **OPTIONAL** (UI adjustments and hardware peripherals)
3. **DO NOT EDIT** (Display timings and security boundaries)

---

## 🔴 1. MUST EDIT (Before First Upload)

File to edit: [`secrets.h`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_SYSTEM_1_PAYMENT_TERMINAL/secrets.h)

| Macro Name | Default Value | Description / What to Enter |
|---|---|---|
| `AQUORA_WIFI_SSID` | `"Aquora-WiFi"` | The exact SSID (Name) of your local 2.4GHz Wi-Fi network. |
| `AQUORA_WIFI_PASSWORD` | `"AquoraPass123"` | The password for your 2.4GHz Wi-Fi network. |
| `AQUORA_TERMINAL_API_KEY` | `"terminal_api_key_sample"` | Terminal pre-shared key registered in the backend database. |

File to edit: [`config.h`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_SYSTEM_1_PAYMENT_TERMINAL/config.h)

| Macro Name | Default Value | Description / What to Enter |
|---|---|---|
| `AQUORA_API_URL` | `"http://192.168.1.100:3001"` | The IP address or domain name of your running AQUORA backend server. |

---

## 🟡 2. OPTIONAL (Timing & Peripherals)

File to edit: [`config.h`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_SYSTEM_1_PAYMENT_TERMINAL/config.h)

| Macro Name | Default Value | Description / When to Edit |
|---|---|---|
| `UI_AUTO_RESET_TIMEOUT_MS` | `60000` | Inactivity timer (60 seconds). Automatically returns to the Welcome Screen if user walks away mid-order. |
| `UI_COMPLETION_DISPLAY_MS` | `8000` | Duration (8 seconds) to display the "THANK YOU! TAKE BOTTLE" screen before returning home. |
| `UI_POLL_INTERVAL_MS` | `1000` | Frequency of order status and live dispensing progress queries. |

File to edit: [`pins.h`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_SYSTEM_1_PAYMENT_TERMINAL/pins.h)

| Macro Name | Default Value | Description / When to Edit |
|---|---|---|
| `PRINTER_TX`, `PRINTER_RX` | `43, 44` | UART1 pins for optional external thermal receipt printer. |
| `LCD_PIN_BK_LIGHT` | `2` | Backlight PWM control pin on the CrowPanel HMI board. |

---

## 🟢 3. DO NOT EDIT (Hardware Architecture & Safety)

File: [`pins.h`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_SYSTEM_1_PAYMENT_TERMINAL/pins.h) and [`include/board_config.h`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_SYSTEM_1_PAYMENT_TERMINAL/include/board_config.h)

- **RGB 16-Bit LCD Data Bus**: Fixed to the CrowPanel ST7262 hardware traces (GPIOs 40, 41, 39, 42, 45, 48, 47, 21, 14, 5, 6, 7, 15, 16, 4, 8, 3, 46, 9, 1). Changing these will corrupt the video signal.
- **GT911 I2C Touch Controller**: Fixed to GPIO 19 (SDA), GPIO 20 (SCL), GPIO 38 (RST).
- **NO PUMP GPIOs**: System 1 is physically isolated from pump actuation.
