#include "safety_manager.h"
#include "emergency_stop.h"
#include "pump_controller.h"
#include "calibration.h"
#include "machine_state.h"
#include "logger.h"

static const char* TAG = "Safety";

void SafetyManager::init() {
    Logger::info(TAG, "Initializing hardware safety subsystem");
}

bool SafetyManager::runStartupSelfTest() {
    Logger::info(TAG, "Running Startup Self-Test (Section 72)...");

    // 1. Check Emergency Stop Switch
    if (EmergencyStop::isTriggered()) {
        Logger::error(TAG, "Self-Test FAILED: Hardware E-Stop switch is pressed!");
        return false;
    }

    // 2. Check Pump Driver Gates: MUST ALL BE LOW
    PumpController::stopAll();
    if (!PumpController::verifyInterlock()) {
        Logger::error(TAG, "Self-Test FAILED: Pump driver interlock line leakage detected!");
        return false;
    }

    // 3. Verify Calibration Tables exist
    for (int ch = 1; ch <= 5; ch++) {
        if (!CalibrationManager::hasValidCalibration(ch)) {
            Logger::warn(TAG, "Channel %d calibration missing or outside nominal limits", ch);
        }
    }

    Logger::info(TAG, "Startup Self-Test PASSED. All safety constraints nominal.");
    return true;
}

SafetyCheckResult SafetyManager::performPreDispenseCheck(int channel, int volumeMl) {
    // 1. Hardware E-Stop Check
    if (EmergencyStop::isTriggered()) {
        Logger::error(TAG, "Pre-Dispense Check FAILED: E-STOP ACTIVE!");
        return SAFETY_ESTOP_ACTIVE;
    }

    // 2. Channel validation
    if (channel < 1 || channel > 5) {
        Logger::error(TAG, "Pre-Dispense Check FAILED: Channel %d out of range (1-5)", channel);
        return SAFETY_INVALID_CHANNEL;
    }

    // 3. Volume validation
    if (volumeMl < MIN_SINGLE_DISPENSE_ML || volumeMl > MAX_SINGLE_DISPENSE_ML) {
        Logger::error(TAG, "Pre-Dispense Check FAILED: Volume %d ml out of limits [%d, %d]",
            volumeMl, MIN_SINGLE_DISPENSE_ML, MAX_SINGLE_DISPENSE_ML);
        return SAFETY_INVALID_VOLUME;
    }

    // 4. Calibration validation
    if (!CalibrationManager::hasValidCalibration(channel)) {
        Logger::error(TAG, "Pre-Dispense Check FAILED: No valid calibration for channel %d", channel);
        return SAFETY_NO_CALIBRATION;
    }

    // 5. Interlock verification
    if (!PumpController::verifyInterlock() || PumpController::getActiveChannel() != 0) {
        Logger::error(TAG, "Pre-Dispense Check FAILED: Pump interlock is busy or compromised!");
        return SAFETY_INTERLOCK_ERROR;
    }

    Logger::info(TAG, "Pre-Dispense Check PASSED for Channel %d (%d ml)", channel, volumeMl);
    return SAFETY_OK;
}

bool SafetyManager::verifyDispensingRuntime(unsigned long pumpStartTime, unsigned long lastPulseTime) {
    unsigned long now = millis();

    // Check 1: Pump Maximum Runtime Timeout (Section 40)
    if (now - pumpStartTime > MAX_PUMP_RUNTIME_MS) {
        Logger::error(TAG, "SAFETY VIOLATION: Maximum pump runtime (%lu ms) exceeded!", MAX_PUMP_RUNTIME_MS);
        abortAll("PUMP_TIMEOUT");
        return false;
    }

    // Check 2: No-Flow Detection Timeout (Section 39)
    if (now - lastPulseTime > NO_FLOW_TIMEOUT_MS) {
        Logger::error(TAG, "SAFETY VIOLATION: No flow detected for >%lu ms!", NO_FLOW_TIMEOUT_MS);
        abortAll("FLOW_ERROR");
        return false;
    }

    // Check 3: Emergency Stop Triggered During Operation (Section 42)
    if (EmergencyStop::isTriggered()) {
        Logger::error(TAG, "SAFETY VIOLATION: Emergency Stop triggered while dispensing!");
        abortAll("EMERGENCY_STOP");
        return false;
    }

    return true;
}

void SafetyManager::abortAll(const char* reason) {
    PumpController::stopAll();
    MachineState::setState(STATE_SAFE_MODE);
    Logger::error(TAG, "DISPENSING ABORTED! Reason: %s. Machine entered SAFE_MODE.", reason);
}
