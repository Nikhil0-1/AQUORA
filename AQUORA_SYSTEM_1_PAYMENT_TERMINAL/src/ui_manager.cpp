#include "ui_manager.h"
#include "order_manager.h"
#include "payment_manager.h"
#include "state_machine.h"
#include "logger.h"

static const char* TAG = "UiMgr";

lv_obj_t* UiManager::currentScreen = NULL;
lv_obj_t* UiManager::dispensingBar = NULL;
lv_obj_t* UiManager::dispensingLabel = NULL;
unsigned long UiManager::autoReturnStartTime = 0;
unsigned long UiManager::autoReturnDuration = 0;
bool UiManager::autoReturnActive = false;

// ============================================================
// Color Palette — Deep Ocean / Aqua Premium Theme
// ============================================================
static const lv_color_t COL_BG_PRIMARY   = lv_color_make(10, 25, 47);     // Deep Navy
static const lv_color_t COL_BG_CARD      = lv_color_make(15, 23, 42);     // Slate-900
static const lv_color_t COL_BG_SURFACE   = lv_color_make(30, 41, 59);     // Slate-800
static const lv_color_t COL_ACCENT       = lv_color_make(0, 180, 216);    // Cyan CTA
static const lv_color_t COL_AQUA         = lv_color_make(0, 230, 255);    // Bright Aqua
static const lv_color_t COL_GREEN        = lv_color_make(34, 197, 94);    // Success Green
static const lv_color_t COL_RED          = lv_color_make(239, 68, 68);    // Error Red
static const lv_color_t COL_WHITE        = lv_color_make(255, 255, 255);
static const lv_color_t COL_TEXT_DIM     = lv_color_make(148, 163, 184);  // Slate-400
static const lv_color_t COL_BG_SUCCESS   = lv_color_make(10, 35, 20);
static const lv_color_t COL_BG_ERROR     = lv_color_make(45, 15, 15);
static const lv_color_t COL_BTN_CANCEL   = lv_color_make(71, 85, 105);

// ============================================================
// Touch debounce helper — prevents double taps for 400ms
// ============================================================
static unsigned long lastTouchEventTime = 0;
static bool debounceTouch() {
    unsigned long now = millis();
    if (now - lastTouchEventTime < 400) return true;
    lastTouchEventTime = now;
    return false;
}

// ============================================================
// Event Handlers
// ============================================================
static void startButtonEventHandler(lv_event_t* e) {
    if (debounceTouch()) return;
    StateMachine::setState(STATE_SELECTING_PRODUCT);
}

static void productButtonEventHandler(lv_event_t* e) {
    if (debounceTouch()) return;
    ProductItem* p = (ProductItem*)lv_event_get_user_data(e);
    if (p) {
        OrderManager::selectProduct(*p);
        StateMachine::setState(STATE_SELECTING_VOLUME);
    }
}

static void volumeButtonEventHandler(lv_event_t* e) {
    if (debounceTouch()) return;
    int vol = (int)(intptr_t)lv_event_get_user_data(e);
    OrderManager::selectVolume(vol);
    StateMachine::setState(STATE_SELECTING_QUANTITY);
}

static void quantityPlusHandler(lv_event_t* e) {
    if (debounceTouch()) return;
    OrderManager::incrementQuantity();
    StateMachine::setState(STATE_SELECTING_QUANTITY); // re-render
}

static void quantityMinusHandler(lv_event_t* e) {
    if (debounceTouch()) return;
    OrderManager::decrementQuantity();
    StateMachine::setState(STATE_SELECTING_QUANTITY); // re-render
}

static void continueToCartHandler(lv_event_t* e) {
    if (debounceTouch()) return;
    StateMachine::setState(STATE_ORDER_REVIEW);
}

static void payButtonEventHandler(lv_event_t* e) {
    if (debounceTouch()) return;
    StateMachine::setState(STATE_PAYMENT_PENDING);
}

static void backToHomeEventHandler(lv_event_t* e) {
    if (debounceTouch()) return;
    OrderManager::reset();
    StateMachine::setState(STATE_READY);
}

static void backToProductsHandler(lv_event_t* e) {
    if (debounceTouch()) return;
    StateMachine::setState(STATE_SELECTING_PRODUCT);
}

static void backToVolumeHandler(lv_event_t* e) {
    if (debounceTouch()) return;
    StateMachine::setState(STATE_SELECTING_VOLUME);
}

static void backToQuantityHandler(lv_event_t* e) {
    if (debounceTouch()) return;
    StateMachine::setState(STATE_SELECTING_QUANTITY);
}

// ============================================================
// Initialization & Utilities
// ============================================================
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

void UiManager::startAutoReturnTimer(unsigned long delayMs) {
    autoReturnStartTime = millis();
    autoReturnDuration = delayMs;
    autoReturnActive = true;
}

bool UiManager::isAutoReturnExpired() {
    if (!autoReturnActive) return false;
    if (millis() - autoReturnStartTime >= autoReturnDuration) {
        autoReturnActive = false;
        return true;
    }
    return false;
}

// ============================================================
// SCREEN: WiFi Connecting
// ============================================================
void UiManager::showWifiConnectingScreen() {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, COL_BG_PRIMARY, 0);

    lv_obj_t* title = lv_label_create(currentScreen);
    lv_label_set_text(title, LV_SYMBOL_WIFI "  AQUORA");
    lv_obj_set_style_text_color(title, COL_AQUA, 0);
    lv_obj_align(title, LV_ALIGN_CENTER, 0, -50);

    lv_obj_t* spinner = lv_spinner_create(currentScreen, 1000, 60);
    lv_obj_set_size(spinner, 50, 50);
    lv_obj_align(spinner, LV_ALIGN_CENTER, 0, 20);

    lv_obj_t* msg = lv_label_create(currentScreen);
    lv_label_set_text(msg, "Connecting to network...");
    lv_obj_set_style_text_color(msg, COL_TEXT_DIM, 0);
    lv_obj_align(msg, LV_ALIGN_CENTER, 0, 70);

    lv_scr_load(currentScreen);
}

// ============================================================
// SCREEN: Network Error
// ============================================================
void UiManager::showNetworkErrorScreen() {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, COL_BG_ERROR, 0);

    lv_obj_t* title = lv_label_create(currentScreen);
    lv_label_set_text(title, LV_SYMBOL_WARNING "  Network Unavailable");
    lv_obj_set_style_text_color(title, COL_RED, 0);
    lv_obj_align(title, LV_ALIGN_CENTER, 0, -40);

    lv_obj_t* msg = lv_label_create(currentScreen);
    lv_label_set_text(msg, "Unable to connect to WiFi.\nRetrying automatically...");
    lv_obj_set_style_text_align(msg, LV_TEXT_ALIGN_CENTER, 0);
    lv_obj_set_style_text_color(msg, COL_WHITE, 0);
    lv_obj_align(msg, LV_ALIGN_CENTER, 0, 10);

    lv_obj_t* spinner = lv_spinner_create(currentScreen, 1200, 60);
    lv_obj_set_size(spinner, 40, 40);
    lv_obj_align(spinner, LV_ALIGN_CENTER, 0, 70);

    lv_scr_load(currentScreen);
}

// ============================================================
// SCREEN: Welcome / Landing Page
// ============================================================
void UiManager::showWelcomeScreen() {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, COL_BG_PRIMARY, 0);

    // Brand Title
    lv_obj_t* title = lv_label_create(currentScreen);
    lv_label_set_text(title, "AQUORA");
    lv_obj_set_style_text_color(title, COL_AQUA, 0);
    lv_obj_align(title, LV_ALIGN_TOP_MID, 0, 80);

    // Tagline
    lv_obj_t* sub = lv_label_create(currentScreen);
    lv_label_set_text(sub, "Smart Sanitizer Dispensing");
    lv_obj_set_style_text_align(sub, LV_TEXT_ALIGN_CENTER, 0);
    lv_obj_set_style_text_color(sub, COL_WHITE, 0);
    lv_obj_align(sub, LV_ALIGN_CENTER, 0, -30);

    // Accent Divider Line
    lv_obj_t* line = lv_obj_create(currentScreen);
    lv_obj_set_size(line, 200, 3);
    lv_obj_set_style_bg_color(line, COL_ACCENT, 0);
    lv_obj_set_style_border_width(line, 0, 0);
    lv_obj_set_style_radius(line, 2, 0);
    lv_obj_align(line, LV_ALIGN_CENTER, 0, 0);

    // CTA Button
    lv_obj_t* btn = lv_btn_create(currentScreen);
    lv_obj_set_size(btn, 280, 70);
    lv_obj_align(btn, LV_ALIGN_BOTTOM_MID, 0, -70);
    lv_obj_set_style_bg_color(btn, COL_ACCENT, 0);
    lv_obj_set_style_radius(btn, 35, 0);
    lv_obj_set_style_shadow_width(btn, 20, 0);
    lv_obj_set_style_shadow_color(btn, lv_color_make(0, 180, 216), 0);
    lv_obj_set_style_shadow_opa(btn, LV_OPA_30, 0);
    lv_obj_add_event_cb(btn, startButtonEventHandler, LV_EVENT_CLICKED, NULL);

    lv_obj_t* btnLabel = lv_label_create(btn);
    lv_label_set_text(btnLabel, LV_SYMBOL_PLAY "  START ORDER");
    lv_obj_center(btnLabel);

    lv_scr_load(currentScreen);
    Logger::info(TAG, "Landing screen displayed");
}

// ============================================================
// SCREEN: Product Selection (fetched from backend)
// ============================================================
void UiManager::showProductSelectionScreen(const std::vector<ProductItem>& products) {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, COL_BG_CARD, 0);

    // Header row
    lv_obj_t* header = lv_obj_create(currentScreen);
    lv_obj_set_size(header, 800, 55);
    lv_obj_set_pos(header, 0, 0);
    lv_obj_set_style_bg_color(header, COL_BG_SURFACE, 0);
    lv_obj_set_style_border_width(header, 0, 0);
    lv_obj_set_style_radius(header, 0, 0);

    lv_obj_t* backBtn = lv_btn_create(header);
    lv_obj_set_size(backBtn, 90, 38);
    lv_obj_align(backBtn, LV_ALIGN_LEFT_MID, 8, 0);
    lv_obj_set_style_bg_color(backBtn, COL_BTN_CANCEL, 0);
    lv_obj_set_style_radius(backBtn, 8, 0);
    lv_obj_add_event_cb(backBtn, backToHomeEventHandler, LV_EVENT_CLICKED, NULL);
    lv_obj_t* backLbl = lv_label_create(backBtn);
    lv_label_set_text(backLbl, LV_SYMBOL_LEFT " BACK");
    lv_obj_center(backLbl);

    lv_obj_t* title = lv_label_create(header);
    lv_label_set_text(title, "SELECT SANITIZER");
    lv_obj_set_style_text_color(title, COL_WHITE, 0);
    lv_obj_align(title, LV_ALIGN_CENTER, 0, 0);

    // Product Cards Container
    lv_obj_t* cont = lv_obj_create(currentScreen);
    lv_obj_set_size(cont, 780, 400);
    lv_obj_set_pos(cont, 10, 65);
    lv_obj_set_flex_flow(cont, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(cont, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_set_style_bg_opa(cont, LV_OPA_TRANSP, 0);
    lv_obj_set_style_border_width(cont, 0, 0);
    lv_obj_set_style_pad_column(cont, 12, 0);

    int cardWidth = (products.size() <= 3) ? 220 : (products.size() <= 4) ? 170 : 140;

    for (size_t i = 0; i < products.size() && i < 5; i++) {
        lv_obj_t* card = lv_btn_create(cont);
        lv_obj_set_size(card, cardWidth, 350);
        lv_obj_set_style_bg_color(card, COL_BG_SURFACE, 0);
        lv_obj_set_style_radius(card, 16, 0);
        lv_obj_set_flex_flow(card, LV_FLEX_FLOW_COLUMN);
        lv_obj_set_flex_align(card, LV_FLEX_ALIGN_SPACE_BETWEEN, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
        lv_obj_set_style_pad_ver(card, 20, 0);
        lv_obj_add_event_cb(card, productButtonEventHandler, LV_EVENT_CLICKED, (void*)&products[i]);

        // Product icon placeholder
        lv_obj_t* icon = lv_label_create(card);
        lv_label_set_text(icon, LV_SYMBOL_SETTINGS);
        lv_obj_set_style_text_color(icon, COL_AQUA, 0);

        // Product name
        lv_obj_t* name = lv_label_create(card);
        lv_label_set_text(name, products[i].name.c_str());
        lv_obj_set_style_text_align(name, LV_TEXT_ALIGN_CENTER, 0);
        lv_obj_set_style_text_color(name, COL_WHITE, 0);
        lv_label_set_long_mode(name, LV_LABEL_LONG_WRAP);
        lv_obj_set_width(name, cardWidth - 20);

        // Description
        if (products[i].description.length() > 0) {
            lv_obj_t* desc = lv_label_create(card);
            lv_label_set_text(desc, products[i].description.c_str());
            lv_obj_set_style_text_color(desc, COL_TEXT_DIM, 0);
            lv_obj_set_style_text_align(desc, LV_TEXT_ALIGN_CENTER, 0);
            lv_label_set_long_mode(desc, LV_LABEL_LONG_WRAP);
            lv_obj_set_width(desc, cardWidth - 20);
        }

        // Price
        lv_obj_t* price = lv_label_create(card);
        char priceStr[24];
        snprintf(priceStr, sizeof(priceStr), LV_SYMBOL_CHARGE " INR %.0f", products[i].price);
        lv_label_set_text(price, priceStr);
        lv_obj_set_style_text_color(price, COL_AQUA, 0);
    }

    lv_scr_load(currentScreen);
    Logger::info(TAG, "Product selection screen displayed (%d products)", products.size());
}

// ============================================================
// SCREEN: Volume Selection (from backend variants)
// ============================================================
void UiManager::showVolumeSelectionScreen(const std::vector<int>& volumes) {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, COL_BG_CARD, 0);

    const ProductItem& prod = OrderManager::getSelectedProduct();

    // Header
    lv_obj_t* header = lv_obj_create(currentScreen);
    lv_obj_set_size(header, 800, 55);
    lv_obj_set_pos(header, 0, 0);
    lv_obj_set_style_bg_color(header, COL_BG_SURFACE, 0);
    lv_obj_set_style_border_width(header, 0, 0);
    lv_obj_set_style_radius(header, 0, 0);

    lv_obj_t* backBtn = lv_btn_create(header);
    lv_obj_set_size(backBtn, 90, 38);
    lv_obj_align(backBtn, LV_ALIGN_LEFT_MID, 8, 0);
    lv_obj_set_style_bg_color(backBtn, COL_BTN_CANCEL, 0);
    lv_obj_set_style_radius(backBtn, 8, 0);
    lv_obj_add_event_cb(backBtn, backToProductsHandler, LV_EVENT_CLICKED, NULL);
    lv_obj_t* backLbl = lv_label_create(backBtn);
    lv_label_set_text(backLbl, LV_SYMBOL_LEFT " BACK");
    lv_obj_center(backLbl);

    lv_obj_t* title = lv_label_create(header);
    char titleBuf[64];
    snprintf(titleBuf, sizeof(titleBuf), "%s — Select Volume", prod.name.c_str());
    lv_label_set_text(title, titleBuf);
    lv_obj_set_style_text_color(title, COL_WHITE, 0);
    lv_obj_align(title, LV_ALIGN_CENTER, 0, 0);

    // Volume buttons
    int count = volumes.size();
    if (count > 5) count = 5;
    int totalWidth = count * 130 + (count - 1) * 12;
    int startX = (800 - totalWidth) / 2;

    for (int i = 0; i < count; i++) {
        lv_obj_t* btn = lv_btn_create(currentScreen);
        lv_obj_set_size(btn, 130, 180);
        lv_obj_set_pos(btn, startX + i * 142, 140);
        lv_obj_set_style_bg_color(btn, COL_BG_SURFACE, 0);
        lv_obj_set_style_radius(btn, 16, 0);
        lv_obj_set_flex_flow(btn, LV_FLEX_FLOW_COLUMN);
        lv_obj_set_flex_align(btn, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
        lv_obj_add_event_cb(btn, volumeButtonEventHandler, LV_EVENT_CLICKED, (void*)(intptr_t)volumes[i]);

        lv_obj_t* icon = lv_label_create(btn);
        lv_label_set_text(icon, LV_SYMBOL_SETTINGS);
        lv_obj_set_style_text_color(icon, COL_AQUA, 0);

        lv_obj_t* volLabel = lv_label_create(btn);
        char volStr[16];
        snprintf(volStr, sizeof(volStr), "%d ml", volumes[i]);
        lv_label_set_text(volLabel, volStr);
        lv_obj_set_style_text_color(volLabel, COL_WHITE, 0);

        // Show calculated price per volume
        float unitPrice = prod.price;
        if (prod.volumeMl > 0) {
            unitPrice = prod.price * ((float)volumes[i] / (float)prod.volumeMl);
        }
        lv_obj_t* priceLabel = lv_label_create(btn);
        char prBuf[16];
        snprintf(prBuf, sizeof(prBuf), "INR %.0f", unitPrice);
        lv_label_set_text(priceLabel, prBuf);
        lv_obj_set_style_text_color(priceLabel, COL_AQUA, 0);
    }

    lv_scr_load(currentScreen);
    Logger::info(TAG, "Volume selection screen displayed (%d options)", count);
}

// ============================================================
// SCREEN: Quantity Selection
// ============================================================
void UiManager::showQuantityScreen() {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, COL_BG_CARD, 0);

    const ProductItem& prod = OrderManager::getSelectedProduct();
    int volume = OrderManager::getSelectedVolume();
    int qty = OrderManager::getQuantity();
    float unitPrice = OrderManager::getCalculatedPrice();
    float totalPrice = unitPrice * qty;

    // Header
    lv_obj_t* header = lv_obj_create(currentScreen);
    lv_obj_set_size(header, 800, 55);
    lv_obj_set_pos(header, 0, 0);
    lv_obj_set_style_bg_color(header, COL_BG_SURFACE, 0);
    lv_obj_set_style_border_width(header, 0, 0);
    lv_obj_set_style_radius(header, 0, 0);

    lv_obj_t* backBtn = lv_btn_create(header);
    lv_obj_set_size(backBtn, 90, 38);
    lv_obj_align(backBtn, LV_ALIGN_LEFT_MID, 8, 0);
    lv_obj_set_style_bg_color(backBtn, COL_BTN_CANCEL, 0);
    lv_obj_set_style_radius(backBtn, 8, 0);
    lv_obj_add_event_cb(backBtn, backToVolumeHandler, LV_EVENT_CLICKED, NULL);
    lv_obj_t* backLbl = lv_label_create(backBtn);
    lv_label_set_text(backLbl, LV_SYMBOL_LEFT " BACK");
    lv_obj_center(backLbl);

    lv_obj_t* titleLbl = lv_label_create(header);
    lv_label_set_text(titleLbl, "SELECT QUANTITY");
    lv_obj_set_style_text_color(titleLbl, COL_WHITE, 0);
    lv_obj_align(titleLbl, LV_ALIGN_CENTER, 0, 0);

    // Product info card
    lv_obj_t* infoCard = lv_obj_create(currentScreen);
    lv_obj_set_size(infoCard, 500, 120);
    lv_obj_align(infoCard, LV_ALIGN_TOP_MID, 0, 75);
    lv_obj_set_style_bg_color(infoCard, COL_BG_SURFACE, 0);
    lv_obj_set_style_radius(infoCard, 12, 0);
    lv_obj_set_style_border_width(infoCard, 0, 0);

    lv_obj_t* prodInfo = lv_label_create(infoCard);
    char infoBuf[128];
    snprintf(infoBuf, sizeof(infoBuf), "%s  •  %d ml  •  INR %.2f each", prod.name.c_str(), volume, unitPrice);
    lv_label_set_text(prodInfo, infoBuf);
    lv_obj_set_style_text_color(prodInfo, COL_WHITE, 0);
    lv_obj_align(prodInfo, LV_ALIGN_TOP_MID, 0, 15);

    lv_obj_t* totalLbl = lv_label_create(infoCard);
    char totBuf[64];
    snprintf(totBuf, sizeof(totBuf), "Total: INR %.2f", totalPrice);
    lv_label_set_text(totalLbl, totBuf);
    lv_obj_set_style_text_color(totalLbl, COL_AQUA, 0);
    lv_obj_align(totalLbl, LV_ALIGN_BOTTOM_MID, 0, -15);

    // Quantity controls
    lv_obj_t* qtyRow = lv_obj_create(currentScreen);
    lv_obj_set_size(qtyRow, 400, 100);
    lv_obj_align(qtyRow, LV_ALIGN_CENTER, 0, 40);
    lv_obj_set_style_bg_opa(qtyRow, LV_OPA_TRANSP, 0);
    lv_obj_set_style_border_width(qtyRow, 0, 0);
    lv_obj_set_flex_flow(qtyRow, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(qtyRow, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_set_style_pad_column(qtyRow, 30, 0);

    // MINUS
    lv_obj_t* minusBtn = lv_btn_create(qtyRow);
    lv_obj_set_size(minusBtn, 80, 80);
    lv_obj_set_style_bg_color(minusBtn, COL_BTN_CANCEL, 0);
    lv_obj_set_style_radius(minusBtn, 40, 0);
    lv_obj_add_event_cb(minusBtn, quantityMinusHandler, LV_EVENT_CLICKED, NULL);
    lv_obj_t* minusLbl = lv_label_create(minusBtn);
    lv_label_set_text(minusLbl, LV_SYMBOL_MINUS);
    lv_obj_center(minusLbl);

    // Quantity display
    lv_obj_t* qtyDisplay = lv_label_create(qtyRow);
    char qtyStr[8];
    snprintf(qtyStr, sizeof(qtyStr), "%d", qty);
    lv_label_set_text(qtyDisplay, qtyStr);
    lv_obj_set_style_text_color(qtyDisplay, COL_WHITE, 0);

    // PLUS
    lv_obj_t* plusBtn = lv_btn_create(qtyRow);
    lv_obj_set_size(plusBtn, 80, 80);
    lv_obj_set_style_bg_color(plusBtn, COL_ACCENT, 0);
    lv_obj_set_style_radius(plusBtn, 40, 0);
    lv_obj_add_event_cb(plusBtn, quantityPlusHandler, LV_EVENT_CLICKED, NULL);
    lv_obj_t* plusLbl = lv_label_create(plusBtn);
    lv_label_set_text(plusLbl, LV_SYMBOL_PLUS);
    lv_obj_center(plusLbl);

    // Continue button
    lv_obj_t* contBtn = lv_btn_create(currentScreen);
    lv_obj_set_size(contBtn, 260, 60);
    lv_obj_align(contBtn, LV_ALIGN_BOTTOM_MID, 0, -30);
    lv_obj_set_style_bg_color(contBtn, COL_GREEN, 0);
    lv_obj_set_style_radius(contBtn, 30, 0);
    lv_obj_add_event_cb(contBtn, continueToCartHandler, LV_EVENT_CLICKED, NULL);
    lv_obj_t* contLbl = lv_label_create(contBtn);
    lv_label_set_text(contLbl, "CONTINUE " LV_SYMBOL_RIGHT);
    lv_obj_center(contLbl);

    lv_scr_load(currentScreen);
}

// ============================================================
// SCREEN: Cart / Order Summary
// ============================================================
void UiManager::showCartScreen() {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, COL_BG_CARD, 0);

    const ProductItem& prod = OrderManager::getSelectedProduct();
    int volume = OrderManager::getSelectedVolume();
    int qty = OrderManager::getQuantity();
    float unitPrice = OrderManager::getCalculatedPrice();
    float total = unitPrice * qty;

    // Header
    lv_obj_t* header = lv_obj_create(currentScreen);
    lv_obj_set_size(header, 800, 55);
    lv_obj_set_pos(header, 0, 0);
    lv_obj_set_style_bg_color(header, COL_BG_SURFACE, 0);
    lv_obj_set_style_border_width(header, 0, 0);
    lv_obj_set_style_radius(header, 0, 0);

    lv_obj_t* backBtn = lv_btn_create(header);
    lv_obj_set_size(backBtn, 90, 38);
    lv_obj_align(backBtn, LV_ALIGN_LEFT_MID, 8, 0);
    lv_obj_set_style_bg_color(backBtn, COL_BTN_CANCEL, 0);
    lv_obj_set_style_radius(backBtn, 8, 0);
    lv_obj_add_event_cb(backBtn, backToQuantityHandler, LV_EVENT_CLICKED, NULL);
    lv_obj_t* backLbl = lv_label_create(backBtn);
    lv_label_set_text(backLbl, LV_SYMBOL_LEFT " BACK");
    lv_obj_center(backLbl);

    lv_obj_t* headerTitle = lv_label_create(header);
    lv_label_set_text(headerTitle, LV_SYMBOL_LIST "  ORDER SUMMARY");
    lv_obj_set_style_text_color(headerTitle, COL_WHITE, 0);
    lv_obj_align(headerTitle, LV_ALIGN_CENTER, 0, 0);

    // Cart card
    lv_obj_t* card = lv_obj_create(currentScreen);
    lv_obj_set_size(card, 600, 260);
    lv_obj_align(card, LV_ALIGN_TOP_MID, 0, 70);
    lv_obj_set_style_bg_color(card, COL_BG_SURFACE, 0);
    lv_obj_set_style_radius(card, 16, 0);
    lv_obj_set_style_border_width(card, 0, 0);

    // Item details
    char detailsBuf[256];
    snprintf(detailsBuf, sizeof(detailsBuf),
        "Product:      %s\n"
        "Volume:       %d ml\n"
        "Quantity:     %d\n"
        "Unit Price:   INR %.2f\n"
        "─────────────────────────\n"
        "TOTAL:        INR %.2f",
        prod.name.c_str(), volume, qty, unitPrice, total);

    lv_obj_t* details = lv_label_create(card);
    lv_label_set_text(details, detailsBuf);
    lv_obj_set_style_text_color(details, COL_WHITE, 0);
    lv_obj_align(details, LV_ALIGN_TOP_LEFT, 25, 20);

    // Total badge
    lv_obj_t* totalBadge = lv_obj_create(card);
    lv_obj_set_size(totalBadge, 180, 50);
    lv_obj_align(totalBadge, LV_ALIGN_BOTTOM_RIGHT, -15, -15);
    lv_obj_set_style_bg_color(totalBadge, COL_ACCENT, 0);
    lv_obj_set_style_radius(totalBadge, 12, 0);
    lv_obj_set_style_border_width(totalBadge, 0, 0);
    lv_obj_t* totalText = lv_label_create(totalBadge);
    char totStr[32];
    snprintf(totStr, sizeof(totStr), "INR %.2f", total);
    lv_label_set_text(totalText, totStr);
    lv_obj_set_style_text_color(totalText, COL_WHITE, 0);
    lv_obj_center(totalText);

    // Buttons row
    lv_obj_t* cancelBtn = lv_btn_create(currentScreen);
    lv_obj_set_size(cancelBtn, 200, 60);
    lv_obj_align(cancelBtn, LV_ALIGN_BOTTOM_LEFT, 60, -35);
    lv_obj_set_style_bg_color(cancelBtn, COL_BTN_CANCEL, 0);
    lv_obj_set_style_radius(cancelBtn, 30, 0);
    lv_obj_add_event_cb(cancelBtn, backToHomeEventHandler, LV_EVENT_CLICKED, NULL);
    lv_obj_t* cancelLbl = lv_label_create(cancelBtn);
    lv_label_set_text(cancelLbl, LV_SYMBOL_CLOSE "  CANCEL");
    lv_obj_center(cancelLbl);

    lv_obj_t* checkoutBtn = lv_btn_create(currentScreen);
    lv_obj_set_size(checkoutBtn, 260, 60);
    lv_obj_align(checkoutBtn, LV_ALIGN_BOTTOM_RIGHT, -60, -35);
    lv_obj_set_style_bg_color(checkoutBtn, COL_GREEN, 0);
    lv_obj_set_style_radius(checkoutBtn, 30, 0);
    lv_obj_set_style_shadow_width(checkoutBtn, 15, 0);
    lv_obj_set_style_shadow_color(checkoutBtn, COL_GREEN, 0);
    lv_obj_set_style_shadow_opa(checkoutBtn, LV_OPA_30, 0);
    lv_obj_add_event_cb(checkoutBtn, payButtonEventHandler, LV_EVENT_CLICKED, NULL);
    lv_obj_t* checkoutLbl = lv_label_create(checkoutBtn);
    lv_label_set_text(checkoutLbl, LV_SYMBOL_OK "  CHECKOUT");
    lv_obj_center(checkoutLbl);

    lv_scr_load(currentScreen);
    Logger::info(TAG, "Cart screen displayed: %s x%d = INR %.2f", prod.name.c_str(), qty, total);
}

// ============================================================
// SCREEN: Payment Processing (spinner)
// ============================================================
void UiManager::showPaymentProcessingScreen() {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, COL_BG_PRIMARY, 0);

    lv_obj_t* title = lv_label_create(currentScreen);
    lv_label_set_text(title, "PAYMENT PROCESSING");
    lv_obj_set_style_text_color(title, COL_AQUA, 0);
    lv_obj_align(title, LV_ALIGN_CENTER, 0, -50);

    lv_obj_t* spinner = lv_spinner_create(currentScreen, 1000, 60);
    lv_obj_set_size(spinner, 60, 60);
    lv_obj_align(spinner, LV_ALIGN_CENTER, 0, 20);

    lv_obj_t* msg = lv_label_create(currentScreen);
    lv_label_set_text(msg, "Waiting for payment confirmation...\nDo not close this screen.");
    lv_obj_set_style_text_align(msg, LV_TEXT_ALIGN_CENTER, 0);
    lv_obj_set_style_text_color(msg, COL_TEXT_DIM, 0);
    lv_obj_align(msg, LV_ALIGN_CENTER, 0, 80);

    lv_scr_load(currentScreen);
}

// ============================================================
// SCREEN: Payment Success (brief transition screen)
// ============================================================
void UiManager::showPaymentSuccessScreen() {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, COL_BG_SUCCESS, 0);

    lv_obj_t* title = lv_label_create(currentScreen);
    lv_label_set_text(title, LV_SYMBOL_OK "  Payment Successful!");
    lv_obj_set_style_text_color(title, COL_GREEN, 0);
    lv_obj_align(title, LV_ALIGN_CENTER, 0, -30);

    lv_obj_t* msg = lv_label_create(currentScreen);
    lv_label_set_text(msg, "Preparing dispensing...");
    lv_obj_set_style_text_color(msg, COL_WHITE, 0);
    lv_obj_align(msg, LV_ALIGN_CENTER, 0, 20);

    lv_obj_t* spinner = lv_spinner_create(currentScreen, 1200, 60);
    lv_obj_set_size(spinner, 40, 40);
    lv_obj_align(spinner, LV_ALIGN_CENTER, 0, 70);

    lv_scr_load(currentScreen);
}

// ============================================================
// SCREEN: Payment QR
// ============================================================
void UiManager::showPaymentQrScreen(const String& qrPayload, const String& orderNumber, float amount) {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, COL_BG_CARD, 0);

    // Left info card
    lv_obj_t* infoCard = lv_obj_create(currentScreen);
    lv_obj_set_size(infoCard, 360, 420);
    lv_obj_set_pos(infoCard, 30, 30);
    lv_obj_set_style_bg_color(infoCard, COL_BG_SURFACE, 0);
    lv_obj_set_style_radius(infoCard, 16, 0);
    lv_obj_set_style_border_width(infoCard, 0, 0);

    lv_obj_t* title = lv_label_create(infoCard);
    lv_label_set_text(title, LV_SYMBOL_CHARGE "  SCAN TO PAY");
    lv_obj_set_style_text_color(title, COL_AQUA, 0);
    lv_obj_align(title, LV_ALIGN_TOP_LEFT, 15, 15);

    lv_obj_t* orderLbl = lv_label_create(infoCard);
    char buf[160];
    snprintf(buf, sizeof(buf),
        "Order: %s\nAmount: INR %.2f\n\n"
        "Scan with any UPI App:\n"
        "  " LV_SYMBOL_RIGHT " GPay, PhonePe, Paytm\n"
        "  " LV_SYMBOL_RIGHT " Any BHIM UPI Scanner",
        orderNumber.c_str(), amount);
    lv_label_set_text(orderLbl, buf);
    lv_obj_set_style_text_color(orderLbl, COL_WHITE, 0);
    lv_obj_align(orderLbl, LV_ALIGN_LEFT_MID, 15, 0);

    lv_obj_t* cancelBtn = lv_btn_create(infoCard);
    lv_obj_set_size(cancelBtn, 140, 45);
    lv_obj_align(cancelBtn, LV_ALIGN_BOTTOM_LEFT, 15, -10);
    lv_obj_set_style_bg_color(cancelBtn, COL_RED, 0);
    lv_obj_set_style_radius(cancelBtn, 10, 0);
    lv_obj_add_event_cb(cancelBtn, backToHomeEventHandler, LV_EVENT_CLICKED, NULL);
    lv_obj_t* cancelLbl = lv_label_create(cancelBtn);
    lv_label_set_text(cancelLbl, "CANCEL");
    lv_obj_center(cancelLbl);

    // Right QR Container
    lv_obj_t* qrCard = lv_obj_create(currentScreen);
    lv_obj_set_size(qrCard, 360, 420);
    lv_obj_set_pos(qrCard, 410, 30);
    lv_obj_set_style_bg_color(qrCard, COL_WHITE, 0);
    lv_obj_set_style_radius(qrCard, 16, 0);
    lv_obj_set_style_border_width(qrCard, 0, 0);

    // LVGL QR Code Widget (LV_USE_QRCODE in lv_conf.h)
    lv_obj_t* qr = lv_qrcode_create(qrCard, 280, lv_color_black(), lv_color_white());
    lv_qrcode_update(qr, qrPayload.c_str(), qrPayload.length());
    lv_obj_center(qr);

    lv_scr_load(currentScreen);
    Logger::info(TAG, "Payment QR screen displayed for order %s", orderNumber.c_str());
}

// ============================================================
// SCREEN: Dispensing Progress
// ============================================================
void UiManager::showDispensingScreen(const String& productName, int targetMl, int dispensedMl, int percentage) {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, COL_BG_PRIMARY, 0);

    lv_obj_t* title = lv_label_create(currentScreen);
    lv_label_set_text(title, LV_SYMBOL_CHARGE "  DISPENSING IN PROGRESS");
    lv_obj_set_style_text_color(title, COL_AQUA, 0);
    lv_obj_align(title, LV_ALIGN_TOP_MID, 0, 50);

    lv_obj_t* prodLabel = lv_label_create(currentScreen);
    char pBuf[64];
    snprintf(pBuf, sizeof(pBuf), "%s  •  %d ml", productName.c_str(), targetMl);
    lv_label_set_text(prodLabel, pBuf);
    lv_obj_set_style_text_color(prodLabel, COL_TEXT_DIM, 0);
    lv_obj_align(prodLabel, LV_ALIGN_TOP_MID, 0, 90);

    dispensingBar = lv_bar_create(currentScreen);
    lv_obj_set_size(dispensingBar, 540, 30);
    lv_obj_align(dispensingBar, LV_ALIGN_CENTER, 0, 0);
    lv_bar_set_range(dispensingBar, 0, 100);
    lv_bar_set_value(dispensingBar, percentage, LV_ANIM_ON);
    lv_obj_set_style_bg_color(dispensingBar, COL_BG_SURFACE, LV_PART_MAIN);
    lv_obj_set_style_bg_color(dispensingBar, COL_AQUA, LV_PART_INDICATOR);
    lv_obj_set_style_radius(dispensingBar, 15, LV_PART_MAIN);
    lv_obj_set_style_radius(dispensingBar, 15, LV_PART_INDICATOR);

    dispensingLabel = lv_label_create(currentScreen);
    char buf[128];
    snprintf(buf, sizeof(buf), "%d / %d ml  (%d%%)", dispensedMl, targetMl, percentage);
    lv_label_set_text(dispensingLabel, buf);
    lv_obj_set_style_text_color(dispensingLabel, COL_WHITE, 0);
    lv_obj_align(dispensingLabel, LV_ALIGN_CENTER, 0, 40);

    lv_obj_t* warnLbl = lv_label_create(currentScreen);
    lv_label_set_text(warnLbl, "Please wait... Do not move the container.");
    lv_obj_set_style_text_color(warnLbl, COL_TEXT_DIM, 0);
    lv_obj_align(warnLbl, LV_ALIGN_BOTTOM_MID, 0, -50);

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

// ============================================================
// SCREEN: Completion
// ============================================================
void UiManager::showCompletionScreen(const String& productName, int volumeMl) {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, COL_BG_SUCCESS, 0);

    lv_obj_t* checkIcon = lv_label_create(currentScreen);
    lv_label_set_text(checkIcon, LV_SYMBOL_OK);
    lv_obj_set_style_text_color(checkIcon, COL_GREEN, 0);
    lv_obj_align(checkIcon, LV_ALIGN_CENTER, 0, -80);

    lv_obj_t* title = lv_label_create(currentScreen);
    lv_label_set_text(title, "Dispensing Complete!");
    lv_obj_set_style_text_color(title, COL_GREEN, 0);
    lv_obj_align(title, LV_ALIGN_CENTER, 0, -40);

    lv_obj_t* msg = lv_label_create(currentScreen);
    char buf[128];
    snprintf(buf, sizeof(buf), "%s (%d ml)\n\nPlease collect your sanitizer.", productName.c_str(), volumeMl);
    lv_label_set_text(msg, buf);
    lv_obj_set_style_text_align(msg, LV_TEXT_ALIGN_CENTER, 0);
    lv_obj_set_style_text_color(msg, COL_WHITE, 0);
    lv_obj_align(msg, LV_ALIGN_CENTER, 0, 20);

    lv_obj_t* thanksLbl = lv_label_create(currentScreen);
    lv_label_set_text(thanksLbl, "Thank you for choosing AQUORA.");
    lv_obj_set_style_text_color(thanksLbl, COL_TEXT_DIM, 0);
    lv_obj_align(thanksLbl, LV_ALIGN_BOTTOM_MID, 0, -50);

    lv_scr_load(currentScreen);
    Logger::info(TAG, "Completion screen displayed");
}

// ============================================================
// SCREEN: Error
// ============================================================
void UiManager::showErrorScreen(const char* title, const char* message) {
    clearScreen();
    currentScreen = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(currentScreen, COL_BG_ERROR, 0);

    lv_obj_t* iconLbl = lv_label_create(currentScreen);
    lv_label_set_text(iconLbl, LV_SYMBOL_WARNING);
    lv_obj_set_style_text_color(iconLbl, COL_RED, 0);
    lv_obj_align(iconLbl, LV_ALIGN_CENTER, 0, -80);

    lv_obj_t* t = lv_label_create(currentScreen);
    lv_label_set_text(t, title);
    lv_obj_set_style_text_color(t, COL_RED, 0);
    lv_obj_align(t, LV_ALIGN_CENTER, 0, -40);

    lv_obj_t* m = lv_label_create(currentScreen);
    lv_label_set_text(m, message);
    lv_obj_set_style_text_align(m, LV_TEXT_ALIGN_CENTER, 0);
    lv_obj_set_style_text_color(m, COL_WHITE, 0);
    lv_obj_align(m, LV_ALIGN_CENTER, 0, 10);

    lv_obj_t* btn = lv_btn_create(currentScreen);
    lv_obj_set_size(btn, 200, 55);
    lv_obj_align(btn, LV_ALIGN_BOTTOM_MID, 0, -40);
    lv_obj_set_style_bg_color(btn, COL_RED, 0);
    lv_obj_set_style_radius(btn, 28, 0);
    lv_obj_add_event_cb(btn, backToHomeEventHandler, LV_EVENT_CLICKED, NULL);

    lv_obj_t* btnLabel = lv_label_create(btn);
    lv_label_set_text(btnLabel, "RETURN HOME");
    lv_obj_center(btnLabel);

    lv_scr_load(currentScreen);
    Logger::info(TAG, "Error screen displayed: %s", title);
}
