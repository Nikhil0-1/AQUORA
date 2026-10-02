#include "calibration.h"
#include "storage_manager.h"
#include "pump_controller.h"
#include "flow_sensor.h"
#include "logger.h"

static const char* TAG = "Calib";

void CalibrationManager::init() {
    Logger::info(TAG, "Initializing channel calibration profiles");
    for (int ch = 1; ch <= 5; ch++) {
        float factor = StorageManager::getCalibrationFactor(ch);
        Logger::info(TAG, "Channel %d calibration factor: %.2f pulses/ml", ch, factor);
    }
}

bool CalibrationManager::performTestDispense(int channel, uint32_t targetPulses) {
    if (channel < 1 || channel > 5) return false;

    Logger::info(TAG, "Starting calibration test pulse on Channel %d (target: %u pulses)", channel, targetPulses);
    FlowSensorManager::resetCounter(channel);

    if (!PumpController::startPump(channel)) {
        Logger::error(TAG, "Failed to start pump for calibration test");
        return false;
    }

    unsigned long startTime = millis();
    while (FlowSensorManager::getPulseCount(channel) < targetPulses) {
        if (millis() - startTime > 15000) { // 15s safety timeout
            PumpController::stopAll();
            Logger::error(TAG, "Calibration test timed out!");
            return false;
        }
        delay(10);
    }

    PumpController::stopPump(channel);
    Logger::info(TAG, "Calibration test pulses reached: %u", FlowSensorManager::getPulseCount(channel));
    return true;
}

float CalibrationManager::calculateFactor(uint32_t pulses, float actualMeasuredMl) {
    if (actualMeasuredMl <= 0.0f) return 0.0f;
    return (float)pulses / actualMeasuredMl;
}

bool CalibrationManager::applyAndSave(int channel, float newFactor) {
    if (channel < 1 || channel > 5 || newFactor <= 0.0f) return false;
    StorageManager::setCalibrationFactor(channel, newFactor);
    return true;
}

bool CalibrationManager::hasValidCalibration(int channel) {
    if (channel < 1 || channel > 5) return false;
    float factor = StorageManager::getCalibrationFactor(channel);
    return (factor > 1.0f && factor < 100.0f);
}
