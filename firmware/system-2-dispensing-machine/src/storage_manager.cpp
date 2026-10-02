#include "storage_manager.h"
#include "../include/machine_config.h"
#include "../include/config.h"
#include "logger.h"

static const char* TAG = "StorageMgr";

Preferences StorageManager::prefs;
bool StorageManager::initialized = false;
std::vector<String> StorageManager::processedJobsCache;

bool StorageManager::init() {
    if (initialized) return true;
    if (!prefs.begin("aquora_dm", false)) {
        Logger::error(TAG, "Failed to initialize NVS aquora_dm");
        return false;
    }
    initialized = true;

    // Load recent processed jobs into RAM cache
    String jobList = prefs.getString("jobs_done", "");
    int start = 0;
    while (start < jobList.length()) {
        int comma = jobList.indexOf(',', start);
        if (comma == -1) comma = jobList.length();
        String jid = jobList.substring(start, comma);
        if (jid.length() > 0) processedJobsCache.push_back(jid);
        start = comma + 1;
    }

    Logger::info(TAG, "NVS storage ready. %d processed jobs loaded in cache.", processedJobsCache.size());
    return true;
}

String StorageManager::getMachineCode() {
    init();
    return prefs.getString("mach_code", DEFAULT_MACHINE_CODE);
}

void StorageManager::setMachineCode(const String& code) {
    init();
    prefs.putString("mach_code", code);
}

float StorageManager::getCalibrationFactor(int channel) {
    init();
    char key[16];
    snprintf(key, sizeof(key), "cal_ch_%d", channel);
    return prefs.getFloat(key, DEFAULT_CALIBRATION_FACTOR);
}

void StorageManager::setCalibrationFactor(int channel, float factor) {
    init();
    char key[16];
    snprintf(key, sizeof(key), "cal_ch_%d", channel);
    prefs.putFloat(key, factor);
    Logger::info(TAG, "Saved calibration factor %.2f for Channel %d", factor, channel);
}

bool StorageManager::isJobProcessed(const String& jobId) {
    init();
    for (const String& id : processedJobsCache) {
        if (id == jobId) return true;
    }
    return false;
}

void StorageManager::markJobProcessed(const String& jobId) {
    init();
    if (isJobProcessed(jobId)) return;

    processedJobsCache.push_back(jobId);
    // Keep last 30 jobs in NVS
    if (processedJobsCache.size() > 30) {
        processedJobsCache.erase(processedJobsCache.begin());
    }

    String serialized = "";
    for (size_t i = 0; i < processedJobsCache.size(); i++) {
        serialized += processedJobsCache[i];
        if (i < processedJobsCache.size() - 1) serialized += ",";
    }
    prefs.putString("jobs_done", serialized);
    Logger::info(TAG, "Persisted completed job %s to NVS", jobId.c_str());
}

String StorageManager::getWifiSSID() {
    init();
    return prefs.getString("wifi_ssid", "AQUORA_SECURE_WIFI");
}

String StorageManager::getWifiPassword() {
    init();
    return prefs.getString("wifi_pass", "VendingSecureKey2026");
}

String StorageManager::getApiServerUrl() {
    init();
    return prefs.getString("api_url", API_SERVER_URL_DEFAULT);
}
