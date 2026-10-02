#include "api_client.h"
#include "https_client.h"
#include "logger.h"
#if __has_include("../config.h")
#include "../config.h"
#else
#include "config.h"
#endif

bool ApiClient::init() {
    return true;
}

bool ApiClient::get(const String& endpoint, String& response) {
    HttpResponse res = HttpsClient::get(endpoint);
    response = res.payload;
    return res.success;
}

bool ApiClient::post(const String& endpoint, const String& payload, String& response) {
    HttpResponse res = HttpsClient::post(endpoint, payload);
    response = res.payload;
    return res.success;
}

bool ApiClient::pollNextJob(String& jobJson) {
    String endpoint = String(AQUORA_API_URL) + String(AQUORA_API_BASE_PATH) + "/jobs/next?machine_id=" + String(AQUORA_MACHINE_ID);
    HttpResponse res = HttpsClient::get(endpoint);
    jobJson = res.payload;
    return res.success;
}

bool ApiClient::sendHeartbeat(const String& heartbeatJson) {
    String endpoint = String(AQUORA_API_URL) + String(AQUORA_API_BASE_PATH) + "/heartbeat";
    HttpResponse res = HttpsClient::post(endpoint, heartbeatJson);
    return res.success;
}

bool ApiClient::sendTelemetry(const String& telemetryJson) {
    String endpoint = String(AQUORA_API_URL) + String(AQUORA_API_BASE_PATH) + "/telemetry";
    HttpResponse res = HttpsClient::post(endpoint, telemetryJson);
    return res.success;
}

bool ApiClient::reportJobProgress(const String& jobId, float volumeDispensed, float targetVolume, int percentage) {
    StaticJsonDocument<256> doc;
    doc["job_id"] = jobId;
    doc["machine_id"] = AQUORA_MACHINE_ID;
    doc["dispensed_volume_ml"] = volumeDispensed;
    doc["target_volume_ml"] = targetVolume;
    doc["progress_percentage"] = percentage;
    
    String payload;
    serializeJson(doc, payload);
    
    String endpoint = String(AQUORA_API_URL) + String(AQUORA_API_BASE_PATH) + "/jobs/progress";
    HttpResponse res = HttpsClient::post(endpoint, payload);
    return res.success;
}

bool ApiClient::reportJobComplete(const String& jobId, float volumeDispensed, uint32_t totalPulses, uint32_t durationMs) {
    StaticJsonDocument<256> doc;
    doc["job_id"] = jobId;
    doc["machine_id"] = AQUORA_MACHINE_ID;
    doc["dispensed_volume_ml"] = volumeDispensed;
    doc["total_pulses"] = totalPulses;
    doc["duration_ms"] = durationMs;
    doc["status"] = "COMPLETED";
    
    String payload;
    serializeJson(doc, payload);
    
    String endpoint = String(AQUORA_API_URL) + String(AQUORA_API_BASE_PATH) + "/jobs/complete";
    HttpResponse res = HttpsClient::post(endpoint, payload);
    return res.success;
}

bool ApiClient::reportJobFailure(const String& jobId, const String& errorCode, const String& errorMessage) {
    StaticJsonDocument<256> doc;
    doc["job_id"] = jobId;
    doc["machine_id"] = AQUORA_MACHINE_ID;
    doc["error_code"] = errorCode;
    doc["error_message"] = errorMessage;
    doc["status"] = "FAILED";
    
    String payload;
    serializeJson(doc, payload);
    
    String endpoint = String(AQUORA_API_URL) + String(AQUORA_API_BASE_PATH) + "/jobs/fail";
    HttpResponse res = HttpsClient::post(endpoint, payload);
    return res.success;
}
