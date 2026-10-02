#ifndef PAYMENT_MANAGER_H
#define PAYMENT_MANAGER_H

#include <Arduino.h>
#include "api_client.h"

enum PaymentStatusState {
    PAYMENT_NONE = 0,
    PAYMENT_QR_DISPLAYED,
    PAYMENT_VERIFIED_PAID,
    PAYMENT_TIMEOUT,
    PAYMENT_FAILED_ERROR
};

class PaymentManager {
public:
    static void init();
    static bool startPayment(const String& orderId);
    static void update();
    static PaymentStatusState getStatus();
    static const String& getQrPayload();
    static void cancel();

private:
    static PaymentStatusState currentStatus;
    static String activeOrderId;
    static String qrDataString;
    static unsigned long lastPollTime;
    static unsigned long paymentStartTime;
    static const unsigned long POLL_INTERVAL_MS = 1500;
    static const unsigned long PAYMENT_EXPIRY_MS = 180000; // 3 min
};

#endif // PAYMENT_MANAGER_H
