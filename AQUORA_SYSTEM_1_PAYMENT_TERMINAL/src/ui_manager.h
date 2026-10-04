#ifndef UI_MANAGER_H
#define UI_MANAGER_H

#include <Arduino.h>
#include <lvgl.h>
#include <vector>
#include "api_client.h"

class UiManager {
public:
    static void init();

    // Screen lifecycle
    static void showWifiConnectingScreen();
    static void showNetworkErrorScreen();
    static void showWelcomeScreen();
    static void showProductSelectionScreen(const std::vector<ProductItem>& products);
    static void showVolumeSelectionScreen(const std::vector<int>& volumes);
    static void showQuantityScreen();
    static void showCartScreen();
    static void showPaymentQrScreen(const String& qrPayload, const String& orderNumber, float amount);
    static void showPaymentProcessingScreen();
    static void showPaymentSuccessScreen();
    static void showDispensingScreen(const String& productName, int targetMl, int dispensedMl, int percentage);
    static void updateDispensingProgress(int dispensedMl, int percentage);
    static void showCompletionScreen(const String& productName, int volumeMl);
    static void showErrorScreen(const char* title, const char* message);

    // Non-blocking auto-return timer
    static void startAutoReturnTimer(unsigned long delayMs);
    static bool isAutoReturnExpired();

private:
    static lv_obj_t* currentScreen;
    static lv_obj_t* dispensingBar;
    static lv_obj_t* dispensingLabel;
    static unsigned long autoReturnStartTime;
    static unsigned long autoReturnDuration;
    static bool autoReturnActive;
    static void clearScreen();
};

#endif // UI_MANAGER_H
