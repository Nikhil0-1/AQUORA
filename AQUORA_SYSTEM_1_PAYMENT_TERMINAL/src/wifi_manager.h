#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>

enum WifiState {
    WIFI_STATE_DISCONNECTED,
    WIFI_STATE_CONNECTING,
    WIFI_STATE_CONNECTED,
    WIFI_STATE_FAILED
};

class WifiManager {
public:
    static void init();
    static void update();
    static bool isConnected();
    static int getRSSI();
    static String getIPAddress();
    static WifiState getState();

private:
    static WifiState currentState;
    static unsigned long lastConnectAttempt;
    static unsigned long connectStartTime;
    static const unsigned long RECONNECT_INTERVAL_MS = 5000;
    static const unsigned long CONNECT_TIMEOUT_MS = 15000;
    static void startConnection();
};

#endif // WIFI_MANAGER_H
