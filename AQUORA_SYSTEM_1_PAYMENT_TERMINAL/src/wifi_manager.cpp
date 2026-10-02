#include "wifi_manager.h"
#include "storage_manager.h"
#include "logger.h"

static const char* TAG = "WifiMgr";

WifiState WifiManager::currentState = WIFI_STATE_DISCONNECTED;
unsigned long WifiManager::lastConnectAttempt = 0;
unsigned long WifiManager::connectStartTime = 0;

void WifiManager::init() {
    WiFi.mode(WIFI_STA);
    WiFi.setAutoReconnect(true);
    Logger::info(TAG, "WiFi station initialized. MAC: %s", WiFi.macAddress().c_str());
    startConnection();
}

void WifiManager::startConnection() {
    String ssid = StorageManager::getWifiSSID();
    String pass = StorageManager::getWifiPassword();

    Logger::info(TAG, "Connecting to WiFi SSID: %s", ssid.c_str());
    WiFi.begin(ssid.c_str(), pass.c_str());
    currentState = WIFI_STATE_CONNECTING;
    connectStartTime = millis();
    lastConnectAttempt = millis();
}

void WifiManager::update() {
    wl_status_t status = WiFi.status();

    switch (currentState) {
        case WIFI_STATE_CONNECTING:
            if (status == WL_CONNECTED) {
                currentState = WIFI_STATE_CONNECTED;
                Logger::info(TAG, "WiFi connected! IP: %s, RSSI: %d dBm",
                    WiFi.localIP().toString().c_str(), WiFi.RSSI());
            } else if (millis() - connectStartTime > CONNECT_TIMEOUT_MS) {
                currentState = WIFI_STATE_FAILED;
                Logger::warn(TAG, "WiFi connection attempt timed out");
                lastConnectAttempt = millis();
            }
            break;

        case WIFI_STATE_CONNECTED:
            if (status != WL_CONNECTED) {
                currentState = WIFI_STATE_DISCONNECTED;
                Logger::warn(TAG, "WiFi connection lost");
                lastConnectAttempt = millis();
            }
            break;

        case WIFI_STATE_FAILED:
        case WIFI_STATE_DISCONNECTED:
            if (millis() - lastConnectAttempt > RECONNECT_INTERVAL_MS) {
                startConnection();
            }
            break;
    }
}

bool WifiManager::isConnected() {
    return currentState == WIFI_STATE_CONNECTED && WiFi.status() == WL_CONNECTED;
}

int WifiManager::getRSSI() {
    return isConnected() ? WiFi.RSSI() : -100;
}

String WifiManager::getIPAddress() {
    return isConnected() ? WiFi.localIP().toString() : "0.0.0.0";
}

WifiState WifiManager::getState() {
    return currentState;
}
