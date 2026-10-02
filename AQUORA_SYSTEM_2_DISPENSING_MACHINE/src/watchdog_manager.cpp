#include "watchdog_manager.h"
#include "logger.h"

static const char* TAG = "Watchdog";

void WatchdogManager::init(uint32_t timeoutSeconds) {
    Logger::info(TAG, "Configuring ESP32 Task Watchdog (%u s)", timeoutSeconds);
    esp_task_wdt_init(timeoutSeconds, true);
    esp_task_wdt_add(NULL);
}

void WatchdogManager::feed() {
    esp_task_wdt_reset();
}
