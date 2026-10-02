#include "realtime_manager.h"
#include "api_client.h"
#include "state_machine.h"
#include "logger.h"

static const char* TAG = "RealtimeMgr";

DispenseProgressData RealtimeManager::progress = { 0, 100, 0, 0.0f, false, false, "" };
String RealtimeManager::currentSubscribedOrder = "";
unsigned long RealtimeManager::lastPollTime = 0;

void RealtimeManager::init() {
    reset();
}

void RealtimeManager::reset() {
    progress = { 0, 100, 0, 0.0f, false, false, "" };
    currentSubscribedOrder = "";
    lastPollTime = 0;
}

void RealtimeManager::subscribeOrder(const String& orderId) {
    reset();
    currentSubscribedOrder = orderId;
    Logger::info(TAG, "Subscribed to live dispensing progress for order %s", orderId.c_str());
}

void RealtimeManager::update() {
    if (currentSubscribedOrder.length() == 0) return;
    if (progress.isComplete || progress.isFailed) return;

    if (millis() - lastPollTime >= 800) {
        lastPollTime = millis();

        OrderStatusResult statusRes = ApiClient::checkOrderStatus(currentSubscribedOrder);
        if (statusRes.success) {
            if (statusRes.orderStatus == "DISPENSING") {
                StateMachine::setState(STATE_DISPENSING);
            } else if (statusRes.orderStatus == "DISPENSED") {
                progress.isComplete = true;
                progress.percentage = 100;
                Logger::info(TAG, "Backend reported order %s DISPENSED!", currentSubscribedOrder.c_str());
                StateMachine::setState(STATE_COMPLETED);
            } else if (statusRes.orderStatus == "FAILED") {
                progress.isFailed = true;
                progress.error = "Dispensing hardware reported an error";
                Logger::warn(TAG, "Backend reported order %s FAILED!", currentSubscribedOrder.c_str());
                StateMachine::setState(STATE_DISPENSING_FAILED);
            }
        }
    }
}

const DispenseProgressData& RealtimeManager::getProgress() {
    return progress;
}
