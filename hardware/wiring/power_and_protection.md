# AQUORA Hardware Wiring & Power Architecture

## 1. Power Distribution Schematic (Section 92)
```text
  [ 230V AC Mains ]
          │
          ▼
   [ 3A Glass Fuse ]
          │
          ▼
  [ Main Power Switch (DPST) ]
          │
          ▼
    [ EMI Filter ]
          │
          ▼
   [ 12V 10A Industrial SMPS ]
          │
          ├───────────────────────────────────────────────┐
          │                                               │
          ▼                                               ▼
  [ Emergency Stop (NC Dual Pole) ]          [ Synchronous Buck Converter ]
          │                                        (12V DC -> 5V DC 3A)
          ▼                                               │
  [ 12V Switched Pump Rail ]                              ├───────────────────────────────┐
          │                                               │                               │
          ├──────────┬──────────┬──────────┬──────────┐   ▼                               ▼
          ▼          ▼          ▼          ▼          ▼  [ ESP32 Vin / 5V ]      [ Hall Flow Sensors VCC ]
       Pump 1     Pump 2     Pump 3     Pump 4     Pump 5  (Internal LDO 3.3V)         (5V or 3.3V)
```

## 2. Pump Electrical Protection Circuit (Section 93)
For each of the 5 channels:
```text
           +12V Switched Rail (From E-Stop)
                 │
                 ├──[ 1.5A Resettable PTC Fuse ]
                 │          │
                 │          ├───[ + Pump Motor Terminal ]
                 │          │         │
                 │          │       [ M ] (DC Pump)
                 │          │         │
                 │          ├───[ - Pump Motor Terminal ]
                 │          │         │
                 │       ┌──┴─────────┴──┐
                 │       │ Flyback Diode │ (1N5819 Schottky / Fast Recovery)
                 │       │   (Cathode +) │
                 │       └──┬─────────┬──┘
                 │          │         │
                 │          └─────────┼──────────────┐
                 │                    │              │
                 │                    ▼              ▼
                 │               Drain (D)      Drain (D)
                 │             ┌─────────────────────────┐
 ESP32 GPIO ────[ 100Ω ]───────┤ Logic-Level N-MOSFET    │
 (3.3V Logic)                  │ (IRLZ44N / AO3400)      │
                 │             └───────────┬─────────────┘
                 │                         │ Source (S)
               [ 10kΩ ]                    │
              Pulldown                     ▼
                 │                       System
                 ▼                       GND (Common Ground)
                GND
```

## 3. Emergency Stop Integration (Section 42)
* Dual-contact emergency push-lock button:
  - **Pole 1 (High Power):** Directly breaks the 12V line feeding all 5 MOSFET drain loads. Physically guarantees motors cannot turn, regardless of software state.
  - **Pole 2 (Signal Sense):** Connects to ESP32 GPIO 36 with an internal pull-up resistor. When button is pressed, signal pulls LOW to trigger immediate interrupt and state transition to `STATE_SAFE_MODE`.

## 4. Sanitizer Chemical & Tubing Compatibility (Section 94)
* **Fluid Material Requirements:**
  - 70%-75% Isopropyl / Ethyl Alcohol + Glycerin + Hydrogen Peroxide.
  - Pump head: Polypropylene (PP) or PTFE. Avoid ABS and PVC (susceptible to alcohol degradation).
  - Tubing: Medical-grade Silicone or Viton / PTFE tubing (food & pharma grade).
  - Seals: EPDM or Viton (do not use Buna-N / Nitrile with high alcohol concentrations).
