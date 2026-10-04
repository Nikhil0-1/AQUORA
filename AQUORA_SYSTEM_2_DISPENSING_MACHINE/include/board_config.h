#pragma once

// ==============================================================================
// AQUORA System 2 — Board & Microcontroller Hardware Configuration
// Microcontroller: ESP32-D0WDQ6 (38-pin Dev Module / NodeMCU-32S)
// Core Architecture: Dual-Core Xtensa LX6 @ 240 MHz, 520 KB SRAM, 4MB Flash
// ==============================================================================

#define BOARD_NAME                  "ESP32-DEV-38PIN"
#define CHANNELS_COUNT              5

// Pump Driver Configuration
#define PUMP_ACTIVE_LEVEL           HIGH
#define PUMP_INACTIVE_LEVEL         LOW

// Flow Sensor Interrupt Type
#define FLOW_SENSOR_TRIGGER_MODE    RISING

// Emergency Stop Trigger Mode
#define ESTOP_TRIGGER_MODE          FALLING

// Status LED Logic
#define STATUS_LED_ACTIVE           HIGH
#define STATUS_LED_INACTIVE         LOW
