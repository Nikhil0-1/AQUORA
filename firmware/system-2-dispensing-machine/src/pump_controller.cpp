#include "pump_controller.h"
#include "../include/pins.h"
#include "logger.h"

static const char* TAG = "PumpCtrl";

const uint8_t PumpController::PUMP_PINS[5] = {
    PUMP_1_PIN, PUMP_2_PIN, PUMP_3_PIN, PUMP_4_PIN, PUMP_5_PIN
};

bool PumpController::pumpStates[5] = { false, false, false, false, false };

void PumpController::init() {
    Logger::info(TAG, "Configuring pump output GPIOs (25, 26, 27, 14, 12)");
    for (int i = 0; i < 5; i++) {
        pinMode(PUMP_PINS[i], OUTPUT);
        digitalWrite(PUMP_PINS[i], LOW); // Always default to OFF
        pumpStates[i] = false;
    }
    stopAll();
    Logger::info(TAG, "Boot Safety: All 5 pumps confirmed OFF");
}

void PumpController::stopAll() {
    for (int i = 0; i < 5; i++) {
        digitalWrite(PUMP_PINS[i], LOW);
        pumpStates[i] = false;
    }
}

bool PumpController::verifyInterlock() {
    int activeCount = 0;
    for (int i = 0; i < 5; i++) {
        if (pumpStates[i] || digitalRead(PUMP_PINS[i]) == HIGH) {
            activeCount++;
        }
    }
    return (activeCount <= 1);
}

bool PumpController::startPump(int channel) {
    if (channel < 1 || channel > 5) {
        Logger::error(TAG, "Invalid pump channel: %d", channel);
        return false;
    }

    // Section 32: SINGLE-PUMP INTERLOCK
    // Step 1: Force ALL pumps OFF first
    stopAll();

    // Step 2: Activate only the target channel
    int idx = channel - 1;
    digitalWrite(PUMP_PINS[idx], HIGH);
    pumpStates[idx] = true;

    // Step 3: Verify hardware interlock
    if (!verifyInterlock()) {
        Logger::error(TAG, "INTERLOCK VIOLATION DETECTED! Emergency stopping all pumps!");
        stopAll();
        return false;
    }

    Logger::info(TAG, "PUMP %d ENERGIZED (GPIO %d HIGH)", channel, PUMP_PINS[idx]);
    return true;
}

void PumpController::stopPump(int channel) {
    if (channel >= 1 && channel <= 5) {
        int idx = channel - 1;
        digitalWrite(PUMP_PINS[idx], LOW);
        pumpStates[idx] = false;
        Logger::info(TAG, "PUMP %d DE-ENERGIZED (GPIO %d LOW)", channel, PUMP_PINS[idx]);
    }
}

bool PumpController::isPumpActive(int channel) {
    if (channel >= 1 && channel <= 5) {
        return pumpStates[channel - 1];
    }
    return false;
}

int PumpController::getActiveChannel() {
    for (int i = 0; i < 5; i++) {
        if (pumpStates[i]) return (i + 1);
    }
    return 0; // None active
}
