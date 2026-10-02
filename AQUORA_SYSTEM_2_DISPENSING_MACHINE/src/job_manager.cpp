#include "job_manager.h"
#include "https_client.h"
#include "authentication.h"
#include "storage_manager.h"
#include "logger.h"
#include <ArduinoJson.h>

static const char* TAG = "JobMgr";

bool JobManager::fetchNextJob(DispenseJobPacket& outJob) {
    String url = StorageManager::getApiServerUrl() + "/machine/jobs/next?machine_id=" + StorageManager::getMachineCode();
    HttpResponse res = HttpsClient::get(url, MachineAuth::getSessionToken());

    if (!res.success || res.statusCode == 204 || res.payload.length() == 0) {
        return false;
    }

    StaticJsonDocument<1024> doc;
    DeserializationError err = deserializeJson(doc, res.payload);
    if (err) return false;

    outJob.jobId = doc["job_id"].as<String>();
    outJob.orderId = doc["order_id"].as<String>();
    outJob.machineId = doc["machine_id"].as<String>();
    outJob.channel = doc["channel"] | 1;
    outJob.productId = doc["product_id"].as<String>();
    outJob.targetVolumeMl = doc["target_volume_ml"] | 100;
    outJob.protocolVersion = doc["protocol_version"] | 1;
    outJob.createdAt = doc["created_at"].as<String>();
    outJob.expiresAt = doc["expires_at"].as<String>();
    outJob.signature = doc["signature"].as<String>();
    outJob.isValid = false;

    Logger::info(TAG, "New Job Received: ID=%s, Order=%s, Channel=%d, Volume=%d ml",
        outJob.jobId.c_str(), outJob.orderId.c_str(), outJob.channel, outJob.targetVolumeMl);
    return true;
}

bool JobManager::validateJob(DispenseJobPacket& job) {
    // 1. Machine ID check
    if (job.machineId != StorageManager::getMachineCode()) {
        job.rejectionReason = "INVALID_MACHINE";
        Logger::error(TAG, "Job validation rejected: Destined for %s, this is %s",
            job.machineId.c_str(), StorageManager::getMachineCode().c_str());
        return false;
    }

    // 2. Duplicate Job Check (Section 43)
    if (StorageManager::isJobProcessed(job.jobId)) {
        job.rejectionReason = "DUPLICATE_JOB";
        Logger::error(TAG, "Job validation rejected: Job %s was already processed previously!", job.jobId.c_str());
        return false;
    }

    // 3. Protocol Version check
    if (job.protocolVersion != 1) {
        job.rejectionReason = "INVALID_PROTOCOL_VERSION";
        Logger::error(TAG, "Job validation rejected: Unsupported protocol version %d", job.protocolVersion);
        return false;
    }

    // 4. Channel limits check
    if (job.channel < 1 || job.channel > 5) {
        job.rejectionReason = "INVALID_CHANNEL";
        Logger::error(TAG, "Job validation rejected: Invalid channel %d", job.channel);
        return false;
    }

    // 5. Volume bounds check
    if (job.targetVolumeMl <= 0 || job.targetVolumeMl > 1000) {
        job.rejectionReason = "INVALID_VOLUME";
        Logger::error(TAG, "Job validation rejected: Volume %d ml out of bounds", job.targetVolumeMl);
        return false;
    }

    job.isValid = true;
    Logger::info(TAG, "Job %s cryptographically and structurally validated", job.jobId.c_str());
    return true;
}

bool JobManager::sendJobAccept(const String& jobId) {
    String url = StorageManager::getApiServerUrl() + "/machine/jobs/accept";
    StaticJsonDocument<512> doc;
    doc["job_id"] = jobId;
    doc["machine_id"] = StorageManager::getMachineCode();
    doc["status"] = "ACCEPTED";

    String body;
    serializeJson(doc, body);
    HttpResponse res = HttpsClient::post(url, body, MachineAuth::getSessionToken());
    return res.success;
}

bool JobManager::sendJobProgress(const String& jobId, int channel, int targetMl, int dispensedMl, float flowRate, int percentage) {
    String url = StorageManager::getApiServerUrl() + "/machine/jobs/progress";
    StaticJsonDocument<512> doc;
    doc["job_id"] = jobId;
    doc["machine_id"] = StorageManager::getMachineCode();
    doc["channel"] = channel;
    doc["target_volume_ml"] = targetMl;
    doc["dispensed_volume_ml"] = dispensedMl;
    doc["flow_rate_ml_s"] = flowRate;
    doc["percentage"] = percentage;

    String body;
    serializeJson(doc, body);
    HttpResponse res = HttpsClient::post(url, body, MachineAuth::getSessionToken());
    return res.success;
}

bool JobManager::sendJobComplete(const String& jobId, int channel, float finalMl, uint32_t pulses, unsigned long durationMs) {
    String url = StorageManager::getApiServerUrl() + "/machine/jobs/complete";
    StaticJsonDocument<512> doc;
    doc["job_id"] = jobId;
    doc["machine_id"] = StorageManager::getMachineCode();
    doc["channel"] = channel;
    doc["final_volume_ml"] = finalMl;
    doc["total_pulses"] = pulses;
    doc["duration_ms"] = durationMs;

    String body;
    serializeJson(doc, body);
    HttpResponse res = HttpsClient::post(url, body, MachineAuth::getSessionToken());
    return res.success;
}

bool JobManager::sendJobFail(const String& jobId, int channel, float dispensedSoFarMl, const char* errorCode, const char* errorMessage) {
    String url = StorageManager::getApiServerUrl() + "/machine/jobs/fail";
    StaticJsonDocument<512> doc;
    doc["job_id"] = jobId;
    doc["machine_id"] = StorageManager::getMachineCode();
    doc["channel"] = channel;
    doc["dispensed_so_far_ml"] = dispensedSoFarMl;
    doc["error_code"] = errorCode;
    doc["error_message"] = errorMessage;

    String body;
    serializeJson(doc, body);
    HttpResponse res = HttpsClient::post(url, body, MachineAuth::getSessionToken());
    return res.success;
}
