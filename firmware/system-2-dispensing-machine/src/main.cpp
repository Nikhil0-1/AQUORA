#include <Arduino.h>
#include "logger.h"
#include "storage_manager.h"
#include "watchdog_manager.h"
#include "emergency_stop.h"
#include "pump_controller.h"
#include "flow_sensor.h"
#include "calibration.h"
#include "safety_manager.h"
#include "inventory_manager.h"
#include "wifi_manager.h"
#include "authentication.h"
#include "job_manager.h"
#include "dispensing_controller.h"
#include "telemetry.h"
#include "machine_state.h"
#include "../include/machine_config.h"

static const char* TAG = "Main";
static unsigned long lastJobPoll = 0;

void setup() {
    // 1. Serial Logger
    Logger::init(SERIAL_BAUD_RATE);
    Logger::info(TAG, "================================================");
    Logger::info(TAG, "  AQUORA SYSTEM 2 — DISPENSING MACHINE FIRMWARE ");
    Logger::info(TAG, "  Target: ESP32 (5 DC Pumps, 5 Flow Sensors)    ");
    Logger::info(TAG, "================================================");

    // 2. Hardware Watchdog
    WatchdogManager::init(WATCHDOG_TIMEOUT_SECONDS);

    // 3. Absolute Boot Safety: ALL PUMPS OFF
    PumpController::init();

    // 4. Emergency Stop & Storage
    EmergencyStop::init();
    StorageManager::init();
    MachineState::init();

    // 5. Hardware Self-Test (Section 72)
    if (!SafetyManager::runStartupSelfTest()) {
        Logger::error(TAG, "STARTUP SELF TEST FAILED! System entering SAFE_MODE.");
        MachineState::setState(STATE_SAFE_MODE);
    }

    // 6. Subsystem Initialization
    FlowSensorManager::init();
    CalibrationManager::init();
    InventoryManager::init();
    DispensingController::init();
    TelemetryManager::init();

    // 7. Non-blocking Wi-Fi
    MachineState::setState(STATE_CONNECTING_WIFI);
    WifiManager::init();

    Logger::info(TAG, "System 2 initialization sequence completed.");
}

void loop() {
    // Always feed hardware watchdog
    WatchdogManager::feed();

    // Emergency Stop physical interrupt check
    if (EmergencyStop::isTriggered()) {
        PumpController::stopAll();
        if (MachineState::getState() != STATE_SAFE_MODE) {
            Logger::error(TAG, "EMERGENCY STOP TRIGGERED! Shutting down all pumps.");
            MachineState::setState(STATE_SAFE_MODE);
        }
    }

    // Update non-blocking network & telemetry
    WifiManager::update();
    TelemetryManager::update();

    // State actions
    DispenserState state = MachineState::getState();

    switch (state) {
        case STATE_CONNECTING_WIFI:
            if (WifiManager::isConnected()) {
                MachineState::setState(STATE_AUTHENTICATING);
            }
            break;

        case STATE_AUTHENTICATING:
            if (MachineAuth::authenticate()) {
                MachineState::setState(STATE_IDLE);
                TelemetryManager::sendHeartbeat();
            } else {
                Logger::warn(TAG, "Authentication retry in 5 seconds...");
                delay(5000);
            }
            break;

        case STATE_IDLE:
        case STATE_WAITING_FOR_JOB:
            if (millis() - lastJobPoll >= JOB_POLL_INTERVAL_MS) {
                lastJobPoll = millis();

                DispenseJobPacket job;
                if (JobManager::fetchNextJob(job)) {
                    MachineState::setState(STATE_VALIDATING_JOB);

                    if (JobManager::validateJob(job)) {
                        Logger::info(TAG, "Job %s validated successfully. Dispatching to pump controller.", job.jobId.c_str());
                        DispensingController::startJob(job);
                    } else {
                        Logger::error(TAG, "Job %s rejected: %s", job.jobId.c_str(), job.rejectionReason.c_str());
                        JobManager::sendJobFail(job.jobId, job.channel, 0.0f, job.rejectionReason.c_str(), "Job rejected by safety validator");
                        MachineState::setState(STATE_IDLE);
                    }
                }
            }
            break;

        case STATE_DISPENSING:
            // High-frequency sensor & interlock updates
            DispensingController::update();
            break;

        case STATE_SAFE_MODE:
            // Hold all outputs in hard low state
            PumpController::stopAll();
            // Can be manually cleared if E-Stop released
            if (!EmergencyStop::isTriggered()) {
                Logger::info(TAG, "E-Stop cleared, returning to IDLE state");
                EmergencyStop::resetTrigger();
                MachineState::setState(STATE_IDLE);
            }
            break;

        default:
            break;
    }
}
