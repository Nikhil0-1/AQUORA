#include "storage_manager.h"
#include "../include/config.h"
#include "../include/api_config.h"
#include "logger.h"

Preferences StorageManager::preferences;
bool StorageManager::initialized = false;

static const char* TAG = "StorageMgr";

bool StorageManager::init() {
    if (initialized) return true;
    if (!preferences.begin("aquora_pt", false)) {
        Logger::error(TAG, "Failed to open NVS namespace");
        return false;
    }
    initialized = true;
    Logger::info(TAG, "NVS storage initialized");
    return true;
}

String StorageManager::getTerminalCode() {
    init();
    return preferences.getString("term_code", TERMINAL_CODE_DEFAULT);
}

void StorageManager::setTerminalCode(const String& code) {
    init();
    preferences.putString("term_code", code);
}

String StorageManager::getAssignedDispenserCode() {
    init();
    return preferences.getString("disp_code", ASSIGNED_DISPENSER_DEFAULT);
}

void StorageManager::setAssignedDispenserCode(const String& code) {
    init();
    preferences.putString("disp_code", code);
}

String StorageManager::getApiServerUrl() {
    init();
    return preferences.getString("api_url", API_BASE_URL_DEFAULT);
}

void StorageManager::setApiServerUrl(const String& url) {
    init();
    preferences.putString("api_url", url);
}

String StorageManager::getWifiSSID() {
    init();
    return preferences.getString("wifi_ssid", WIFI_SSID_DEFAULT);
}

String StorageManager::getWifiPassword() {
    init();
    return preferences.getString("wifi_pass", WIFI_PASSWORD_DEFAULT);
}

void StorageManager::setWifiCredentials(const String& ssid, const String& password) {
    init();
    preferences.putString("wifi_ssid", ssid);
    preferences.putString("wifi_pass", password);
}
