# Aquora Smart Sanitizer Hardware Integration & Electrical Safety Guide

> [!CAUTION]
> **ELECTRICAL SAFETY WARNING**:
> ESP32 microcontroller GPIO pins supply 3.3V at a maximum of 12mA per pin. **NEVER connect high-current inductive food-grade pumps or solenoid valves directly to ESP32 pins.** Direct connection will instantly destroy the microcontroller and presents a fire hazard.

---

## 1. Power Supply Architecture
- **Logic Power (3.3V / 5V)**: Isolated 5V 2A switching supply powering the ESP32 board, logic level shifters, and optical barcode scanner.
- **Motor/Pump Power (12V / 24V DC)**: Dedicated industrial Mean Well 12V 10A (or 24V 5A) DC power supply powering the 5 diaphragm sanitizer pumps and valves.
- **Common Ground**: All DC grounds (5V GND and 12V GND) MUST be securely bonded at a single star-ground point to avoid ground loops and inductive ringing.

---

## 2. Recommended Actuator Driver Circuit (Per Channel)

```
                       +12V / +24V Motor VCC
                             |
                             +-----+
                             |     |
                           [M1]  [D1] Flyback Diode (1N5819 or SS34)
                          Motor    |  (Cathode to +12V, Anode to Drain)
                             |     |
                             +-----+
                             |
                           Drain
                             |
 ESP32 GPIO ---> [R1: 100R] -+--- Gate [Q1: Logic-Level N-MOSFET (IRLZ44N / AO3400)]
 (e.g. GPIO 14)              |
                           [R2: 10k Pulldown to GND]
                             |
                           Source
                             |
                            GND
```

### Components per Channel:
1. **MOSFET**: Logic-level N-Channel MOSFET (e.g., IRLZ44N, FQP30N06L, or optocoupled MOSFET module).
2. **Flyback Diode**: 1N5819 Schottky or 1N4007 across motor terminals to dissipate back-EMF energy generated when pump stops.
3. **Gate Pulldown Resistor**: 10k ohm resistor between Gate and GND to keep the pump OFF during ESP32 boot/reset.
4. **Gate Series Resistor**: 100 ohm resistor between GPIO and Gate to dampen ringing.

---

## 3. Flow Sensor Wiring (Hall-Effect / Turbine)
- **Power**: 5V or 3.3V (verify sensor rating, e.g. YF-S401 or G1/4 food grade).
- **Signal**: Connected to interrupt-capable GPIO (GPIO 32, 33, 34, 35, 23).
- **Pullup**: 4.7k ohm resistor between Signal line and 3.3V rail.
- **Calibration Factor**: Default is `4.5 pulses/mL` (adjustable per channel in database or admin panel).

---

## 4. Emergency Stop (E-Stop)
- A normally-closed (NC) red mushroom push-lock button wired between GPIO 21 and GND.
- ESP32 uses internal pull-up on GPIO 21. When depressed or severed, signal goes LOW, triggering hardware interrupt `onEstopInterrupt` within microseconds, cutting all 5 gate outputs.
