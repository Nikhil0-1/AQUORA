#ifndef AQUORA_BOARD_CONFIG_H
#define AQUORA_BOARD_CONFIG_H

#include <stdint.h>

// ==============================================================================
// AQUORA Board Configuration — Elecrow CrowPanel 7.0" ESP32-S3 HMI
// ==============================================================================

#define BOARD_NAME              "Elecrow CrowPanel 7.0 ESP32-S3 HMI"
#define BOARD_MCU               "ESP32-S3"
#define BOARD_FLASH_SIZE_MB     16
#define BOARD_PSRAM_SIZE_MB     8

// Display Resolution
#define LCD_H_RES               800
#define LCD_V_RES               480

// ST7262 RGB Panel Timings
#define LCD_PIXEL_CLOCK_HZ      (16 * 1000 * 1000)
#define LCD_HSYNC_PULSE_WIDTH   4
#define LCD_HSYNC_BACK_PORCH    8
#define LCD_HSYNC_FRONT_PORCH   8
#define LCD_VSYNC_PULSE_WIDTH   4
#define LCD_VSYNC_BACK_PORCH    8
#define LCD_VSYNC_FRONT_PORCH   8

// LVGL Buffer Configuration (Allocated in Octal PSRAM)
#define LVGL_BUFFER_LINES       40
#define LVGL_BUFFER_SIZE        (LCD_H_RES * LVGL_BUFFER_LINES)

// Touch Controller Configuration
#define TOUCH_I2C_PORT          0
#define TOUCH_I2C_FREQ_HZ       400000
#define TOUCH_GT911_I2C_ADDR    0x5D // Default 0x5D (or 0x14)

#endif // AQUORA_BOARD_CONFIG_H
