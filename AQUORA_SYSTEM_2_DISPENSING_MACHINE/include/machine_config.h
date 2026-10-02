#pragma once

#include <Arduino.h>

// ==============================================================================
// AQUORA System 2 — Machine Hardware & Calibration Structs
// ==============================================================================

struct ChannelHardware {
    uint8_t channel_number;   // 1 .. 5
    uint8_t pump_gpio;
    uint8_t flow_gpio;
    float   pulses_per_ml;
    bool    enabled;
    const char* formula_name;
};

// Static channel hardware mapping
static const ChannelHardware MACHINE_CHANNELS[5] = {
    { 1, 25, 34, 0.450f, true, "Classic Sanitizer" },
    { 2, 26, 35, 0.380f, true, "Aloe Vera Soothing Gel" },
    { 3, 27, 32, 0.450f, true, "Herbal Neem Disinfectant" },
    { 4, 14, 33, 0.420f, true, "Premium Moisturizing" },
    { 5, 12, 39, 0.450f, true, "Family Antimicrobial" }
};
