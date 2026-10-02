#ifndef FLOW_SENSOR_H
#define FLOW_SENSOR_H

#include <Arduino.h>

class FlowSensorManager {
public:
    static void init();
    static void resetCounter(int channel);
    static uint32_t getPulseCount(int channel);
    static float getVolumeMl(int channel);
    static float getFlowRateMlPerSec(int channel);

    // Minimal ISRs for 5 independent channels
    static void IRAM_ATTR isrChannel1();
    static void IRAM_ATTR isrChannel2();
    static void IRAM_ATTR isrChannel3();
    static void IRAM_ATTR isrChannel4();
    static void IRAM_ATTR isrChannel5();

private:
    static volatile uint32_t pulseCounts[5];
    static uint32_t lastPulseCounts[5];
    static unsigned long lastRateCalculationTime;
    static float flowRates[5];
};

#endif // FLOW_SENSOR_H
