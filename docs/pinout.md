# AQUORA Pinout Reference Documentation

## SYSTEM 1: PAYMENT RECEIVING TERMINAL
**Hardware:** Elecrow CrowPanel 7.0" ESP32-S3 HMI (800x480 RGB LCD, GT911 Touch)

| Pin | Function | Direction | Level | Notes |
| :--- | :--- | :--- | :--- | :--- |
| GPIO 40 | LCD DE | Output | High | RGB Data Enable |
| GPIO 41 | LCD VSYNC | Output | Low | Frame Sync |
| GPIO 39 | LCD HSYNC | Output | Low | Line Sync |
| GPIO 42 | LCD PCLK | Output | Clock | 16MHz Pixel Clock |
| GPIO 45, 48, 47, 21, 14 | LCD Red (R0-R4) | Output | High | 5-bit Red Bus |
| GPIO 5, 6, 7, 15, 16, 4 | LCD Green (G0-G5) | Output | High | 6-bit Green Bus |
| GPIO 8, 3, 46, 9, 1 | LCD Blue (B0-B4) | Output | High | 5-bit Blue Bus |
| GPIO 2 | LCD Backlight | Output | PWM | 5kHz Duty Control |
| GPIO 19 | Touch SDA | In/Out | OD | GT911 I2C Data |
| GPIO 20 | Touch SCL | Output | OD | GT911 I2C Clock |
| GPIO 38 | Touch Reset | Output | Low | GT911 Hardware Reset |
| GPIO 43 | Printer TX | Output | 3.3V | UART1 TX (ESC/POS) |
| GPIO 44 | Printer RX | Input | 3.3V | UART1 RX |

---

## SYSTEM 2: SANITIZER DISPENSING CONTROLLER
**Hardware:** ESP32-WROOM-32D / Industrial Controller

| Pin | Function | Direction | Active Level | Electrical Protection |
| :--- | :--- | :--- | :--- | :--- |
| GPIO 25 | Pump 1 (Classic) | Output | HIGH | 100Ω gate, 10kΩ pulldown, 1N5819 |
| GPIO 26 | Pump 2 (Aloe Vera) | Output | HIGH | 100Ω gate, 10kΩ pulldown, 1N5819 |
| GPIO 27 | Pump 3 (Herbal) | Output | HIGH | 100Ω gate, 10kΩ pulldown, 1N5819 |
| GPIO 14 | Pump 4 (Premium) | Output | HIGH | 100Ω gate, 10kΩ pulldown, 1N5819 |
| GPIO 12 | Pump 5 (Family) | Output | HIGH | 100Ω gate, 10kΩ pulldown, 1N5819 |
| GPIO 34 | Flow 1 (Pulse) | Input (ISR) | RISING | External 4.7kΩ pullup to 3.3V |
| GPIO 35 | Flow 2 (Pulse) | Input (ISR) | RISING | External 4.7kΩ pullup to 3.3V |
| GPIO 32 | Flow 3 (Pulse) | Input (ISR) | RISING | External 4.7kΩ pullup to 3.3V |
| GPIO 33 | Flow 4 (Pulse) | Input (ISR) | RISING | External 4.7kΩ pullup to 3.3V |
| GPIO 39 | Flow 5 (Pulse) | Input (ISR) | RISING | External 4.7kΩ pullup to 3.3V |
| GPIO 36 | Emergency Stop | Input (ISR) | LOW | Internal pullup, external NC loop |
| GPIO 2  | Heartbeat LED | Output | HIGH | Active indicator |
