#include "watchdog_manager.h"
#include "logger.h"

static const char* TAG = "Watchdog";

void WatchdogManager::init(uint32_t timeoutSeconds) {
    Logger::info(TAG, "Initializing hardware task watchdog (%u seconds)", timeoutSeconds);
    esp_task_wdt_init(timeoutSeconds, true);
    esp_task_wdt_add(NULL); // Current loop task
}

void WatchdogManager::feed() {
    esp_task_wdt_reset();
}
