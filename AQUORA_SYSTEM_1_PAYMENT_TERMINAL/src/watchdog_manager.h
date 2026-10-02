#ifndef WATCHDOG_MANAGER_H
#define WATCHDOG_MANAGER_H

#include <Arduino.h>
#include <esp_task_wdt.h>

class WatchdogManager {
public:
    static void init(uint32_t timeoutSeconds = 10);
    static void feed();
};

#endif // WATCHDOG_MANAGER_H
