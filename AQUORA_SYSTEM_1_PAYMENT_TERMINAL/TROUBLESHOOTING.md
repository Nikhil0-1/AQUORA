# 🔍 AQUORA SYSTEM 1 (PAYMENT TERMINAL) — TROUBLESHOOTING RUNBOOK

### 1. Screen Shows White / Blank Backlight Only
- **Cause**: PSRAM is not enabled in Arduino IDE, causing RGB frame buffer allocation to fail.
- **Fix**: Open **Tools** ➔ **PSRAM** and ensure **`OPI PSRAM`** is selected (NOT `QSPI` and NOT `Disabled`).

### 2. Touch Screen Not Responding
- **Cause**: GT911 I2C bus conflict or initialization timing issue.
- **Fix**: Check `pins.h` to confirm `TOUCH_GT911_SDA` is GPIO 19 and `TOUCH_GT911_SCL` is GPIO 20. Ensure the ribbon cable of the capacitive digitizer is securely seated in the FPC connector.

### 3. Screen Freezes During Boot
- **Cause**: Blocking Wi-Fi connection loop.
- **Fix**: AQUORA System 1 uses non-blocking Wi-Fi state polling (`WifiManager::update()`). If Wi-Fi cannot connect, the terminal enters offline ready mode after 10 seconds and displays cached local products rather than freezing the LVGL rendering task.

### 4. Compilation Fails with `lv_conf.h: No such file or directory`
- **Cause**: LVGL configuration file not placed in the Arduino search path.
- **Fix**: Copy `lv_conf_template.h` from `Documents/Arduino/libraries/lvgl` to `Documents/Arduino/libraries/lv_conf.h`, open it, and set line 15 to `#if 1`.

### 5. Flash Memory Overflow / Program Too Large
- **Cause**: Default partition scheme selected (1.2MB APP partition is insufficient for LVGL + fonts).
- **Fix**: Open **Tools** ➔ **Partition Scheme** and choose **`16M Flash (3MB APP/9.9MB FATFS)`** or **`Huge APP (3MB No OTA/1MB SPIFFS)`**.
