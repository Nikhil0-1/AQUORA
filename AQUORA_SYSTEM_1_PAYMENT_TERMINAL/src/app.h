#ifndef APP_H
#define APP_H

#include <Arduino.h>

class Application {
public:
    static void setup();
    static void loop();

private:
    static unsigned long lastSessionCheck;
    static unsigned long lastHeartbeat;
};

#endif // APP_H
