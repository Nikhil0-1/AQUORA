#ifndef JOB_MANAGER_H
#define JOB_MANAGER_H

#include <Arduino.h>

struct DispenseJobPacket {
    String jobId;
    String orderId;
    String machineId;
    int channel;
    String productId;
    int targetVolumeMl;
    int protocolVersion;
    String createdAt;
    String expiresAt;
    String signature;
    bool isValid;
    String rejectionReason;
};

class JobManager {
public:
    static bool fetchNextJob(DispenseJobPacket& outJob);
    static bool validateJob(DispenseJobPacket& job);
    static bool sendJobAccept(const String& jobId);
    static bool sendJobProgress(const String& jobId, int channel, int targetMl, int dispensedMl, float flowRate, int percentage);
    static bool sendJobComplete(const String& jobId, int channel, float finalMl, uint32_t pulses, unsigned long durationMs);
    static bool sendJobFail(const String& jobId, int channel, float dispensedSoFarMl, const char* errorCode, const char* errorMessage);
};

#endif // JOB_MANAGER_H
