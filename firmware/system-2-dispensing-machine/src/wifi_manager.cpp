#include "wifi_manager.h"
#include "storage_manager.h"
#include "logger.h"

static const char* TAG = "WifiMgr";
unsigned long WifiManager::lastAttemptTime = 0;
bool WifiManager::connecting = false;

void WifiManager::init() {
    WiFi.mode(WIFI_STA);
    WiFi.setAutoReconnect(true);
    Logger::info(TAG, "WiFi station configured. MAC: %s", WiFi.macAddress().c_str());

    String ssid = StorageManager::getWifiSSID();
    String pass = StorageManager::getWifiPassword();
    WiFi.begin(ssid.c_str(), pass.c_str());
    connecting = true;
    lastAttemptTime = millis();
}

void WifiManager::update() {
    if (WiFi.status() == WL_CONNECTED) {
        if (connecting) {
            connecting = false;
            Logger::info(TAG, "WiFi connected! IP: %s, RSSI: %d dBm",
                WiFi.localIP().toString().c_str(), WiFi.RSSI());
        }
    } else {
        if (!connecting && millis() - lastAttemptTime > 5000) {
            Logger::warn(TAG, "WiFi disconnected, attempting reconnect...");
            connecting = true;
            lastAttemptTime = millis();
            String ssid = StorageManager::getWifiSSID();
            String pass = StorageManager::getWifiPassword();
            WiFi.begin(ssid.c_str(), pass.c_str());
        }
    }
}

bool WifiManager::isConnected() {
    return WiFi.status() == WL_CONNECTED;
}

int WifiManager::getRSSI() {
    return isConnected() ? WiFi.RSSI() : -100;
}

String WifiManager::getIPAddress() {
    return isConnected() ? WiFi.localIP().toString() : "0.0.0.0";
}
