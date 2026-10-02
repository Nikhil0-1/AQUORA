#ifndef STORAGE_MANAGER_H
#define STORAGE_MANAGER_H

#include <Arduino.h>
#include <Preferences.h>

class StorageManager {
public:
    static bool init();
    static String getTerminalCode();
    static void setTerminalCode(const String& code);
    static String getAssignedDispenserCode();
    static void setAssignedDispenserCode(const String& code);
    static String getApiServerUrl();
    static void setApiServerUrl(const String& url);
    static String getWifiSSID();
    static String getWifiPassword();
    static void setWifiCredentials(const String& ssid, const String& password);

private:
    static Preferences preferences;
    static bool initialized;
};

#endif // STORAGE_MANAGER_H
