#ifndef UI_MANAGER_H
#define UI_MANAGER_H

#include <Arduino.h>
#include <lvgl.h>
#include <vector>
#include "api_client.h"

class UiManager {
public:
    static void init();
    static void showWelcomeScreen();
    static void showProductSelectionScreen(const std::vector<ProductItem>& products);
    static void showVolumeSelectionScreen();
    static void showOrderSummaryScreen();
    static void showPaymentQrScreen(const String& qrPayload, const String& orderNumber, float amount);
    static void showDispensingScreen(const String& productName, int targetMl, int dispensedMl, int percentage);
    static void updateDispensingProgress(int dispensedMl, int percentage);
    static void showCompletionScreen(const String& productName, int volumeMl);
    static void showErrorScreen(const char* title, const char* message);

private:
    static lv_obj_t* currentScreen;
    static lv_obj_t* dispensingBar;
    static lv_obj_t* dispensingLabel;
    static void clearScreen();
};

#endif // UI_MANAGER_H
