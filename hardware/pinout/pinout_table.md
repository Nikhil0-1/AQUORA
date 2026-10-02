# AQUORA Hardware Pinout Reference Table

## System 1 — Payment Receiving Terminal (Elecrow CrowPanel 7.0" ESP32-S3 HMI)
| PIN | COMPONENT | PURPOSE | INPUT/OUTPUT | ACTIVE LEVEL | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GPIO 40 | RGB LCD ST7262 | Data Enable (DE) | Output | HIGH | Parallel 16-bit display |
| GPIO 41 | RGB LCD ST7262 | Vertical Sync (VSYNC) | Output | LOW | Frame sync pulse |
| GPIO 39 | RGB LCD ST7262 | Horizontal Sync (HSYNC) | Output | LOW | Line sync pulse |
| GPIO 42 | RGB LCD ST7262 | Pixel Clock (PCLK) | Output | 16MHz Clock | PLL160M clock source |
| GPIO 45 | RGB LCD ST7262 | Red Bit 0 (R0) | Output | HIGH | 16-bit 565 format |
| GPIO 48 | RGB LCD ST7262 | Red Bit 1 (R1) | Output | HIGH | 16-bit 565 format |
| GPIO 47 | RGB LCD ST7262 | Red Bit 2 (R2) | Output | HIGH | 16-bit 565 format |
| GPIO 21 | RGB LCD ST7262 | Red Bit 3 (R3) | Output | HIGH | 16-bit 565 format |
| GPIO 14 | RGB LCD ST7262 | Red Bit 4 (R4) | Output | HIGH | 16-bit 565 format |
| GPIO 5  | RGB LCD ST7262 | Green Bit 0 (G0) | Output | HIGH | 16-bit 565 format |
| GPIO 6  | RGB LCD ST7262 | Green Bit 1 (G1) | Output | HIGH | 16-bit 565 format |
| GPIO 7  | RGB LCD ST7262 | Green Bit 2 (G2) | Output | HIGH | 16-bit 565 format |
| GPIO 15 | RGB LCD ST7262 | Green Bit 3 (G3) | Output | HIGH | 16-bit 565 format |
| GPIO 16 | RGB LCD ST7262 | Green Bit 4 (G4) | Output | HIGH | 16-bit 565 format |
| GPIO 4  | RGB LCD ST7262 | Green Bit 5 (G5) | Output | HIGH | 16-bit 565 format |
| GPIO 8  | RGB LCD ST7262 | Blue Bit 0 (B0) | Output | HIGH | 16-bit 565 format |
| GPIO 3  | RGB LCD ST7262 | Blue Bit 1 (B1) | Output | HIGH | 16-bit 565 format |
| GPIO 46 | RGB LCD ST7262 | Blue Bit 2 (B2) | Output | HIGH | 16-bit 565 format |
| GPIO 9  | RGB LCD ST7262 | Blue Bit 3 (B3) | Output | HIGH | 16-bit 565 format |
| GPIO 1  | RGB LCD ST7262 | Blue Bit 4 (B4) | Output | HIGH | 16-bit 565 format |
| GPIO 2  | Backlight Driver | Backlight Brightness | Output (PWM) | Duty 0-255 | 5kHz PWM channel |
| GPIO 19 | GT911 Touch | I2C SDA | In/Out | Open Drain | 400kHz I2C Bus |
| GPIO 20 | GT911 Touch | I2C SCL | Output | Open Drain | 400kHz I2C Bus |
| GPIO 38 | GT911 Touch | Touch Reset | Output | LOW | Hardware reset |
| GPIO 43 | Thermal Printer | UART1 TX | Output | 3.3V Logic | 9600 Baud ESC/POS |
| GPIO 44 | Thermal Printer | UART1 RX | Input | 3.3V Logic | 9600 Baud ESC/POS |

---

## System 2 — Sanitizer Dispensing Machine (ESP32 Industrial Control)
| PIN | COMPONENT | PURPOSE | INPUT/OUTPUT | ACTIVE LEVEL | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GPIO 25 | MOSFET Driver 1 | Pump 1 Gate (Classic) | Output | HIGH | 10kΩ pulldown, 100Ω gate |
| GPIO 26 | MOSFET Driver 2 | Pump 2 Gate (Aloe Vera)| Output | HIGH | 10kΩ pulldown, 100Ω gate |
| GPIO 27 | MOSFET Driver 3 | Pump 3 Gate (Herbal) | Output | HIGH | 10kΩ pulldown, 100Ω gate |
| GPIO 14 | MOSFET Driver 4 | Pump 4 Gate (Premium)| Output | HIGH | 10kΩ pulldown, 100Ω gate |
| GPIO 12 | MOSFET Driver 5 | Pump 5 Gate (Family) | Output | HIGH | 10kΩ pulldown, 100Ω gate |
| GPIO 34 | Flow Sensor 1 | Pulse Count Channel 1 | Input (Interrupt) | RISING | External 4.7kΩ pullup |
| GPIO 35 | Flow Sensor 2 | Pulse Count Channel 2 | Input (Interrupt) | RISING | External 4.7kΩ pullup |
| GPIO 32 | Flow Sensor 3 | Pulse Count Channel 3 | Input (Interrupt) | RISING | External 4.7kΩ pullup |
| GPIO 33 | Flow Sensor 4 | Pulse Count Channel 4 | Input (Interrupt) | RISING | External 4.7kΩ pullup |
| GPIO 39 | Flow Sensor 5 | Pulse Count Channel 5 | Input (Interrupt) | RISING | External 4.7kΩ pullup |
| GPIO 36 | Emergency Stop | Hardware E-Stop Sensor | Input (Pullup) | LOW | Latched NC contact loop |
| GPIO 2  | Status LED | System Heartbeat LED | Output | HIGH | Flashes during idle/dispense |
