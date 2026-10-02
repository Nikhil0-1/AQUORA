#include "api_client.h"
#include "https_client.h"
#include "storage_manager.h"
#include "../include/api_config.h"
#include "logger.h"

static const char* TAG = "ApiClient";

bool ApiClient::fetchProducts(std::vector<ProductItem>& outProducts) {
    outProducts.clear();
    String url = StorageManager::getApiServerUrl() + ENDPOINT_PRODUCTS;
    Logger::info(TAG, "Fetching products from %s", url.c_str());

    HttpResponse res = HttpsClient::get(url);
    if (!res.success) {
        Logger::error(TAG, "Failed to fetch products: %s", res.error.c_str());
        return false;
    }

    DynamicJsonDocument doc(4096);
    DeserializationError err = deserializeJson(doc, res.payload);
    if (err) {
        Logger::error(TAG, "JSON parse error on products: %s", err.c_str());
        return false;
    }

    JsonArray array = doc.is<JsonArray>() ? doc.as<JsonArray>() : doc["data"].as<JsonArray>();
    for (JsonObject p : array) {
        ProductItem item;
        item.id = p["id"].as<String>();
        item.name = p["name"].as<String>();
        item.description = p["short_description"] | p["description"] | "";
        item.price = p["price"].as<float>();
        item.channelId = p["channel_id"] | 1;
        item.volumeMl = p["volume_ml"] | 100;

        item.availableVolumes.push_back(50);
        item.availableVolumes.push_back(100);
        item.availableVolumes.push_back(150);
        item.availableVolumes.push_back(250);
        item.availableVolumes.push_back(500);

        outProducts.push_back(item);
    }

    Logger::info(TAG, "Successfully loaded %d products", outProducts.size());
    return true;
}

OrderCreateResult ApiClient::createOrder(const String& productId, int volumeMl, int channelId) {
    OrderCreateResult result = { false, "", "", 0.0f, "" };
    String url = StorageManager::getApiServerUrl() + ENDPOINT_ORDERS;

    StaticJsonDocument<512> doc;
    doc["terminal_code"] = StorageManager::getTerminalCode();
    doc["machine_code"] = StorageManager::getAssignedDispenserCode();

    JsonArray items = doc.createNestedArray("items");
    JsonObject item = items.createNestedObject();
    item["product_id"] = productId;
    item["quantity"] = 1;
    item["volume_ml"] = volumeMl;
    item["channel_id"] = channelId;

    String jsonBody;
    serializeJson(doc, jsonBody);

    Logger::info(TAG, "Creating order: %s", jsonBody.c_str());
    HttpResponse res = HttpsClient::post(url, jsonBody);
    if (!res.success) {
        result.error = res.error;
        return result;
    }

    StaticJsonDocument<512> resDoc;
    deserializeJson(resDoc, res.payload);

    result.success = true;
    result.orderId = resDoc["id"].as<String>();
    result.orderNumber = resDoc["order_number"].as<String>();
    result.amount = resDoc["amount"].as<float>();

    Logger::info(TAG, "Order created: ID=%s, Number=%s, Amount=%.2f",
        result.orderId.c_str(), result.orderNumber.c_str(), result.amount);
    return result;
}

PaymentIntentResult ApiClient::createPayment(const String& orderId) {
    PaymentIntentResult result = { false, orderId, "", "", 0.0f, "" };
    String url = StorageManager::getApiServerUrl() + ENDPOINT_PAYMENTS_CREATE;

    StaticJsonDocument<512> doc;
    doc["order_id"] = orderId;
    doc["provider"] = "RAZORPAY";

    String jsonBody;
    serializeJson(doc, jsonBody);

    Logger::info(TAG, "Initiating payment for order %s", orderId.c_str());
    HttpResponse res = HttpsClient::post(url, jsonBody);
    if (!res.success) {
        result.error = res.error;
        return result;
    }

    StaticJsonDocument<512> resDoc;
    deserializeJson(resDoc, res.payload);

    result.success = true;
    result.qrData = resDoc["qr_code_data"].as<String>();
    result.providerOrderId = resDoc["provider_order_id"].as<String>();
    result.amount = resDoc["amount"].as<float>();

    Logger::info(TAG, "Payment intent generated. UPI QR payload: %s", result.qrData.c_str());
    return result;
}

OrderStatusResult ApiClient::checkOrderStatus(const String& orderId) {
    OrderStatusResult result = { false, orderId, "", "", "", false, "" };
    char endpoint[64];
    snprintf(endpoint, sizeof(endpoint), ENDPOINT_ORDER_STATUS, orderId.c_str());
    String url = StorageManager::getApiServerUrl() + String(endpoint);

    HttpResponse res = HttpsClient::get(url);
    if (!res.success) {
        result.error = res.error;
        return result;
    }

    StaticJsonDocument<512> resDoc;
    deserializeJson(resDoc, res.payload);

    result.success = true;
    result.orderNumber = resDoc["order_number"].as<String>();
    result.paymentStatus = resDoc["payment_status"].as<String>();
    result.orderStatus = resDoc["order_status"].as<String>();
    result.isExpired = resDoc["is_expired"] | false;

    return result;
}
