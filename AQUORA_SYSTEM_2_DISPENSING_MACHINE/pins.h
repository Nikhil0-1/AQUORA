#pragma once

// ==============================================================================
// AQUORA System 2 — Sanitizer Dispensing Machine Pinout Definition
// Target: Standard ESP32 Dev Module (38-pin or 30-pin)
// ==============================================================================

// 1. Five Channel Pump Driver Outputs (Active HIGH Logic to MOSFET / Relay Driver)
#define PUMP_1_PIN          25
#define PUMP_2_PIN          26
#define PUMP_3_PIN          27
#define PUMP_4_PIN          14
#define PUMP_5_PIN          12

// 2. Five Channel Flow Sensor Pulse Inputs (Hardware Interrupt Pins)
#define FLOW_1_PIN          34
#define FLOW_2_PIN          35
#define FLOW_3_PIN          32
#define FLOW_4_PIN          33
#define FLOW_5_PIN          39

// 3. Hardware Emergency Stop (Active LOW, Normally Closed safety switch with pull-up)
#define EMERGENCY_STOP_PIN  36
#define ESTOP_PIN           EMERGENCY_STOP_PIN

// 4. Status Indicator LED
#define STATUS_LED_PIN      2
