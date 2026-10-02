#include "emergency_stop.h"
#include "../include/pins.h"
#include "logger.h"

static const char* TAG = "EStop";
volatile bool EmergencyStop::triggered = false;

void IRAM_ATTR EmergencyStop::isrHandler() {
    triggered = true;
}

void EmergencyStop::init() {
    pinMode(ESTOP_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(ESTOP_PIN), isrHandler, FALLING);

    // Initial check at boot
    if (digitalPinRead(ESTOP_PIN) == LOW) {
        triggered = true;
        Logger::error(TAG, "EMERGENCY STOP BUTTON IS CURRENTLY DEPRESSED AT BOOT!");
    } else {
        Logger::info(TAG, "Hardware Emergency Stop initialized on GPIO %d (Active LOW)", ESTOP_PIN);
    }
}

bool EmergencyStop::isTriggered() {
    if (digitalPinRead(ESTOP_PIN) == LOW) {
        triggered = true;
    }
    return triggered;
}

void EmergencyStop::resetTrigger() {
    if (digitalPinRead(ESTOP_PIN) == HIGH) {
        triggered = false;
        Logger::info(TAG, "Emergency Stop manually reset after verification");
    } else {
        Logger::warn(TAG, "Cannot reset Emergency Stop: Physical switch is still active!");
    }
}
