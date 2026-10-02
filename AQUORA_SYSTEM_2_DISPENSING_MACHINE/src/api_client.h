#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>

class ApiClient {
public:
    static bool init();
    static bool get(const String& endpoint, String& response);
    static bool post(const String& endpoint, const String& payload, String& response);
    static bool pollNextJob(String& jobJson);
    static bool sendHeartbeat(const String& heartbeatJson);
    static bool sendTelemetry(const String& telemetryJson);
    static bool reportJobProgress(const String& jobId, float volumeDispensed, float targetVolume, int percentage);
    static bool reportJobComplete(const String& jobId, float volumeDispensed, uint32_t totalPulses, uint32_t durationMs);
    static bool reportJobFailure(const String& jobId, const String& errorCode, const String& errorMessage);
};
