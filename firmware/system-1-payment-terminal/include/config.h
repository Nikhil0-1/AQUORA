#ifndef AQUORA_CONFIG_H
#define AQUORA_CONFIG_H

#include <stdint.h>
#include <stdbool.h>

// ==============================================================================
// AQUORA System 1 — Global Application Configuration
// ==============================================================================

#define TERMINAL_CODE_DEFAULT       "AQ-PT-001"
#define ASSIGNED_DISPENSER_DEFAULT  "AQ-DM-001"

// Networking & Timeouts
#define WIFI_CONNECT_TIMEOUT_MS     15000
#define HTTP_REQUEST_TIMEOUT_MS     10000
#define HEARTBEAT_INTERVAL_MS       30000
#define ORDER_STATUS_POLL_MS        1500

// Customer Session Timeout (Section 114: Clear session if idle)
#define SESSION_IDLE_TIMEOUT_MS     45000

// Watchdog Timeout (Section 50 & 88)
#define WATCHDOG_TIMEOUT_SECONDS    10

// Thermal Receipt Printer Settings
#define PRINTER_ENABLED_DEFAULT     true
#define PRINTER_BAUD_RATE           9600

// Serial Debug
#define SERIAL_BAUD_RATE            115200

#endif // AQUORA_CONFIG_H
