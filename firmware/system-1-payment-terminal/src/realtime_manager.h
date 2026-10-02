#ifndef REALTIME_MANAGER_H
#define REALTIME_MANAGER_H

#include <Arduino.h>

struct DispenseProgressData {
    int dispensedMl;
    int targetMl;
    int percentage;
    float flowRate;
    bool isComplete;
    bool isFailed;
    String error;
};

class RealtimeManager {
public:
    static void init();
    static void update();
    static void subscribeOrder(const String& orderId);
    static const DispenseProgressData& getProgress();
    static void reset();

private:
    static DispenseProgressData progress;
    static String currentSubscribedOrder;
    static unsigned long lastPollTime;
};

#endif // REALTIME_MANAGER_H
