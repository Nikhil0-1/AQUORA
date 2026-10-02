# AQUORA Hardware Architecture & Wiring Guide

## Bill of Materials (BOM)

1. **Microcontroller**: ESP32 NodeMCU / DevKit V1
2. **Sanitizer Channels**: 5 Independent Channels
   - 5 × 12V DC Diaphragm / Peristaltic Liquid Pumps (Food/Alcohol Sanitizer compatible)
   - 5 × Hall-effect Flow Sensors (5-24V DC input, Pulse output)
   - 5 × Stainless Steel Dispensing Nozzles & Silicone Tubing
3. **Power Subsystem**:
   - 1 × 12V 10A SMPS (Mains Power)
   - 1 × 12V to 5V Step-Down Buck Converter (ESP32 power)
   - 1 × 5-Channel Relay Module / MOSFET Driver Board (Optocoupler isolated)
4. **User Interface & Safety**:
   - 1 × 800×480 7-inch Touchscreen Display (HDMI/USB Touch or Raspberry Pi / Android host)
   - 1 × Emergency Stop Switch (Latching NC/NO)
   - Fuse Block (5A Inline Fuse per pump)

## GPIO Pinout Table

| Channel / Peripheral | Function | ESP32 GPIO | Pin Type |
|---|---|---|---|
| Channel 1 | Pump Relay 1 | GPIO 26 | Digital Output |
| Channel 1 | Flow Sensor 1 | GPIO 34 | Digital Input (ISR) |
| Channel 2 | Pump Relay 2 | GPIO 27 | Digital Output |
| Channel 2 | Flow Sensor 2 | GPIO 35 | Digital Input (ISR) |
| Channel 3 | Pump Relay 3 | GPIO 14 | Digital Output |
| Channel 3 | Flow Sensor 3 | GPIO 32 | Digital Input (ISR) |
| Channel 4 | Pump Relay 4 | GPIO 12 | Digital Output |
| Channel 4 | Flow Sensor 4 | GPIO 33 | Digital Input (ISR) |
| Channel 5 | Pump Relay 5 | GPIO 13 | Digital Output |
| Channel 5 | Flow Sensor 5 | GPIO 25 | Digital Input (ISR) |
| Safety | Emergency Stop | GPIO 23 | Input Pullup (ISR) |
| Indicator | Status LED | GPIO 2 | Output |

## Sanitizer Liquid Compatibility Notice
Standard water pumps may degrade when exposed to 70%+ Isopropyl Alcohol or Ethanol sanitizers. Use Viton / EPDM seals and food-grade silicone tubing for all fluid paths.
