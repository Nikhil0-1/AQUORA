#include "ui_manager.h"
#include "order_manager.h"
#include "payment_manager.h"
#include "state_machine.h"
#include "logger.h"

static const char* TAG = "UiMgr";

lv_obj_t* UiManager::currentScreen = NULL;
lv_obj_t* UiManager::dispensingBar = NULL;
lv_obj_t* UiManager::dispensingLabel = NULL;

static void startButtonEventHandler(lv_event_t* e) {
    StateMachine::setState(STATE_SELECTING_PRODUCT);
}

static void productButtonEventHandler(lv_event_t* e) {
    ProductItem* p = (ProductItem*)lv_event_get_user_data(e);
    if (p) {
        OrderManager::selectProduct(*p);
        StateMachine::setState(STATE_SELECTING_VOLUME);
    }
}

static void volumeButtonEventHandler(lv_event_t* e) {
    int vol = (int)(intptr_t)lv_event_get_user_data(e);
    OrderManager::selectVolume(vol);
    StateMachine::setState(STATE_ORDER_REVIEW);
}

static void payButtonEventHandler(lv_event_t* e) {
    StateMachine::setState(STATE_PAYMENT_PENDING);
}

static void backToHomeEventHandler(lv_event_t* e) {
    StateMachine::setState(STATE_READY);
}

void UiManager::init() {
    Logger::info(TAG, "Initializing UI Manager theme and styles");
}

void UiManager::clearScreen() {
    if (currentScreen) {
        lv_obj_del(currentScreen);
        currentScreen = NULL;
    }
    dispensingBar = NULL;
    dispensingLabel = NULL;
}

void UiManager::showWelcomeScreen() {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, lv_color_make(10, 25, 47), 0); // Deep Navy

    // Title Label
    lv_obj_t* title = lv_label_create(currentScreen);
    lv_label_set_text(title, "AQUORA");
    lv_obj_set_style_text_color(title, lv_color_make(0, 230, 255), 0); // Aqua
    lv_obj_align(title, LV_ALIGN_TOP_MID, 0, 70);

    // Subtitle
    lv_obj_t* sub = lv_label_create(currentScreen);
    lv_label_set_text(sub, "SMART SANITIZER VENDING MACHINE\nPay. Dispense. Done.");
    lv_obj_set_style_text_align(sub, LV_TEXT_ALIGN_CENTER, 0);
    lv_obj_set_style_text_color(sub, lv_color_white(), 0);
    lv_obj_align(sub, LV_ALIGN_CENTER, 0, -20);

    // [ START ] Button
    lv_obj_t* btn = lv_btn_create(currentScreen);
    lv_obj_set_size(btn, 240, 70);
    lv_obj_align(btn, LV_ALIGN_BOTTOM_MID, 0, -60);
    lv_obj_set_style_bg_color(btn, lv_color_make(0, 180, 216), 0);
    lv_obj_set_style_radius(btn, 35, 0);
    lv_obj_add_event_cb(btn, startButtonEventHandler, LV_EVENT_CLICKED, NULL);

    lv_obj_t* btnLabel = lv_label_create(btn);
    lv_label_set_text(btnLabel, "TOUCH TO START");
    lv_obj_center(btnLabel);

    lv_scr_load(currentScreen);
}

void UiManager::showProductSelectionScreen(const std::vector<ProductItem>& products) {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, lv_color_make(15, 23, 42), 0);

    lv_obj_t* title = lv_label_create(currentScreen);
    lv_label_set_text(title, "SELECT SANITIZER FORMULA");
    lv_obj_set_style_text_color(title, lv_color_white(), 0);
    lv_obj_align(title, LV_ALIGN_TOP_MID, 0, 20);

    // Grid of product cards (horizontal flex container)
    lv_obj_t* cont = lv_obj_create(currentScreen);
    lv_obj_set_size(cont, 760, 380);
    lv_obj_align(cont, LV_ALIGN_BOTTOM_MID, 0, -10);
    lv_obj_set_flex_flow(cont, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(cont, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_set_style_bg_opa(cont, LV_OPA_TRANSP, 0);
    lv_obj_set_style_border_width(cont, 0, 0);

    for (size_t i = 0; i < products.size() && i < 5; i++) {
        lv_obj_t* card = lv_btn_create(cont);
        lv_obj_set_size(card, 138, 340);
        lv_obj_set_style_bg_color(card, lv_color_make(30, 41, 59), 0);
        lv_obj_set_style_radius(card, 16, 0);
        lv_obj_add_event_cb(card, productButtonEventHandler, LV_EVENT_CLICKED, (void*)&products[i]);

        lv_obj_t* name = lv_label_create(card);
        lv_label_set_text(name, products[i].name.c_str());
        lv_obj_set_style_text_align(name, LV_TEXT_ALIGN_CENTER, 0);
        lv_label_set_long_mode(name, LV_LABEL_LONG_WRAP);
        lv_obj_set_width(name, 120);
        lv_obj_align(name, LV_ALIGN_TOP_MID, 0, 20);

        lv_obj_t* price = lv_label_create(card);
        char priceStr[24];
        snprintf(priceStr, sizeof(priceStr), "INR %.0f", products[i].price);
        lv_label_set_text(price, priceStr);
        lv_obj_set_style_text_color(price, lv_color_make(0, 230, 255), 0);
        lv_obj_align(price, LV_ALIGN_BOTTOM_MID, 0, -20);
    }

    lv_scr_load(currentScreen);
}

void UiManager::showVolumeSelectionScreen() {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, lv_color_make(15, 23, 42), 0);

    const ProductItem& prod = OrderManager::getSelectedProduct();

    lv_obj_t* title = lv_label_create(currentScreen);
    char buf[64];
    snprintf(buf, sizeof(buf), "%s - SELECT VOLUME", prod.name.c_str());
    lv_label_set_text(title, buf);
    lv_obj_set_style_text_color(title, lv_color_white(), 0);
    lv_obj_align(title, LV_ALIGN_TOP_MID, 0, 30);

    // 5 volume options: 50, 100, 150, 250, 500
    int volumes[] = { 50, 100, 150, 250, 500 };
    int xOffsets[] = { 60, 200, 340, 480, 620 };

    for (int i = 0; i < 5; i++) {
        lv_obj_t* btn = lv_btn_create(currentScreen);
        lv_obj_set_size(btn, 120, 160);
        lv_obj_set_pos(btn, xOffsets[i], 150);
        lv_obj_set_style_bg_color(btn, lv_color_make(30, 41, 59), 0);
        lv_obj_set_style_radius(btn, 16, 0);
        lv_obj_add_event_cb(btn, volumeButtonEventHandler, LV_EVENT_CLICKED, (void*)(intptr_t)volumes[i]);

        lv_obj_t* volLabel = lv_label_create(btn);
        char volStr[16];
        snprintf(volStr, sizeof(volStr), "%d ml", volumes[i]);
        lv_label_set_text(volLabel, volStr);
        lv_obj_set_style_text_color(volLabel, lv_color_make(0, 230, 255), 0);
        lv_obj_align(volLabel, LV_ALIGN_CENTER, 0, 0);
    }

    lv_scr_load(currentScreen);
}

void UiManager::showOrderSummaryScreen() {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, lv_color_make(15, 23, 42), 0);

    const ProductItem& prod = OrderManager::getSelectedProduct();
    int volume = OrderManager::getSelectedVolume();
    float price = OrderManager::getCalculatedPrice();

    lv_obj_t* card = lv_obj_create(currentScreen);
    lv_obj_set_size(card, 500, 320);
    lv_obj_center(card);
    lv_obj_set_style_bg_color(card, lv_color_make(30, 41, 59), 0);
    lv_obj_set_style_radius(card, 20, 0);

    lv_obj_t* title = lv_label_create(card);
    lv_label_set_text(title, "ORDER SUMMARY");
    lv_obj_set_style_text_color(title, lv_color_white(), 0);
    lv_obj_align(title, LV_ALIGN_TOP_MID, 0, 15);

    lv_obj_t* details = lv_label_create(card);
    char buf[128];
    snprintf(buf, sizeof(buf), "Formula:  %s\nVolume:   %d ml\nTotal:    INR %.2f",
        prod.name.c_str(), volume, price);
    lv_label_set_text(details, buf);
    lv_obj_set_style_text_color(details, lv_color_make(220, 220, 220), 0);
    lv_obj_align(details, LV_ALIGN_CENTER, 0, -20);

    // [ PAY NOW ]
    lv_obj_t* payBtn = lv_btn_create(card);
    lv_obj_set_size(payBtn, 180, 50);
    lv_obj_align(payBtn, LV_ALIGN_BOTTOM_RIGHT, -20, -15);
    lv_obj_set_style_bg_color(payBtn, lv_color_make(0, 180, 216), 0);
    lv_obj_add_event_cb(payBtn, payButtonEventHandler, LV_EVENT_CLICKED, NULL);

    lv_obj_t* payLabel = lv_label_create(payBtn);
    lv_label_set_text(payLabel, "PAY NOW");
    lv_obj_center(payLabel);

    // [ BACK ]
    lv_obj_t* backBtn = lv_btn_create(card);
    lv_obj_set_size(backBtn, 140, 50);
    lv_obj_align(backBtn, LV_ALIGN_BOTTOM_LEFT, 20, -15);
    lv_obj_set_style_bg_color(backBtn, lv_color_make(71, 85, 105), 0);
    lv_obj_add_event_cb(backBtn, backToHomeEventHandler, LV_EVENT_CLICKED, NULL);

    lv_obj_t* backLabel = lv_label_create(backBtn);
    lv_label_set_text(backLabel, "CANCEL");
    lv_obj_center(backLabel);

    lv_scr_load(currentScreen);
}

void UiManager::showPaymentQrScreen(const String& qrPayload, const String& orderNumber, float amount) {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, lv_color_make(15, 23, 42), 0);

    // Left info card
    lv_obj_t* infoCard = lv_obj_create(currentScreen);
    lv_obj_set_size(infoCard, 360, 420);
    lv_obj_set_pos(infoCard, 30, 30);
    lv_obj_set_style_bg_color(infoCard, lv_color_make(30, 41, 59), 0);

    lv_obj_t* title = lv_label_create(infoCard);
    lv_label_set_text(title, "SCAN TO PAY");
    lv_obj_set_style_text_color(title, lv_color_make(0, 230, 255), 0);
    lv_obj_align(title, LV_ALIGN_TOP_LEFT, 10, 10);

    lv_obj_t* orderLbl = lv_label_create(infoCard);
    char buf[128];
    snprintf(buf, sizeof(buf), "Order: %s\nAmount: INR %.2f\n\nScan with any UPI App:\n* GPay, PhonePe, Paytm\n* Any BHIM UPI Scanner",
        orderNumber.c_str(), amount);
    lv_label_set_text(orderLbl, buf);
    lv_obj_set_style_text_color(orderLbl, lv_color_white(), 0);
    lv_obj_align(orderLbl, LV_ALIGN_LEFT_MID, 10, 0);

    // Right QR Container
    lv_obj_t* qrCard = lv_obj_create(currentScreen);
    lv_obj_set_size(qrCard, 360, 420);
    lv_obj_set_pos(qrCard, 410, 30);
    lv_obj_set_style_bg_color(qrCard, lv_color_white(), 0);

    // LVGL QR Code Widget (LV_USE_QRCODE in lv_conf.h)
    lv_obj_t* qr = lv_qrcode_create(qrCard, 280, lv_color_black(), lv_color_white());
    lv_qrcode_update(qr, qrPayload.c_str(), qrPayload.length());
    lv_obj_center(qr);

    lv_scr_load(currentScreen);
}

void UiManager::showDispensingScreen(const String& productName, int targetMl, int dispensedMl, int percentage) {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, lv_color_make(10, 25, 47), 0);

    lv_obj_t* title = lv_label_create(currentScreen);
    lv_label_set_text(title, "DISPENSING IN PROGRESS");
    lv_obj_set_style_text_color(title, lv_color_make(0, 230, 255), 0);
    lv_obj_align(title, LV_ALIGN_TOP_MID, 0, 40);

    dispensingBar = lv_bar_create(currentScreen);
    lv_obj_set_size(dispensingBar, 540, 30);
    lv_obj_center(dispensingBar);
    lv_bar_set_range(dispensingBar, 0, 100);
    lv_bar_set_value(dispensingBar, percentage, LV_ANIM_ON);
    lv_obj_set_style_bg_color(dispensingBar, lv_color_make(0, 230, 255), LV_PART_INDICATOR);

    dispensingLabel = lv_label_create(currentScreen);
    char buf[128];
    snprintf(buf, sizeof(buf), "%s: %d / %d ml (%d%%)",
        productName.c_str(), dispensedMl, targetMl, percentage);
    lv_label_set_text(dispensingLabel, buf);
    lv_obj_set_style_text_color(dispensingLabel, lv_color_white(), 0);
    lv_obj_align(dispensingLabel, LV_ALIGN_CENTER, 0, 40);

    lv_scr_load(currentScreen);
}

void UiManager::updateDispensingProgress(int dispensedMl, int percentage) {
    if (dispensingBar) {
        lv_bar_set_value(dispensingBar, percentage, LV_ANIM_ON);
    }
    if (dispensingLabel) {
        char buf[64];
        snprintf(buf, sizeof(buf), "Dispensed: %d ml (%d%%)", dispensedMl, percentage);
        lv_label_set_text(dispensingLabel, buf);
    }
}

void UiManager::showCompletionScreen(const String& productName, int volumeMl) {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, lv_color_make(10, 35, 20), 0); // Forest/Success tone

    lv_obj_t* title = lv_label_create(currentScreen);
    lv_label_set_text(title, "DISPENSING COMPLETE!");
    lv_obj_set_style_text_color(title, lv_color_make(50, 255, 120), 0);
    lv_obj_align(title, LV_ALIGN_CENTER, 0, -60);

    lv_obj_t* msg = lv_label_create(currentScreen);
    char buf[128];
    snprintf(buf, sizeof(buf), "%s (%d ml)\nThank you for choosing AQUORA.",
        productName.c_str(), volumeMl);
    lv_label_set_text(msg, buf);
    lv_obj_set_style_text_align(msg, LV_TEXT_ALIGN_CENTER, 0);
    lv_obj_set_style_text_color(msg, lv_color_white(), 0);
    lv_obj_align(msg, LV_ALIGN_CENTER, 0, 0);

    lv_obj_t* btn = lv_btn_create(currentScreen);
    lv_obj_set_size(btn, 200, 60);
    lv_obj_align(btn, LV_ALIGN_BOTTOM_MID, 0, -50);
    lv_obj_set_style_bg_color(btn, lv_color_make(34, 197, 94), 0);
    lv_obj_add_event_cb(btn, backToHomeEventHandler, LV_EVENT_CLICKED, NULL);

    lv_obj_t* btnLabel = lv_label_create(btn);
    lv_label_set_text(btnLabel, "DONE");
    lv_obj_center(btnLabel);

    lv_scr_load(currentScreen);
}

void UiManager::showErrorScreen(const char* title, const char* message) {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, lv_color_make(45, 15, 15), 0); // Muted Crimson

    lv_obj_t* t = lv_label_create(currentScreen);
    lv_label_set_text(t, title);
    lv_obj_set_style_text_color(t, lv_color_make(255, 80, 80), 0);
    lv_obj_align(t, LV_ALIGN_CENTER, 0, -40);

    lv_obj_t* m = lv_label_create(currentScreen);
    lv_label_set_text(m, message);
    lv_obj_set_style_text_color(m, lv_color_white(), 0);
    lv_obj_align(m, LV_ALIGN_CENTER, 0, 10);

    lv_obj_t* btn = lv_btn_create(currentScreen);
    lv_obj_set_size(btn, 180, 50);
    lv_obj_align(btn, LV_ALIGN_BOTTOM_MID, 0, -40);
    lv_obj_set_style_bg_color(btn, lv_color_make(180, 50, 50), 0);
    lv_obj_add_event_cb(btn, backToHomeEventHandler, LV_EVENT_CLICKED, NULL);

    lv_obj_t* btnLabel = lv_label_create(btn);
    lv_label_set_text(btnLabel, "RETURN HOME");
    lv_obj_center(btnLabel);

    lv_scr_load(currentScreen);
}
