#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>

class WifiManager {
public:
    static void init();
    static void update();
    static bool isConnected();
    static int getRSSI();
    static String getIPAddress();

private:
    static unsigned long lastAttemptTime;
    static bool connecting;
};

#endif // WIFI_MANAGER_H
