#ifndef TELEMETRY_H
#define TELEMETRY_H

#include <Arduino.h>

class TelemetryManager {
public:
    static void init();
    static void update();
    static bool sendHeartbeat();
    static bool sendTelemetry();

private:
    static unsigned long lastHeartbeatTime;
    static unsigned long lastTelemetryTime;
};

#endif // TELEMETRY_H
