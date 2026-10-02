# 🔍 AQUORA SYSTEM 2 (DISPENSING MACHINE) — TROUBLESHOOTING RUNBOOK

### 1. Board Not Detected / No COM Port in Arduino IDE
- **Cause**: Missing USB-UART driver (CP2102, CH340, or FTDI).
- **Fix**: Download and install the Silicon Labs CP210x or WCH CH340 driver for Windows. Use a data-capable USB cable (some charging cables do not carry D+/D- data lines).

### 2. Upload Fails with "A fatal error occurred: Failed to connect to ESP32: Timed out waiting for packet header"
- **Cause**: ESP32 did not enter UART bootloader mode automatically.
- **Fix**: Hold down the **BOOT** (IO0) button on the ESP32 when Arduino IDE displays `Connecting........_____`, release it once writing starts. (Optional permanent fix: Solder a $10\mu\text{F}$ capacitor between ESP32 EN pin and GND).

### 3. All Pumps Remain OFF / Error: `ERR_ESTOP_ACTIVE`
- **Cause**: Hardware Emergency Stop switch is open or GPIO 36 is floating.
- **Fix**: Verify GPIO 36 has a $10\text{k}\Omega$ pull-up resistor to 3.3V, and the E-Stop NC switch is grounded. If no physical button is attached during bench testing, tie GPIO 36 to GND (or invert logic in `emergency_stop.cpp`).

### 4. Pump Starts, but Cuts Off Immediately with `ERR_FLOW_TIMEOUT`
- **Cause**: 3-second dry-run safety tripped because zero pulses were recorded.
- **Fix**:
  1. Verify the flow sensor pulse pin is wired to the correct input pin (GPIO 34, 35, 32, 33, or 39).
  2. Check sensor power (Hall-effect sensors require 5V VCC).
  3. Ensure liquid is primed in the tubing and the turbine spins freely.

### 5. Wi-Fi Keeps Disconnecting / Resetting
- **Cause**: 12V pump activation causes a power brownout on the 5V/3.3V rail.
- **Fix**:
  1. Add a $1000\mu\text{F}$ electrolytic capacitor across the 12V power rail.
  2. Ensure flyback diodes (1N4007) are installed across all pump terminals.
  3. Separate the pump power supply ground and logic ground using a single star-ground point.
