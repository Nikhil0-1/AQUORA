# AQUORA — Arduino IDE Libraries & Toolchain Dependency Audit

> **Target Microcontrollers:**  
> - **System 1 (Payment Terminal):** ESP32-S3-WROOM-1 (Elecrow CrowPanel 7.0" HMI)  
> - **System 2 (Dispensing Machine):** ESP32 Dev Module (Espressif ESP32-D0WD-V3)  
> **Arduino Core Version:** `esp32:esp32` by Espressif Systems v2.0.17  

---

## 1. Master Library Dependency Matrix

| Library Name | Version Tested | Installed Location | Used By | Installation Method | Configuration Required | Status |
|---|---|---|---|---|---|---|
| **ArduinoJson** | `v6.21.5` | Global & Local | System 1 & System 2 | Arduino Library Manager / ZIP | `#include <ArduinoJson.h>` | ✅ INSTALLED & VERIFIED |
| **LVGL** | `v8.3.11` | Global (`libraries/lvgl`) | System 1 Only | Arduino Library Manager / ZIP | Requires `lv_conf.h` in libraries root | ✅ INSTALLED & CONFIGURED |
| **TAMC_GT911** | `v1.0.2` | Global (`libraries/TAMC_GT911`) | System 1 Only | Arduino Library Manager / ZIP | I2C Pins: SDA 19, SCL 20, RST 38 | ✅ INSTALLED & VERIFIED |
| **WiFi** | Built-in | ESP32 Core | System 1 & System 2 | Included in ESP32 Core | None | ✅ BUILT-IN |
| **HTTPClient** | Built-in | ESP32 Core | System 1 & System 2 | Included in ESP32 Core | None | ✅ BUILT-IN |
| **WiFiClientSecure** | Built-in | ESP32 Core | System 1 & System 2 | Included in ESP32 Core | None | ✅ BUILT-IN |
| **Preferences** | Built-in | ESP32 Core | System 1 & System 2 | Included in ESP32 Core | NVS Flash storage | ✅ BUILT-IN |
| **esp_system** | Built-in | ESP-IDF / ESP32 Core | System 1 & System 2 | Included in ESP32 Core | Software reset / MAC address | ✅ BUILT-IN |
| **esp_task_wdt** | Built-in | ESP-IDF / ESP32 Core | System 1 & System 2 | Included in ESP32 Core | Hardware Task Watchdog (10s) | ✅ BUILT-IN |
| **esp32-hal-rgb-lcd**| Built-in | ESP32-S3 Core | System 1 Only | Included in ESP32-S3 Core | ST7262 16-bit RGB bus interface | ✅ BUILT-IN |

---

## 2. Library Details & Architecture Roles

### A. ArduinoJson (`v6.21.5`)
* **Role:** High-performance serialization and deserialization of JSON payloads for REST API requests and responses.
* **Usage in System 1:**
  - Parsing product catalog received from `/api/v1/terminal/products`.
  - Serializing order creation requests sent to `/api/v1/orders`.
  - Parsing polling status updates from `/api/v1/orders/{order_id}` and `/api/v1/terminal/dispense-status`.
* **Usage in System 2:**
  - Parsing job payloads received from `/api/v1/machine/jobs/next`.
  - Formatting real-time dispensing progress packets sent to `/api/v1/machine/jobs/{job_id}/progress`.
  - Formatting periodic telemetry and heartbeat payloads.

### B. LVGL — Light and Versatile Graphics Library (`v8.3.11`)
* **Role:** Professional touch UI rendering engine driving the 7.0" 800x480 RGB display.
* **Usage:** Exclusively in **System 1 (Payment Terminal)**.
* **Configuration Requirements:**
  A customized `lv_conf.h` header must reside in the Arduino libraries directory alongside `lvgl`.
  Key flags verified in AQUORA:
  ```c
  #define LV_COLOR_DEPTH 16          // 16-bit RGB565 color format
  #define LV_COLOR_16_SWAP 0         // Standard byte ordering for ST7262
  #define LV_USE_LOG 0               // Disabled in production for maximum performance
  #define LV_MEM_CUSTOM 0            // Internal allocator with PSRAM pool
  #define LV_USE_QRCODE 1            // Built-in QR code generator widget for Razorpay UPI
  #define LV_FONT_MONTSERRAT_14 1    // Standard font
  #define LV_FONT_MONTSERRAT_18 1    // Heading font
  #define LV_FONT_MONTSERRAT_24 1    // Large price & title font
  ```

### C. TAMC_GT911 (`v1.0.2`)
* **Role:** Capacitive multi-touch driver for the Goodix GT911 controller on the Elecrow CrowPanel 7.0".
* **Usage:** Exclusively in **System 1 (Payment Terminal)**.
* **Wiring Mapping:**
  ```c
  #define TOUCH_GT911_SDA   19
  #define TOUCH_GT911_SCL   20
  #define TOUCH_GT911_RST   38
  #define TOUCH_GT911_INT   -1    // Operating in high-speed polled mode
  ```

---

## 3. Installation Guide via Arduino Library Manager

If setting up on a new PC:
1. Open **Arduino IDE**.
2. Go to **Sketch > Include Library > Manage Libraries...** (or press `Ctrl + Shift + I`).
3. Search for and install:
   - `ArduinoJson` (Choose version **6.21.5**; do not upgrade to v7 without code migration).
   - `lvgl` (Choose version **8.3.11**).
   - `TAMC_GT911` (Choose version **1.0.2**).
4. Verify compilation of both projects:
   - Compile System 1 targeting **ESP32S3 Dev Module**.
   - Compile System 2 targeting **ESP32 Dev Module**.
