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
#define AQUORA_TERMINAL_ID          "AQ-PT-001"
#define AQUORA_TERMINAL_MODEL       "CROWPANEL-7.0-ESP32S3"
#define TERMINAL_CODE_DEFAULT       AQUORA_TERMINAL_ID
#define ASSIGNED_DISPENSER_DEFAULT  "AQ-DM-001"

// 2. Cloud / Server Endpoints
#define AQUORA_API_URL              "http://192.168.1.100:3001"
#define AQUORA_API_BASE_PATH        "/api/v1"
#define API_BASE_URL_DEFAULT        AQUORA_API_URL
#define HTTP_REQUEST_TIMEOUT_MS     5000

// 3. User Interface Timing (ms)
#define UI_AUTO_RESET_TIMEOUT_MS    60000   // Reset to welcome screen after 60s inactivity
#define UI_POLL_INTERVAL_MS         1000    // Order & dispensing status poll interval
#define UI_COMPLETION_DISPLAY_MS    8000    // Show "Thank You" screen for 8s
#define SESSION_IDLE_TIMEOUT_MS     UI_AUTO_RESET_TIMEOUT_MS

// 4. Watchdog & Serial Configuration
#define WATCHDOG_TIMEOUT_SEC        10
#define WATCHDOG_TIMEOUT_SECONDS    WATCHDOG_TIMEOUT_SEC
#define SERIAL_BAUD_RATE            115200
#define PRINTER_ENABLED_DEFAULT     0
#define PRINTER_BAUD_RATE           9600
