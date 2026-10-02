#ifndef CALIBRATION_H
#define CALIBRATION_H

#include <Arduino.h>

struct CalibrationRecord {
    int channel;
    uint32_t pulseCount;
    float measuredVolumeMl;
    float calibrationFactor;
    String operatorName;
    String timestamp;
};

class CalibrationManager {
public:
    static void init();
    static bool performTestDispense(int channel, uint32_t targetPulses);
    static float calculateFactor(uint32_t pulses, float actualMeasuredMl);
    static bool applyAndSave(int channel, float newFactor);
    static bool hasValidCalibration(int channel);
};

#endif // CALIBRATION_H
