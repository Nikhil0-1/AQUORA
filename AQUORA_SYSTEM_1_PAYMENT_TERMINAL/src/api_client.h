#ifndef API_CLIENT_H
#define API_CLIENT_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include <vector>

struct ProductItem {
    String id;
    String name;
    String description;
    float price;
    int channelId;
    int volumeMl;
    std::vector<int> availableVolumes;
};

struct OrderCreateResult {
    bool success;
    String orderId;
    String orderNumber;
    float amount;
    String error;
};

struct PaymentIntentResult {
    bool success;
    String orderId;
    String qrData;
    String providerOrderId;
    float amount;
    String error;
};

struct OrderStatusResult {
    bool success;
    String orderId;
    String orderNumber;
    String paymentStatus;
    String orderStatus;
    bool isExpired;
    String error;
};

class ApiClient {
public:
    static bool fetchProducts(std::vector<ProductItem>& outProducts);
    static OrderCreateResult createOrder(const String& productId, int volumeMl, int channelId, int quantity = 1);
    static PaymentIntentResult createPayment(const String& orderId);
    static OrderStatusResult checkOrderStatus(const String& orderId);
};

#endif // API_CLIENT_H
