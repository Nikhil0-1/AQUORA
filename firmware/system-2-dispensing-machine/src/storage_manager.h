#ifndef STORAGE_MANAGER_H
#define STORAGE_MANAGER_H

#include <Arduino.h>
#include <Preferences.h>
#include <vector>

class StorageManager {
public:
    static bool init();
    static String getMachineCode();
    static void setMachineCode(const String& code);
    static float getCalibrationFactor(int channel);
    static void setCalibrationFactor(int channel, float factor);
    static bool isJobProcessed(const String& jobId);
    static void markJobProcessed(const String& jobId);
    static String getWifiSSID();
    static String getWifiPassword();
    static String getApiServerUrl();

private:
    static Preferences prefs;
    static bool initialized;
    static std::vector<String> processedJobsCache;
};

#endif // STORAGE_MANAGER_H
