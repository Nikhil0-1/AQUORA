#include "order_manager.h"
#include "logger.h"

ProductItem OrderManager::selectedProduct = { "", "", "", 0.0f, 1, 100, {} };
int OrderManager::selectedVolumeMl = 100;
int OrderManager::selectedQuantity = 1;
String OrderManager::currentOrderId = "";
String OrderManager::currentOrderNumber = "";
float OrderManager::finalAmount = 0.0f;

static const char* TAG = "OrderMgr";

void OrderManager::reset() {
    selectedProduct = { "", "", "", 0.0f, 1, 100, {} };
    selectedVolumeMl = 100;
    selectedQuantity = 1;
    currentOrderId = "";
    currentOrderNumber = "";
    finalAmount = 0.0f;
    Logger::info(TAG, "Customer order session cleared");
}

void OrderManager::selectProduct(const ProductItem& product) {
    selectedProduct = product;
    selectedVolumeMl = product.volumeMl > 0 ? product.volumeMl : 100;
    selectedQuantity = 1;
    Logger::info(TAG, "Product selected: %s (Channel %d)", product.name.c_str(), product.channelId);
}

void OrderManager::selectVolume(int volumeMl) {
    selectedVolumeMl = volumeMl;
    Logger::info(TAG, "Volume selected: %d ml", volumeMl);
}

void OrderManager::setQuantity(int qty) {
    if (qty < 1) qty = 1;
    if (qty > 10) qty = 10;
    selectedQuantity = qty;
    Logger::info(TAG, "Quantity set: %d", selectedQuantity);
}

void OrderManager::incrementQuantity() {
    if (selectedQuantity < 10) {
        selectedQuantity++;
        Logger::info(TAG, "Quantity incremented to %d", selectedQuantity);
    }
}

void OrderManager::decrementQuantity() {
    if (selectedQuantity > 1) {
        selectedQuantity--;
        Logger::info(TAG, "Quantity decremented to %d", selectedQuantity);
    }
}

int OrderManager::getQuantity() {
    return selectedQuantity;
}

const ProductItem& OrderManager::getSelectedProduct() {
    return selectedProduct;
}

int OrderManager::getSelectedVolume() {
    return selectedVolumeMl;
}

float OrderManager::getCalculatedPrice() {
    float baseUnitPrice = selectedProduct.price;
    if (selectedProduct.volumeMl > 0) {
        float ratio = (float)selectedVolumeMl / (float)selectedProduct.volumeMl;
        baseUnitPrice = selectedProduct.price * ratio;
    }
    float total = baseUnitPrice * (float)selectedQuantity;
    return roundf(total * 100.0f) / 100.0f;
}

void OrderManager::setCreatedOrder(const String& orderId, const String& orderNumber, float amount) {
    currentOrderId = orderId;
    currentOrderNumber = orderNumber;
    finalAmount = amount;
}

const String& OrderManager::getOrderId() {
    return currentOrderId;
}

const String& OrderManager::getOrderNumber() {
    return currentOrderNumber;
}

float OrderManager::getAmount() {
    return finalAmount;
}
