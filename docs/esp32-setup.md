# Aquora ESP32 Vending Controller — Setup & Flashing Guide

## 1. Prerequisites
- **Microcontroller**: ESP32-WROOM-32 or ESP32-S3 development board.
- **Toolchain**: Visual Studio Code with **PlatformIO IDE** extension installed.
- **USB Cable**: High-quality micro-USB or USB-C data cable.

---

## 2. Directory Structure
```
firmware/esp32-vending-controller/
├── include/
│   └── config.h         # Pin mappings, WiFi credentials, API endpoints
├── src/
│   ├── main.cpp         # Main setup and non-blocking event loop
│   ├── api_client.cpp   # HTTPS / REST communication
│   ├── pump_controller.cpp # 5-Channel MOSFET gate driver
│   ├── flow_sensor.cpp  # Interrupt pulse counters
│   ├── qr_scanner.cpp   # UART2 scanner receiver
│   ├── safety_manager.cpp # E-Stop and watchdog cutoff
│   ├── machine_state.cpp # Finite state machine
│   ├── wifi_manager.cpp # WiFi auto-reconnect
│   └── logger.cpp       # Serial structured telemetry
└── platformio.ini       # Board dependencies & partition table
```

---

## 3. Configuration
Open `include/config.h` and configure:
1. `DEFAULT_WIFI_SSID`: Your local 2.4 GHz WiFi network name.
2. `DEFAULT_WIFI_PASS`: Network password.
3. `BACKEND_BASE_URL`: IP address and port of the Aquora backend server (e.g. `http://192.168.1.100:3001`).

---

## 4. Building and Flashing
1. Open the `firmware/esp32-vending-controller` directory in VS Code.
2. Build firmware:
   ```bash
   pio run
   ```
3. Upload to connected ESP32:
   ```bash
   pio run --target upload
   ```
4. Open Serial Monitor (115200 baud):
   ```bash
   pio device monitor -b 115200
   ```
5. Confirm startup logs:
   ```
   [SYSTEM] ESP32 Aquora Vending Controller Booting...
   [PUMP] All 5 pump output GPIOs initialized to safe LOW state.
   [SAFETY] Hardware E-Stop interrupt configured on GPIO 21
   [FLOW] Flow sensor interrupt pins initialized.
   [SCANNER] UART2 QR Scanner initialized on RX:16, TX:17 at 9600 baud
   [WIFI] WiFi Connected! IP: 192.168.1.101
   ```
