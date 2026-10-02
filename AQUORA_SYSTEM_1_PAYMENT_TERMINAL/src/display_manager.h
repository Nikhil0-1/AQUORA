#ifndef DISPLAY_MANAGER_H
#define DISPLAY_MANAGER_H

#include <Arduino.h>
#include <esp_lcd_panel_rgb.h>
#include <esp_lcd_panel_ops.h>

class DisplayManager {
public:
    static bool init();
    static void setBrightness(uint8_t percentage);
    static esp_lcd_panel_handle_t getPanelHandle();
    static uint16_t* getFrameBuffer();

private:
    static esp_lcd_panel_handle_t panelHandle;
    static uint16_t* frameBuffer;
    static const uint8_t PWM_CHANNEL = 7;
    static const uint32_t PWM_FREQ = 5000;
    static const uint8_t PWM_RESOLUTION = 8;
};

#endif // DISPLAY_MANAGER_H
