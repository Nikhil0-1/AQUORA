#ifndef TOUCH_MANAGER_H
#define TOUCH_MANAGER_H

#include <Arduino.h>
#include <Wire.h>
#include <TAMC_GT911.h>

class TouchManager {
public:
    static bool init();
    static bool readTouch(int16_t* x, int16_t* y);

private:
    static TAMC_GT911 touch;
    static bool initialized;
};

#endif // TOUCH_MANAGER_H
