#pragma once

#include <Arduino.h>
#if __has_include("secrets.h")
#include "secrets.h"
#elif __has_include("../secrets.h")
#include "../secrets.h"
#else
#include "secrets.h.example"
#endif

// Wi-Fi defaults from secrets
#ifndef WIFI_SSID_DEFAULT
#define WIFI_SSID_DEFAULT           AQUORA_WIFI_SSID
#endif
#ifndef WIFI_PASSWORD_DEFAULT
#define WIFI_PASSWORD_DEFAULT       AQUORA_WIFI_PASSWORD
#endif

// 1. Identity
#define AQUORA_MACHINE_ID       "AQ-DM-001"
#define AQUORA_MACHINE_MODEL    "AQUORA-DISPENSE-5CH-V1"

// 2. Cloud / Server Endpoints
#define AQUORA_API_URL          "http://192.168.1.100:3001"
#define AQUORA_API_BASE_PATH    "/api/v1/machine"

// 3. Operational Timing (ms)
#define HEARTBEAT_INTERVAL_MS   5000
#define JOB_POLL_INTERVAL_MS    1000
#define TELEMETRY_INTERVAL_MS   10000
#define PROGRESS_REPORT_MS      250

// 4. Default Flow Calibration (Pulses per Milliliter - Baseline: 10.0 pulses/ml)
#define DEFAULT_PULSES_PER_ML_CH1   10.0f
#define DEFAULT_PULSES_PER_ML_CH2   10.0f
#define DEFAULT_PULSES_PER_ML_CH3   10.0f
#define DEFAULT_PULSES_PER_ML_CH4   10.0f
#define DEFAULT_PULSES_PER_ML_CH5   10.0f

// 5. Watchdog Configuration
#define WATCHDOG_TIMEOUT_SEC    10
