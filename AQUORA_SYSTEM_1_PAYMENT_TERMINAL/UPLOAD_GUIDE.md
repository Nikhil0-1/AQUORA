# 🚀 AQUORA SYSTEM 1 (PAYMENT TERMINAL) — UPLOAD & RUN GUIDE

### Quick Upload Checklist

1. **File to Open**:
   ```text
   C:\Users\DELL\Desktop\client hardware\AQUORA_SYSTEM_1_PAYMENT_TERMINAL\AQUORA_SYSTEM_1_PAYMENT_TERMINAL.ino
   ```

2. **Select Board**:
   - Menu: **Tools** ➔ **Board** ➔ **esp32** ➔ **ESP32S3 Dev Module**

3. **Critical Board Settings**:
   - **PSRAM**: `OPI PSRAM`
   - **Flash Size**: `16MB (128Mb)`
   - **USB CDC On Boot**: `Enabled`

4. **Select COM Port**:
   - Menu: **Tools** ➔ **Port** ➔ Select your device's COM port

5. **Compile / Verify**:
   - Press `Ctrl + R` (Verify)

6. **Upload**:
   - Press `Ctrl + U` (Upload)
   - If board does not auto-reset into bootloader, hold the physical **BOOT** button, plug in the USB-C cable, and release **BOOT**.

7. **Open Serial Monitor**:
   - Press `Ctrl + Shift + M`.
   - Set Baud Rate to **`115200 baud`**.
   - Expected boot log:
     ```text
     AQUORA SYSTEM 1
     Payment Terminal
     Firmware: 1.0.0

     Initializing display...
     Initializing touch...
     Connecting WiFi...
     Authenticating terminal...
     Loading configuration...
     READY
     ```
