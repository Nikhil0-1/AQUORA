# AQUORA System 1 — Payment Receiving Terminal

## Firmware Architecture & Reference
* **Target Hardware:** Elecrow CrowPanel 7.0-inch ESP32-S3 HMI (800×480 RGB LCD + GT911 Capacitive Touch)
* **MCU:** ESP32-S3-WROOM-1 (240MHz, 16MB Flash, 8MB Octal PSRAM)
* **Display Interface:** 16-Bit RGB parallel interface (ST7262)
* **UI Engine:** LVGL v8.3.11 with PSRAM double buffering
* **Networking:** Wi-Fi Station (non-blocking state machine), HTTPS/REST Client, WebSocket Realtime Progress
* **Peripheral:** Optional Thermal Receipt Printer on UART1 (ESC/POS)

## Pinout Reference
| Function | Component | GPIO Pin | Notes |
| :--- | :--- | :--- | :--- |
| DE | RGB LCD | GPIO 40 | Data Enable |
| VSYNC | RGB LCD | GPIO 41 | Vertical Sync |
| HSYNC | RGB LCD | GPIO 39 | Horizontal Sync |
| PCLK | RGB LCD | GPIO 42 | Pixel Clock (16MHz) |
| R0 - R4 | RGB LCD | GPIO 45, 48, 47, 21, 14 | Red 5-bit bus |
| G0 - G5 | RGB LCD | GPIO 5, 6, 7, 15, 16, 4 | Green 6-bit bus |
| B0 - B4 | RGB LCD | GPIO 8, 3, 46, 9, 1 | Blue 5-bit bus |
| Backlight | LCD PWM | GPIO 2 | 5kHz PWM (Duty 0-255) |
| Touch SDA | GT911 I2C | GPIO 19 | 400kHz I2C Bus |
| Touch SCL | GT911 I2C | GPIO 20 | 400kHz I2C Bus |
| Touch RST | GT911 | GPIO 38 | Hardware Reset |
| Printer TX | Thermal Printer | GPIO 43 | UART1 TX (9600 Baud) |
| Printer RX | Thermal Printer | GPIO 44 | UART1 RX |

## PlatformIO Build Instructions
```bash
cd firmware/system-1-payment-terminal
pio run
pio run --target upload
```
