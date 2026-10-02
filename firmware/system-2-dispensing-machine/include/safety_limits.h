#ifndef AQUORA_SAFETY_LIMITS_H
#define AQUORA_SAFETY_LIMITS_H

#include <stdint.h>

// ==============================================================================
// AQUORA System 2 — Absolute Safety Limits & Interlock Enforcements
// ==============================================================================

// Maximum Single Dispense Volume (Safety Cap to prevent overflow)
#define MAX_SINGLE_DISPENSE_ML      1000

// Minimum Dispense Volume
#define MIN_SINGLE_DISPENSE_ML      10

// Pump Runtime Timeout (Maximum time a pump is permitted to stay energized)
#define MAX_PUMP_RUNTIME_MS         45000 // 45 seconds

// Flow Sensor Verification Timeout (If pump runs without flow detected)
#define NO_FLOW_TIMEOUT_MS          3000  // 3 seconds

// Minimum Acceptable Flow Rate (ml/sec) before triggering FLOW_ERROR
#define MIN_FLOW_RATE_ML_S          1.5f

// Watchdog Timeout (Reboot if MCU hangs; hardware kills pump gate)
#define WATCHDOG_TIMEOUT_SECONDS    10

// Job Expiry Guard Window (Seconds)
#define JOB_MAX_AGE_SECONDS         300   // 5 minutes

#endif // AQUORA_SAFETY_LIMITS_H
