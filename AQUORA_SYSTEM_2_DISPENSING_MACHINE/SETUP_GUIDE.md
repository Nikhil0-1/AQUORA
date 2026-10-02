# 🛠 AQUORA SYSTEM 2 (DISPENSING MACHINE) — ARDUINO IDE SETUP GUIDE

Follow these exact step-by-step instructions to set up, configure, and compile the firmware in **Arduino IDE 2.x**.

---

### Step 1: Open Arduino IDE
Launch **Arduino IDE 2.x** on your Windows PC.

---

### Step 2: Install Espressif ESP32 Board Package
1. In Arduino IDE, navigate to:  
   **File** ➔ **Preferences** (or press `Ctrl + ,`).
2. Locate the field **"Additional boards manager URLs"** and append the following official URL:
   ```text
   https://espressif.github.io/arduino-esp32/package_esp32_index.json
   ```
   *(If multiple URLs exist, separate them with a comma or click the icon to add on a new line).*
3. Click **OK**.
4. Open the Boards Manager by clicking the board icon in the left sidebar (or **Tools** ➔ **Board** ➔ **Boards Manager...**).
5. Search for **`esp32`** (by **Espressif Systems**).
6. **RECOMMENDED VERSION**: Select version **`2.0.14`** or **`2.0.17`** from the version dropdown.  
   *(ESP32 Core 2.0.17 is the verified production release).*
7. Click **Install** and wait for the installation to finish.

---

### Step 3: Install Required Libraries
System 2 requires only one external library from the Library Manager:
1. Open the Library Manager by clicking the library books icon on the left (or **Tools** ➔ **Manage Libraries...** / `Ctrl + Shift + I`).
2. Search for: **`ArduinoJson`**
3. Select version **`6.21.5`** (by Benoit Blanchon).
4. Click **Install**.

---

### Step 4: Open the Sketch
1. In Arduino IDE, click **File** ➔ **Open...** (`Ctrl + O`).
2. Navigate to:
   ```text
   C:\Users\DELL\Desktop\client hardware\AQUORA_SYSTEM_2_DISPENSING_MACHINE\AQUORA_SYSTEM_2_DISPENSING_MACHINE.ino
   ```
3. Click **Open**.

---

### Step 5: Select Board
1. In the menu, click **Tools** ➔ **Board** ➔ **esp32** ➔ **ESP32 Dev Module** (or `DOIT ESP32 DEVKIT V1` if using a 30-pin board).
2. Configure board options under the **Tools** menu:
   - **Upload Speed**: `921600` (or `115200` if upload fails)
   - **CPU Frequency**: `240MHz (WiFi/BT)`
   - **Flash Frequency**: `80MHz`
   - **Flash Mode**: `QIO`
   - **Flash Size**: `4MB (32Mb)`
   - **Partition Scheme**: `Default 4MB with spiffs (1.2MB APP/1.5MB SPIFFS)`
   - **Core Debug Level**: `None` (or `Info` for debugging)

---

### Step 6: Select COM Port
1. Connect your ESP32 board to your Windows PC using a high-quality data USB cable.
2. In Arduino IDE, click **Tools** ➔ **Port** and select the active COM port (e.g., `COM3`, `COM5`).

---

### Step 7: Configure Secrets & Parameters
1. Open the **`secrets.h`** tab in Arduino IDE.
2. Update:
   - `AQUORA_WIFI_SSID`: Your local 2.4GHz Wi-Fi network name.
   - `AQUORA_WIFI_PASSWORD`: Your local Wi-Fi password.
   - `AQUORA_MACHINE_SECRET`: HMAC key matching your database credentials.
3. Open the **`config.h`** tab and verify:
   - `AQUORA_API_URL`: Backend IP/URL (e.g. `http://192.168.1.100:3001`).

---

### Step 8: Verify / Compile
Click the **Verify** button (check-mark icon in the top left, or press `Ctrl + R`).  
Arduino IDE will compile all firmware modules and report:
```text
Sketch uses ... bytes (...) of program storage space.
Global variables use ... bytes (...) of dynamic memory.
```

---

### Step 9: Upload
1. Click the **Upload** button (arrow icon, or press `Ctrl + U`).
2. *Note*: If the upload gets stuck at `Connecting........_____.....`, press and hold the **BOOT** button on your ESP32 board until the flashing percentage begins.
3. Open the **Serial Monitor** (`Ctrl + Shift + M`), set baud rate to **`115200`**, and view the live startup diagnostics.
