==============================================================================
AQUORA SYSTEM 2 (DISPENSING MACHINE) — REQUIRED ARDUINO LIBRARIES
==============================================================================

System 2 firmware is engineered to rely exclusively on official Espressif core
libraries and standard, widely-vetted open-source Arduino libraries available
directly through the built-in Arduino IDE Library Manager (Tools -> Manage Libraries...
or Ctrl + Shift + I).

------------------------------------------------------------------------------
1. ArduinoJson
------------------------------------------------------------------------------
- Purpose: High-performance JSON parsing for backend job packets, telemetry,
           and heartbeat payloads.
- Required Version: 6.21.4 or 6.21.5 (Recommended) / 7.x compatible
- Arduino Library Manager: YES (Available directly)
- Author: Benoit Blanchon
- Installation:
  1. In Arduino IDE, click Tools -> Manage Libraries...
  2. Search for "ArduinoJson"
  3. Select version 6.21.5 (or latest 6.x / 7.x) and click "Install".

------------------------------------------------------------------------------
2. Built-in Espressif ESP32 Core Libraries (NO EXTERNAL INSTALLATION NEEDED)
------------------------------------------------------------------------------
The following libraries are bundled automatically with the ESP32 Board Package:
- WiFi.h: Hardware Wi-Fi station controller.
- HTTPClient.h: HTTPS/REST API transport with keep-alive.
- WiFiClientSecure.h: TLS/SSL encryption engine.
- Preferences.h: Non-Volatile Storage (NVS) job history cache and calibration.
- esp_task_wdt.h: Hardware Task Watchdog Timer driver.

==============================================================================
SUMMARY: ONLY 1 LIBRARY REQUIRED VIA LIBRARY MANAGER: "ArduinoJson"
==============================================================================
