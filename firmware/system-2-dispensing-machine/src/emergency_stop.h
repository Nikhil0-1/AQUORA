#ifndef EMERGENCY_STOP_H
#define EMERGENCY_STOP_H

#include <Arduino.h>

class EmergencyStop {
public:
    static void init();
    static bool isTriggered();
    static void resetTrigger();

private:
    static volatile bool triggered;
    static void IRAM_ATTR isrHandler();
};

#endif // EMERGENCY_STOP_H
