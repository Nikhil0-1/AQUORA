# 🛠 AQUORA SYSTEM 1 (PAYMENT TERMINAL) — ARDUINO IDE SETUP GUIDE

Step-by-step instructions to compile and upload the Payment Terminal firmware to the **Elecrow CrowPanel 7.0-inch ESP32-S3 HMI** using **Arduino IDE 2.x**.

---

### Step 1: Open Arduino IDE
Launch **Arduino IDE 2.x** on your Windows PC.

---

### Step 2: Install Espressif ESP32 Core
1. In Arduino IDE, open **File** ➔ **Preferences** (`Ctrl + ,`).
2. Add this URL to **Additional boards manager URLs**:
   ```text
   https://espressif.github.io/arduino-esp32/package_esp32_index.json
   ```
3. Open **Boards Manager** (left toolbar icon), search for **`esp32`** by Espressif Systems.
4. Select version **`2.0.14`** or **`2.0.17`** (Recommended) and click **Install**.

---

### Step 3: Install Required Libraries
Open the Library Manager (**Tools** ➔ **Manage Libraries...** / `Ctrl + Shift + I`) and install:
1. **`ArduinoJson`** (v6.21.5 by Benoit Blanchon)
2. **`lvgl`** (v8.3.11 by LVGL)
3. **`TAMC_GT911`** (v1.0.2 by formatc1702)

#### Important: LVGL Configuration
Ensure your Arduino libraries directory contains an enabled `lv_conf.h`:
- Path: `Documents\Arduino\libraries\lv_conf.h` (or inside `lvgl/lv_conf.h`)
- Set line 15: `#if 1` (enable file)
- Set line 27: `#define LV_COLOR_DEPTH 16`
- Set line 52: `#define LV_MEM_CUSTOM 0` (or enable custom allocator for PSRAM)

---

### Step 4: Open the Sketch
1. Click **File** ➔ **Open...** (`Ctrl + O`).
2. Navigate to:
   ```text
   C:\Users\DELL\Desktop\client hardware\AQUORA_SYSTEM_1_PAYMENT_TERMINAL\AQUORA_SYSTEM_1_PAYMENT_TERMINAL.ino
   ```
3. Click **Open**.

---

### Step 5: Select Board & Board Parameters
In the **Tools** menu, configure the exact settings:
- **Board**: **`ESP32S3 Dev Module`**
- **USB CDC On Boot**: **`Enabled`**
- **CPU Frequency**: **`240MHz (WiFi)`**
- **Core Debug Level**: `None`
- **Flash Mode**: **`QIO 80MHz`**
- **Flash Size**: **`16MB (128Mb)`**
- **Partition Scheme**: **`16M Flash (3MB APP/9.9MB FATFS)`**
- **PSRAM**: **`OPI PSRAM`** *(Crucial: ST7262 framebuffers require Octal PSRAM)*
- **Upload Speed**: `921600`

---

### Step 6: Select COM Port
Connect the CrowPanel via USB-C to the **UART / PROG** port. Click **Tools** ➔ **Port** and select the detected COM port.

---

### Step 7: Configure Secrets
Open the **`secrets.h`** tab and set your Wi-Fi credentials (`AQUORA_WIFI_SSID` & `AQUORA_WIFI_PASSWORD`). Open **`config.h`** and set `AQUORA_API_URL` to your backend server IP.

---

### Step 8: Compile & Upload
1. Press `Ctrl + R` to compile.
2. Press `Ctrl + U` to flash to the ESP32-S3.
3. Open Serial Monitor at **115200 baud** to view startup messages.
