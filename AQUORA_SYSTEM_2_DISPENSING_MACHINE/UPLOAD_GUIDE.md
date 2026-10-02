# 🚀 AQUORA SYSTEM 2 (DISPENSING MACHINE) — UPLOAD & RUN GUIDE

### Quick Upload Checklist

1. **File to Open**:
   ```text
   C:\Users\DELL\Desktop\client hardware\AQUORA_SYSTEM_2_DISPENSING_MACHINE\AQUORA_SYSTEM_2_DISPENSING_MACHINE.ino
   ```

2. **Select Board**:
   - Menu: **Tools** ➔ **Board** ➔ **esp32** ➔ **ESP32 Dev Module**

3. **Select COM Port**:
   - Menu: **Tools** ➔ **Port** ➔ Select your device's COM port (e.g. `COM4`)

4. **Compile / Verify**:
   - Press `Ctrl + R` or click the checkmark icon.

5. **Upload**:
   - Press `Ctrl + U` or click the right arrow icon.
   - If prompted with `Connecting...`, press and hold the physical **BOOT** button on the ESP32 board for 1-2 seconds.

6. **Open Serial Monitor**:
   - Press `Ctrl + Shift + M`.
   - Set Baud Rate dropdown to **`115200 baud`**.
   - Press the **EN / RST** button on the ESP32 to reset and watch the expected boot sequence:
     ```text
     AQUORA SYSTEM 2
     Dispensing Machine
     Firmware: 1.0.0

     All pumps OFF
     Initializing flow sensors...
     Emergency stop: OK
     Connecting WiFi...
     Authenticating machine...
     READY
     ```
