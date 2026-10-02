==============================================================================
AQUORA SYSTEM 1 (PAYMENT TERMINAL) — REQUIRED ARDUINO LIBRARIES
==============================================================================

System 1 firmware runs on the ESP32-S3 CrowPanel 7.0-inch 800x480 HMI Display.
Install the following libraries using the built-in Arduino IDE Library Manager
(Tools -> Manage Libraries... or Ctrl + Shift + I).

------------------------------------------------------------------------------
1. ArduinoJson
------------------------------------------------------------------------------
- Purpose: Parsing product catalog lists, order creations, and payment states.
- Required Version: 6.21.5 (Recommended) / 7.x compatible
- Arduino Library Manager: YES (Available directly)
- Author: Benoit Blanchon
- Installation:
  1. Open Tools -> Manage Libraries...
  2. Search for "ArduinoJson"
  3. Select version 6.21.5 and click Install.

------------------------------------------------------------------------------
2. lvgl (Light and Versatile Graphics Library)
------------------------------------------------------------------------------
- Purpose: High-performance embedded GUI engine for 800x480 touch display.
- Required Version: 8.3.11 (Official Elecrow CrowPanel verified version)
- Arduino Library Manager: YES (Available directly)
- Author: LVGL
- Installation:
  1. Open Tools -> Manage Libraries...
  2. Search for "lvgl"
  3. Select version 8.3.11 and click Install.
  4. Copy "lv_conf_template.h" to your Arduino libraries folder as "lv_conf.h"
     and enable: #if 1 (at line 15), set LV_COLOR_DEPTH 16.

------------------------------------------------------------------------------
3. TAMC_GT911
------------------------------------------------------------------------------
- Purpose: Goodix GT911 capacitive touch screen controller driver over I2C.
- Required Version: 1.0.2 (or latest)
- Arduino Library Manager: YES (Available directly)
- Author: formatc1702
- Installation:
  1. Open Tools -> Manage Libraries...
  2. Search for "TAMC_GT911"
  3. Click Install.

------------------------------------------------------------------------------
4. Built-in Espressif ESP32 Core Libraries (NO EXTERNAL INSTALLATION NEEDED)
------------------------------------------------------------------------------
- WiFi.h: Station & connection controller.
- HTTPClient.h: REST API communication.
- esp_lcd: Native Espressif 16-bit RGB bus display driver.
- Preferences.h: Flash storage for terminal config.
- esp_task_wdt.h: Hardware watchdog timer.

==============================================================================
SUMMARY: 3 LIBRARIES REQUIRED VIA LIBRARY MANAGER:
1. ArduinoJson (v6.21.5)
2. lvgl (v8.3.11)
3. TAMC_GT911 (v1.0.2)
==============================================================================
