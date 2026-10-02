 #include <Arduino.h>
#include "version.h"
#include "config.h"
#include "pins.h"
#include "include/board_config.h"
#include "include/safety_limits.h"
#include "include/machine_config.h"

// Subsystem headers
#include "src/logger.h"
#include "src/storage_manager.h"
#include "src/watchdog_manager.h"
#include "src/emergency_stop.h"
#include "src/pump_controller.h"
#include "src/flow_sensor.h"
#include "src/calibration.h"
#include "src/safety_manager.h"
#include "src/inventory_manager.h"
#include "src/wifi_manager.h"
#include "src/api_client.h"
#include "src/authentication.h"
#include "src/job_manager.h"
#include "src/dispensing_controller.h"
#include "src/telemetry.h"
#include "src/machine_state.h"

static const char* TAG = "Main";
static unsigned long lastJobPoll = 0;

void setup() {
    // 1. Serial Logger with required startup banner (Requirement 59)
    Serial.begin(115200);
    delay(200);
    Serial.println("\nAQUORA SYSTEM 2");
    Serial.println("Dispensing Machine");
    Serial.print("Firmware: ");
    Serial.println(AQUORA_FIRMWARE_VERSION);
    Serial.println();

    // 2. Absolute Boot Safety: ALL PUMPS OFF BEFORE ANY OTHER INITIALIZATION (Requirement 25)
    PumpController::init();
    Serial.println("All pumps OFF");

    // 3. Flow Sensors
    Serial.println("Initializing flow sensors...");
    FlowSensorManager::init();

    // 4. Emergency Stop
    EmergencyStop::init();
    if (!EmergencyStop::isTriggered()) {
        Serial.println("Emergency stop: OK");
    } else {
        Serial.println("Emergency stop: TRIGGERED (Active LOW switch open)");
    }

    // 5. Hardware Watchdog
    WatchdogManager::init(WATCHDOG_TIMEOUT_SEC);

    // 6. Persistent NVS Storage & State
    StorageManager::init();
    MachineState::init();

    // 7. Hardware Self-Test
    if (!SafetyManager::runStartupSelfTest()) {
        Logger::error(TAG, "STARTUP SELF TEST FAILED! System entering SAFE_MODE.");
        MachineState::setState(STATE_SAFE_MODE);
    }

    // 8. Other Subsystems
    CalibrationManager::init();
    InventoryManager::init();
    DispensingController::init();
    TelemetryManager::init();
    ApiClient::init();

    // 9. Wi-Fi Initialization
    Serial.println("Connecting WiFi...");
    MachineState::setState(STATE_CONNECTING_WIFI);
    WifiManager::init();

    Logger::info(TAG, "System 2 boot sequence completed.");
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

    // State machine execution
    DispenserState state = MachineState::getState();

    switch (state) {
        case STATE_CONNECTING_WIFI:
            if (WifiManager::isConnected()) {
                Serial.println("Authenticating machine...");
                MachineState::setState(STATE_AUTHENTICATING);
            }
            break;

        case STATE_AUTHENTICATING:
            if (MachineAuth::authenticate()) {
                Serial.println("READY\n");
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
            DispensingController::update();
            break;

        case STATE_SAFE_MODE:
            PumpController::stopAll();
            if (!EmergencyStop::isTriggered()) {
                Logger::info(TAG, "E-Stop cleared, returning to IDLE state");
                EmergencyStop::resetTrigger();
                MachineState::setState(STATE_IDLE);
            }
            break;

        case STATE_ERROR:
            PumpController::stopAll();
            break;

        default:
            break;
    }

    yield();
}
