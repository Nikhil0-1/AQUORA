#include "payment_manager.h"
#include "state_machine.h"
#include "logger.h"

static const char* TAG = "PaymentMgr";

PaymentStatusState PaymentManager::currentStatus = PAYMENT_NONE;
String PaymentManager::activeOrderId = "";
String PaymentManager::qrDataString = "";
unsigned long PaymentManager::lastPollTime = 0;
unsigned long PaymentManager::paymentStartTime = 0;

void PaymentManager::init() {
    currentStatus = PAYMENT_NONE;
    activeOrderId = "";
    qrDataString = "";
}

bool PaymentManager::startPayment(const String& orderId) {
    activeOrderId = orderId;
    Logger::info(TAG, "Requesting payment intent for order %s", orderId.c_str());

    PaymentIntentResult result = ApiClient::createPayment(orderId);
    if (!result.success) {
        currentStatus = PAYMENT_FAILED_ERROR;
        Logger::error(TAG, "Failed to create payment: %s", result.error.c_str());
        return false;
    }

    qrDataString = result.qrData;
    currentStatus = PAYMENT_QR_DISPLAYED;
    paymentStartTime = millis();
    lastPollTime = millis();

    Logger::info(TAG, "Payment QR ready. Awaiting backend webhook confirmation.");
    return true;
}

void PaymentManager::update() {
    if (currentStatus != PAYMENT_QR_DISPLAYED) return;

    if (millis() - paymentStartTime > PAYMENT_EXPIRY_MS) {
        currentStatus = PAYMENT_TIMEOUT;
        Logger::warn(TAG, "Payment window timed out for order %s", activeOrderId.c_str());
        StateMachine::setState(STATE_PAYMENT_FAILED);
        return;
    }

    if (millis() - lastPollTime >= POLL_INTERVAL_MS) {
        lastPollTime = millis();

        OrderStatusResult statusRes = ApiClient::checkOrderStatus(activeOrderId);
        if (statusRes.success) {
            if (statusRes.paymentStatus == "PAID") {
                currentStatus = PAYMENT_VERIFIED_PAID;
                Logger::info(TAG, "Payment verified as PAID by backend!");
                StateMachine::setState(STATE_PAYMENT_SUCCESS);
            } else if (statusRes.paymentStatus == "FAILED" || statusRes.paymentStatus == "CANCELLED") {
                currentStatus = PAYMENT_FAILED_ERROR;
                Logger::warn(TAG, "Payment failed or cancelled on gateway");
                StateMachine::setState(STATE_PAYMENT_FAILED);
            }
        }
    }
}

PaymentStatusState PaymentManager::getStatus() {
    return currentStatus;
}

const String& PaymentManager::getQrPayload() {
    return qrDataString;
}

void PaymentManager::cancel() {
    currentStatus = PAYMENT_NONE;
    activeOrderId = "";
    qrDataString = "";
}
