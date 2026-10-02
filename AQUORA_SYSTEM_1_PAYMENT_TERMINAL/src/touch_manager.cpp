#include "touch_manager.h"
#include "../include/pins.h"
#include "../include/board_config.h"
#include "logger.h"

static const char* TAG = "TouchMgr";

TAMC_GT911 TouchManager::touch(TOUCH_GT911_SDA, TOUCH_GT911_SCL, TOUCH_GT911_INT, TOUCH_GT911_RST, LCD_H_RES, LCD_V_RES);
bool TouchManager::initialized = false;

bool TouchManager::init() {
    Logger::info(TAG, "Initializing GT911 Capacitive Touch Controller (SDA:%d, SCL:%d, RST:%d)",
        TOUCH_GT911_SDA, TOUCH_GT911_SCL, TOUCH_GT911_RST);

    Wire.begin(TOUCH_GT911_SDA, TOUCH_GT911_SCL, TOUCH_I2C_FREQ_HZ);
    touch.begin();
    touch.setRotation(ROTATION_NORMAL);

    initialized = true;
    Logger::info(TAG, "GT911 touch initialized (800x480 coordinate space)");
    return true;
}

bool TouchManager::readTouch(int16_t* x, int16_t* y) {
    if (!initialized) return false;

    touch.read();
    if (touch.isTouched) {
        if (touch.touches > 0) {
            *x = touch.points[0].x;
            *y = touch.points[0].y;
            return true;
        }
    }
    return false;
}
