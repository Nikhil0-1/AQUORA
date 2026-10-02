#ifndef ORDER_MANAGER_H
#define ORDER_MANAGER_H

#include <Arduino.h>
#include "api_client.h"

class OrderManager {
public:
    static void reset();
    static void selectProduct(const ProductItem& product);
    static void selectVolume(int volumeMl);
    static const ProductItem& getSelectedProduct();
    static int getSelectedVolume();
    static float getCalculatedPrice();
    static void setCreatedOrder(const String& orderId, const String& orderNumber, float amount);
    static const String& getOrderId();
    static const String& getOrderNumber();
    static float getAmount();

private:
    static ProductItem selectedProduct;
    static int selectedVolumeMl;
    static String currentOrderId;
    static String currentOrderNumber;
    static float finalAmount;
};

#endif // ORDER_MANAGER_H
