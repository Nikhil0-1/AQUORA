# AQUORA Hardware Wiring Guide

## 1. 230V AC Mains & 12V Power Distribution
* **Safety First:** Mains wiring must be performed inside a protective enclosure with double-pole isolation.
* **Mains Input:** Line (L), Neutral (N), and Protective Earth (PE).
* **Fusing:** 3A fast-acting glass fuse on Line input.
* **12V SMPS:** 12V DC, 10A rated industrial power supply (MeanWell LRS-150-12 or equivalent).
* **Emergency Stop Wiring:**
  - Pole 1 (NC): Placed in series with the +12V positive rail to the DC pumps.
  - Pole 2 (NC): Connected between ESP32 GPIO 36 and GND for software detection.

## 2. DC Pumps & MOSFET Driver Board
* **Pumps 1-5:** 12V DC food/sanitizer rated diaphragm or peristaltic pumps.
* **MOSFET Driver:**
  - Logic-level N-Channel MOSFET (IRLZ44N or AO3400 SMD).
  - 100Ω gate resistor in series from ESP32 GPIO (25, 26, 27, 14, 12).
  - 10kΩ pull-down resistor from Gate to Ground to prevent floating activation during boot.
  - 1N5819 Schottky diode connected in reverse across the + and - terminals of each pump motor to absorb flyback voltage spikes.

## 3. Flow Sensors
* **Sensors 1-5:** Hall-effect turbine flow sensors (YF-S401 or equivalent food-grade mini turbine).
* **Pin Connections:**
  - VCC: 5V (or 3.3V depending on model)
  - GND: System GND
  - Signal: External 4.7kΩ pull-up to 3.3V, connected to GPIO 34, 35, 32, 33, 39.

## 4. System 1 Terminal Display Board
* **Elecrow CrowPanel 7.0-inch ESP32-S3 HMI:**
  - Powered via dedicated 5V 2.5A USB-C or screw terminal.
  - Optional Thermal Printer connected via UART1 (TX: GPIO 43, RX: GPIO 44, Baud 9600).
