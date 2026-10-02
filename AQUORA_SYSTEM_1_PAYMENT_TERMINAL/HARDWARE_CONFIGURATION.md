# 🖥 AQUORA SYSTEM 1 — HARDWARE CONFIGURATION REFERENCE

## 1. Verified Target Hardware Board
- **Model**: **Elecrow CrowPanel 7.0-inch ESP32-S3 HMI Intelligent Display**
- **Resolution**: **800 × 480 Landscape**
- **SoC**: ESP32-S3-WROOM-1-N16R8 (16MB Quad SPI Flash, 8MB Octal PSRAM)
- **LCD Driver IC**: ST7262 (16-bit Parallel RGB interface)
- **Touch Driver IC**: Goodix GT911 (Capacitive 5-point Multi-Touch over I2C)
- **Official Hardware Documentation**:  
  https://www.elecrow.com/wiki/esp32-display-702727-intelligent-touch-screen-wi-fi26ble-800480-hmi-display.html

---

## 2. Complete GPIO Mapping Table

### A. LCD 16-Bit RGB Interface (ST7262)
| Function | ESP32-S3 GPIO | Description |
|---|---|---|
| **LCD_DE** | **GPIO 40** | Data Enable |
| **LCD_VSYNC** | **GPIO 41** | Vertical Sync |
| **LCD_HSYNC** | **GPIO 39** | Horizontal Sync |
| **LCD_PCLK** | **GPIO 42** | Pixel Clock (16MHz) |
| **LCD_R0 - R4** | **GPIO 45, 48, 47, 21, 14** | 5-Bit Red Bus |
| **LCD_G0 - G5** | **GPIO 5, 6, 7, 15, 16, 4** | 6-Bit Green Bus |
| **LCD_B0 - B4** | **GPIO 8, 3, 46, 9, 1** | 5-Bit Blue Bus |
| **LCD_BL** | **GPIO 2** | Backlight PWM control |

### B. Capacitive Touch (GT911)
| Function | ESP32-S3 GPIO | Description |
|---|---|---|
| **TOUCH_SDA** | **GPIO 19** | I2C Data line |
| **TOUCH_SCL** | **GPIO 20** | I2C Clock line |
| **TOUCH_INT** | **GPIO 18 / -1** | Interrupt (polled mode active) |
| **TOUCH_RST** | **GPIO 38** | Hardware Reset line |

### C. Thermal Receipt Printer (Optional External)
| Function | ESP32-S3 GPIO | Description |
|---|---|---|
| **PRINTER_TX** | **GPIO 43** | ESP32 TX to Printer RX (9600 baud) |
| **PRINTER_RX** | **GPIO 44** | ESP32 RX from Printer TX |

---

## 3. Arduino IDE Board Settings (Crucial)

When configuring Arduino IDE for this board:
- **Board**: `ESP32S3 Dev Module`
- **USB CDC On Boot**: `Enabled`
- **CPU Frequency**: `240MHz (WiFi)`
- **Flash Mode**: `QIO 80MHz`
- **Flash Size**: `16MB (128Mb)`
- **Partition Scheme**: `16M Flash (3MB APP/9.9MB FATFS)` or `Huge APP (3MB No OTA/1MB SPIFFS)`
- **PSRAM**: **`OPI PSRAM`** *(MANDATORY for 800×480 double buffer)*
- **Upload Mode**: `UART0 / Hardware CDC`
