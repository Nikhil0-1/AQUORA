#ifndef DISPENSING_CONTROLLER_H
#define DISPENSING_CONTROLLER_H

#include <Arduino.h>
#include "job_manager.h"

enum DispensePhase {
    PHASE_IDLE = 0,
    PHASE_STARTING,
    PHASE_DISPENSING,
    PHASE_COMPLETING,
    PHASE_ABORTED
};

class DispensingController {
public:
    static void init();
    static bool startJob(const DispenseJobPacket& job);
    static void update();
    static bool isBusy();
    static void abortCurrentJob(const char* errorCode, const char* reason);

private:
    static DispensePhase currentPhase;
    static DispenseJobPacket activeJob;
    static unsigned long pumpStartTime;
    static unsigned long lastPulseCheckTime;
    static unsigned long lastProgressReportTime;
    static uint32_t lastPulseCount;
};

#endif // DISPENSING_CONTROLLER_H
