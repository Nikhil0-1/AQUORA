#ifndef PUMP_CONTROLLER_H
#define PUMP_CONTROLLER_H

#include <Arduino.h>

class PumpController {
public:
    static void init();
    static void stopAll();
    static bool startPump(int channel);
    static void stopPump(int channel);
    static bool isPumpActive(int channel);
    static int getActiveChannel();
    static bool verifyInterlock();

private:
    static const uint8_t PUMP_PINS[5];
    static bool pumpStates[5];
};

#endif // PUMP_CONTROLLER_H
