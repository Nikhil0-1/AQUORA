#ifndef AQUORA_PINS_H
#define AQUORA_PINS_H

// ==============================================================================
// AQUORA System 2 — Sanitizer Dispensing Machine Pinout Definition
// Hardware: ESP32 + 5 MOSFET Driver Channels + 5 Flow Sensors + Emergency Stop
// ==============================================================================

// 1. 5 Channel Pump Driver Outputs (Active HIGH Gate Logic)
#define PUMP_1_PIN          25
#define PUMP_2_PIN          26
#define PUMP_3_PIN          27
#define PUMP_4_PIN          14
#define PUMP_5_PIN          12

// 2. 5 Channel Flow Sensor Pulse Inputs (Interrupts)
#define FLOW_1_PIN          34
#define FLOW_2_PIN          35
#define FLOW_3_PIN          32
#define FLOW_4_PIN          33
#define FLOW_5_PIN          39

// 3. Hardware Emergency Stop (Active LOW, Internal Pullup / External NC Loop)
#define ESTOP_PIN           36

// 4. Status Indicator LED
#define STATUS_LED_PIN      2

#endif // AQUORA_PINS_H
