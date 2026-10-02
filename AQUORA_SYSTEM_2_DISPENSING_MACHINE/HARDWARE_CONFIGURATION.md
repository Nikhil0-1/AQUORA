# 🔌 AQUORA SYSTEM 2 — HARDWARE CONFIGURATION & WIRING SPECIFICATION

## 1. Microcontroller Target
- **Board**: Standard ESP32 Dev Module (38-pin or 30-pin, ESP-WROOM-32).
- **Core Architecture**: Dual-Core Xtensa LX6 @ 240MHz.
- **Power**: 5V DC via Vin pin (from regulated Buck converter) or USB-C / Micro-USB during programming.

---

## 2. Channel & Actuator Wiring Table

| Channel | Sanitizer Formula | Pump Output Pin | Driver Type | Flow Sensor Pin | Sensor Type |
|---|---|---|---|---|---|
| **Channel 1** | Classic Sanitizer | **GPIO 25** | N-Ch Logic MOSFET | **GPIO 34** (IRAM ISR) | Hall-Effect 5V/3.3V |
| **Channel 2** | Aloe Vera Gel | **GPIO 26** | N-Ch Logic MOSFET | **GPIO 35** (IRAM ISR) | Hall-Effect 5V/3.3V |
| **Channel 3** | Herbal Neem Disinfectant | **GPIO 27** | N-Ch Logic MOSFET | **GPIO 32** (IRAM ISR) | Hall-Effect 5V/3.3V |
| **Channel 4** | Premium Moisturizing | **GPIO 14** | N-Ch Logic MOSFET | **GPIO 33** (IRAM ISR) | Hall-Effect 5V/3.3V |
| **Channel 5** | Family Antimicrobial | **GPIO 12** | N-Ch Logic MOSFET | **GPIO 39** (IRAM ISR) | Hall-Effect 5V/3.3V |
| **E-Stop** | Hardware Emergency Stop | — | — | **GPIO 36** (IRAM ISR) | Active LOW NC Button |
| **LED** | Status Indicator | **GPIO 2** | Built-in / External | — | 330Ω Series Resistor |

---

## 3. Power Distribution Rules

1. **Dual Power Rails**:
   - **12V 10A DC SMPS**: Powers all 5 diaphragm/peristaltic pumps.
   - **5V 3A DC Buck Converter**: Steps 12V down to 5.0V to feed ESP32 Vin and flow sensor VCC.
   - **COMMON GROUND**: The 12V supply ground and ESP32 GND must be bonded together.

2. **Inductive Kickback Protection**:
   - Each DC pump MUST have a **1N4007** or **SS34** flyback diode installed across its terminals (Cathode to +12V, Anode to MOSFET Drain).

3. **MOSFET Gate Pull-Downs**:
   - Place a **10kΩ pull-down resistor** between each MOSFET Gate and GND. This guarantees pumps remain completely OFF during ESP32 bootup and reset states.

4. **Emergency Stop (E-Stop)**:
   - Wire the emergency stop push button as **Normally Closed (NC)** between GPIO 36 and GND, with a **10kΩ pull-up resistor** to 3.3V.
   - When the button is hit, the circuit opens, triggering the falling edge interrupt to shut off all pumps in $< 1\,\text{ms}$.
