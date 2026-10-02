#pragma once

// ==============================================================================
// AQUORA System 2 — Safety Limits & Protection Thresholds
// Enforced in hardware/firmware real-time loops
// ==============================================================================

// Maximum allowed dispensing volume in a single job (ml)
#define MAX_DISPENSE_VOLUME_ML      1000

// Minimum allowed dispensing volume in a single job (ml)
#define MIN_DISPENSE_VOLUME_ML      10

// Maximum time allowed for pump operation before hard timeout trip (ms)
#define MAX_DISPENSE_TIME_MS        45000

// Timeout to detect zero-flow / dry-run condition (ms)
// If < 3 pulses arrive within this window after pump starts, trip ERR_FLOW_TIMEOUT
#define FLOW_START_TIMEOUT_MS       3000

// Minimum pulses required within FLOW_START_TIMEOUT_MS
#define MIN_PULSES_START_THRESHOLD  3

// Maximum continuous temperature threshold before thermal throttle (Celsius)
#define MAX_INTERNAL_TEMP_C         75.0f

// Single pump interlock: Maximum allowed active pumps at any instant
#define MAX_ACTIVE_PUMPS            1
