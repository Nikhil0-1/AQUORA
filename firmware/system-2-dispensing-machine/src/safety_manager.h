#ifndef SAFETY_MANAGER_H
#define SAFETY_MANAGER_H

#include <Arduino.h>
#include "../include/safety_limits.h"

enum SafetyCheckResult {
    SAFETY_OK = 0,
    SAFETY_ESTOP_ACTIVE,
    SAFETY_INTERLOCK_ERROR,
    SAFETY_INVALID_CHANNEL,
    SAFETY_INVALID_VOLUME,
    SAFETY_NO_CALIBRATION,
    SAFETY_SYSTEM_BUSY
};

class SafetyManager {
public:
    static void init();
    static bool runStartupSelfTest();
    static SafetyCheckResult performPreDispenseCheck(int channel, int volumeMl);
    static bool verifyDispensingRuntime(unsigned long pumpStartTime, unsigned long lastPulseTime);
    static void abortAll(const char* reason);
};

#endif // SAFETY_MANAGER_H
