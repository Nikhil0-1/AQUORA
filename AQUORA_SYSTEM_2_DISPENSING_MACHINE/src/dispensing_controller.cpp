#include "dispensing_controller.h"
#include "pump_controller.h"
#include "flow_sensor.h"
#include "safety_manager.h"
#include "inventory_manager.h"
#include "storage_manager.h"
#include "machine_state.h"
#include "logger.h"

static const char* TAG = "DispenseCtrl";

DispensePhase DispensingController::currentPhase = PHASE_IDLE;
DispenseJobPacket DispensingController::activeJob;
unsigned long DispensingController::pumpStartTime = 0;
unsigned long DispensingController::lastPulseCheckTime = 0;
unsigned long DispensingController::lastProgressReportTime = 0;
uint32_t DispensingController::lastPulseCount = 0;

void DispensingController::init() {
    currentPhase = PHASE_IDLE;
    PumpController::stopAll();
    Logger::info(TAG, "Dispensing Controller initialized in IDLE phase");
}

bool DispensingController::startJob(const DispenseJobPacket& job) {
    if (currentPhase != PHASE_IDLE) {
        Logger::error(TAG, "Cannot start job %s: Machine is currently busy!", job.jobId.c_str());
        return false;
    }

    activeJob = job;

    // 1. Pre-dispense safety check
    SafetyCheckResult safety = SafetyManager::performPreDispenseCheck(job.channel, job.targetVolumeMl);
    if (safety != SAFETY_OK) {
        JobManager::sendJobFail(job.jobId, job.channel, 0.0f, "SAFETY_CHECK_FAILED", "Safety constraints not met");
        return false;
    }

    // 2. Inventory check
    if (!InventoryManager::hasSufficientVolume(job.channel, (float)job.targetVolumeMl)) {
        JobManager::sendJobFail(job.jobId, job.channel, 0.0f, "TANK_EMPTY", "Insufficient liquid in sanitizer tank");
        return false;
    }

    // 3. Acknowledge acceptance
    JobManager::sendJobAccept(job.jobId);

    // 4. Reset sensor counter for this channel
    FlowSensorManager::resetCounter(job.channel);
    lastPulseCount = 0;

    // 5. Start Pump
    if (!PumpController::startPump(job.channel)) {
        JobManager::sendJobFail(job.jobId, job.channel, 0.0f, "PUMP_START_FAILED", "Failed to energize pump driver");
        return false;
    }

    pumpStartTime = millis();
    lastPulseCheckTime = millis();
    lastProgressReportTime = millis();
    currentPhase = PHASE_DISPENSING;
    MachineState::setState(STATE_DISPENSING);

    Logger::info(TAG, "DISPENSING COMMENCED for Job %s on Channel %d (Target: %d ml)",
        job.jobId.c_str(), job.channel, job.targetVolumeMl);
    return true;
}

void DispensingController::update() {
    if (currentPhase != PHASE_DISPENSING) return;

    int ch = activeJob.channel;
    uint32_t currentPulses = FlowSensorManager::getPulseCount(ch);
    float currentMl = FlowSensorManager::getVolumeMl(ch);
    float flowRate = FlowSensorManager::getFlowRateMlPerSec(ch);

    // Check if new pulses arrived
    if (currentPulses > lastPulseCount) {
        lastPulseCount = currentPulses;
        lastPulseCheckTime = millis(); // Reset no-flow watchdog
    }

    // Verify runtime safety rules (Max runtime, No flow timeout, Emergency Stop)
    if (!SafetyManager::verifyDispensingRuntime(pumpStartTime, lastPulseCheckTime)) {
        abortCurrentJob("SAFETY_ERROR", "Safety violation during dispensing cycle");
        return;
    }

    int percentage = (int)((currentMl / (float)activeJob.targetVolumeMl) * 100.0f);
    if (percentage > 100) percentage = 100;

    // Periodic telemetry progress report (every 500ms)
    if (millis() - lastProgressReportTime >= 500) {
        lastProgressReportTime = millis();
        JobManager::sendJobProgress(
            activeJob.jobId,
            ch,
            activeJob.targetVolumeMl,
            (int)currentMl,
            flowRate,
            percentage
        );
        Logger::info(TAG, "Dispensing: %.1f / %d ml (%d%%) [Pulses: %u, Rate: %.1f ml/s]",
            currentMl, activeJob.targetVolumeMl, percentage, currentPulses, flowRate);
    }

    // Target volume achieved!
    if (currentMl >= (float)activeJob.targetVolumeMl) {
        // Step 1: Immediately de-energize pump
        PumpController::stopPump(ch);

        // Step 2: Settle time for liquid column & measure final pulses
        delay(100);
        uint32_t finalPulses = FlowSensorManager::getPulseCount(ch);
        float finalVolumeMl = FlowSensorManager::getVolumeMl(ch);
        unsigned long duration = millis() - pumpStartTime;

        // Step 3: Verify pump is OFF
        if (PumpController::isPumpActive(ch)) {
            PumpController::stopAll();
        }

        // Step 4: Persist processed job in NVS to prevent any duplicate execution
        StorageManager::markJobProcessed(activeJob.jobId);

        // Step 5: Deduct from local estimated inventory
        InventoryManager::deductVolume(ch, finalVolumeMl);

        // Step 6: Transmit authoritative completion report to backend
        JobManager::sendJobComplete(activeJob.jobId, ch, finalVolumeMl, finalPulses, duration);

        Logger::info(TAG, "JOB %s COMPLETED SUCCESSFULLY! Final: %.1f ml in %lu ms (%u pulses)",
            activeJob.jobId.c_str(), finalVolumeMl, duration, finalPulses);

        currentPhase = PHASE_IDLE;
        MachineState::setState(STATE_IDLE);
    }
}

void DispensingController::abortCurrentJob(const char* errorCode, const char* reason) {
    PumpController::stopAll();
    float partialMl = FlowSensorManager::getVolumeMl(activeJob.channel);
    JobManager::sendJobFail(activeJob.jobId, activeJob.channel, partialMl, errorCode, reason);
    currentPhase = PHASE_IDLE;
    MachineState::setState(STATE_ERROR);
    Logger::error(TAG, "Aborted Job %s: %s (%s)", activeJob.jobId.c_str(), errorCode, reason);
}

bool DispensingController::isBusy() {
    return (currentPhase != PHASE_IDLE);
}
