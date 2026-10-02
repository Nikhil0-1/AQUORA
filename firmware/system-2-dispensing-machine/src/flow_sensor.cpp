#include "flow_sensor.h"
#include "storage_manager.h"
#include "../include/pins.h"
#include "logger.h"

static const char* TAG = "FlowSensor";

volatile uint32_t FlowSensorManager::pulseCounts[5] = { 0, 0, 0, 0, 0 };
uint32_t FlowSensorManager::lastPulseCounts[5] = { 0, 0, 0, 0, 0 };
unsigned long FlowSensorManager::lastRateCalculationTime = 0;
float FlowSensorManager::flowRates[5] = { 0.0f, 0.0f, 0.0f, 0.0f, 0.0f };

// Strictly minimal IRAM_ATTR ISRs: single increment instruction
void IRAM_ATTR FlowSensorManager::isrChannel1() { pulseCounts[0]++; }
void IRAM_ATTR FlowSensorManager::isrChannel2() { pulseCounts[1]++; }
void IRAM_ATTR FlowSensorManager::isrChannel3() { pulseCounts[2]++; }
void IRAM_ATTR FlowSensorManager::isrChannel4() { pulseCounts[3]++; }
void IRAM_ATTR FlowSensorManager::isrChannel5() { pulseCounts[4]++; }

void FlowSensorManager::init() {
    Logger::info(TAG, "Configuring 5 independent flow sensor interrupt inputs");

    pinMode(FLOW_1_PIN, INPUT_PULLUP);
    pinMode(FLOW_2_PIN, INPUT_PULLUP);
    pinMode(FLOW_3_PIN, INPUT_PULLUP);
    pinMode(FLOW_4_PIN, INPUT_PULLUP);
    pinMode(FLOW_5_PIN, INPUT_PULLUP);

    attachInterrupt(digitalPinToInterrupt(FLOW_1_PIN), isrChannel1, RISING);
    attachInterrupt(digitalPinToInterrupt(FLOW_2_PIN), isrChannel2, RISING);
    attachInterrupt(digitalPinToInterrupt(FLOW_3_PIN), isrChannel3, RISING);
    attachInterrupt(digitalPinToInterrupt(FLOW_4_PIN), isrChannel4, RISING);
    attachInterrupt(digitalPinToInterrupt(FLOW_5_PIN), isrChannel5, RISING);

    for (int i = 1; i <= 5; i++) resetCounter(i);
    lastRateCalculationTime = millis();

    Logger::info(TAG, "Flow sensors active on GPIOs (34, 35, 32, 33, 39)");
}

void FlowSensorManager::resetCounter(int channel) {
    if (channel >= 1 && channel <= 5) {
        noInterrupts();
        pulseCounts[channel - 1] = 0;
        lastPulseCounts[channel - 1] = 0;
        flowRates[channel - 1] = 0.0f;
        interrupts();
    }
}

uint32_t FlowSensorManager::getPulseCount(int channel) {
    if (channel >= 1 && channel <= 5) {
        noInterrupts();
        uint32_t count = pulseCounts[channel - 1];
        interrupts();
        return count;
    }
    return 0;
}

float FlowSensorManager::getVolumeMl(int channel) {
    if (channel < 1 || channel > 5) return 0.0f;
    uint32_t pulses = getPulseCount(channel);
    float factor = StorageManager::getCalibrationFactor(channel);
    if (factor <= 0.0f) factor = 10.0f;
    return (float)pulses / factor;
}

float FlowSensorManager::getFlowRateMlPerSec(int channel) {
    if (channel < 1 || channel > 5) return 0.0f;
    unsigned long now = millis();
    unsigned long dt = now - lastRateCalculationTime;
    if (dt >= 500) {
        for (int i = 0; i < 5; i++) {
            uint32_t current = getPulseCount(i + 1);
            uint32_t delta = (current >= lastPulseCounts[i]) ? (current - lastPulseCounts[i]) : 0;
            float factor = StorageManager::getCalibrationFactor(i + 1);
            if (factor <= 0.0f) factor = 10.0f;
            flowRates[i] = ((float)delta / factor) / ((float)dt / 1000.0f);
            lastPulseCounts[i] = current;
        }
        lastRateCalculationTime = now;
    }
    return flowRates[channel - 1];
}
