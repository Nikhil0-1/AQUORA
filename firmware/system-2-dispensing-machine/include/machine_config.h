#ifndef AQUORA_MACHINE_CONFIG_H
#define AQUORA_MACHINE_CONFIG_H

#include <stdint.h>

#define DEFAULT_MACHINE_CODE        "AQ-DM-001"
#define DEFAULT_FIRMWARE_VERSION    "1.0.0-esp32"
#define DEFAULT_PROTOCOL_VERSION    1

// Calibration: Default pulses per mL (e.g., 10 pulses per ml = 1000 pulses for 100ml)
#define DEFAULT_CALIBRATION_FACTOR  10.0f

// Telemetry Reporting Intervals
#define HEARTBEAT_INTERVAL_MS       15000
#define TELEMETRY_INTERVAL_MS       30000
#define JOB_POLL_INTERVAL_MS        1000

#endif // AQUORA_MACHINE_CONFIG_H
