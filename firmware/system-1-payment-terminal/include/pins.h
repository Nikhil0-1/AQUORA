#ifndef AQUORA_PINS_H
#define AQUORA_PINS_H

// ==============================================================================
// AQUORA System 1 — Payment Receiving Terminal Pin Definitions
// Hardware Reference: Elecrow CrowPanel 7.0-inch ESP32-S3 HMI (800x480 RGB LCD)
// ==============================================================================

// 1. Parallel 16-Bit RGB LCD Interface (ST7262 / Compatible)
#define LCD_PIN_DE       40
#define LCD_PIN_VSYNC    41
#define LCD_PIN_HSYNC    39
#define LCD_PIN_PCLK     42

// Red Bus (R0 - R4)
#define LCD_PIN_DATA_R0  45
#define LCD_PIN_DATA_R1  48
#define LCD_PIN_DATA_R2  47
#define LCD_PIN_DATA_R3  21
#define LCD_PIN_DATA_R4  14

// Green Bus (G0 - G5)
#define LCD_PIN_DATA_G0  5
#define LCD_PIN_DATA_G1  6
#define LCD_PIN_DATA_G2  7
#define LCD_PIN_DATA_G3  15
#define LCD_PIN_DATA_G4  16
#define LCD_PIN_DATA_G5  4

// Blue Bus (B0 - B4)
#define LCD_PIN_DATA_B0  8
#define LCD_PIN_DATA_B1  3
#define LCD_PIN_DATA_B2  46
#define LCD_PIN_DATA_B3  9
#define LCD_PIN_DATA_B4  1

// Backlight (PWM controllable)
#define LCD_PIN_BK_LIGHT 2

// 2. Capacitive Touch Interface (GT911 I2C)
#define TOUCH_GT911_SDA  19
#define TOUCH_GT911_SCL  20
#define TOUCH_GT911_INT  -1  // Polled or GPIO 18
#define TOUCH_GT911_RST  38

// 3. Optional Thermal Receipt Printer (UART1)
#define PRINTER_UART_TX  43
#define PRINTER_UART_RX  44

// 4. Status LED
#define STATUS_LED_PIN   -1

#endif // AQUORA_PINS_H
