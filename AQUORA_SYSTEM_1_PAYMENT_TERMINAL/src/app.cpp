#include "app.h"
#include "logger.h"
#include "storage_manager.h"
#include "watchdog_manager.h"
#include "display_manager.h"
#include "touch_manager.h"
#include "lvgl_manager.h"
#include "wifi_manager.h"
#include "api_client.h"
#include "state_machine.h"
#include "order_manager.h"
#include "payment_manager.h"
#include "realtime_manager.h"
#include "printer_manager.h"
#include "ui_manager.h"
#include "../include/config.h"

static const char* TAG = "App";

unsigned long Application::lastSessionCheck = 0;
unsigned long Application::lastHeartbeat = 0;
static std::vector<ProductItem> cachedProducts;
static TerminalState lastRenderedState = STATE_BOOT;
static unsigned long lastCatalogFetchAttempt = 0;
static bool printedReceiptForCurrentOrder = false;

void Application::setup() {
    // 1. Logger
    Logger::init(SERIAL_BAUD_RATE);
    Logger::info(TAG, "================================================");
    Logger::info(TAG, "  AQUORA SYSTEM 1 — PAYMENT RECEIVING TERMINAL  ");
    Logger::info(TAG, "  Target: Elecrow CrowPanel 7.0 ESP32-S3 HMI   ");
    Logger::info(TAG, "================================================");

    // 2. State Machine & Storage
    StateMachine::init();
    StorageManager::init();

    // 3. Hardware Display & Touch
    DisplayManager::init();
    TouchManager::init();

    // 4. LVGL UI Engine
    LvglManager::init();
    UiManager::init();

    // 5. Thermal Printer (Optional peripheral)
    #if PRINTER_ENABLED_DEFAULT
    PrinterManager::init();
    #endif

    // 6. Non-blocking WiFi & Initial Screen
    UiManager::showWifiConnectingScreen();
    StateMachine::setState(STATE_CONNECTING_WIFI);
    WifiManager::init();

    // 7. Hardware Watchdog
    WatchdogManager::init(WATCHDOG_TIMEOUT_SECONDS);

    Logger::info(TAG, "System 1 initialization sequence completed");
}

void Application::loop() {
    // Feed hardware watchdog every iteration
    WatchdogManager::feed();

    // Update non-blocking background managers
    WifiManager::update();
    LvglManager::update();
    PaymentManager::update();
    RealtimeManager::update();

    TerminalState currentState = StateMachine::getState();

    // Handle WiFi connectivity loss
    if (!WifiManager::isConnected() && currentState != STATE_CONNECTING_WIFI && currentState != STATE_BOOT) {
        if (currentState != STATE_OFFLINE) {
            Logger::warn(TAG, "WiFi connection dropped, entering STATE_OFFLINE");
            StateMachine::setState(STATE_OFFLINE);
            UiManager::showNetworkErrorScreen();
            lastRenderedState = STATE_OFFLINE;
        }
        return;
    } else if (WifiManager::isConnected() && currentState == STATE_OFFLINE) {
        Logger::info(TAG, "WiFi reconnected, reloading configuration");
        StateMachine::setState(STATE_LOADING_CONFIG);
    }

    // State machine logic
    switch (currentState) {
        case STATE_CONNECTING_WIFI:
            if (WifiManager::isConnected()) {
                Logger::info(TAG, "WiFi connected! IP: %s", WifiManager::getIPAddress().c_str());
                StateMachine::setState(STATE_LOADING_CONFIG);
            }
            break;

        case STATE_LOADING_CONFIG:
            if (millis() - lastCatalogFetchAttempt >= 3000) {
                lastCatalogFetchAttempt = millis();
                Logger::info(TAG, "Fetching product catalog from backend: %s...", StorageManager::getApiServerUrl().c_str());
                if (ApiClient::fetchProducts(cachedProducts)) {
                    Logger::info(TAG, "Catalog loaded successfully (%d products)", cachedProducts.size());
                    StateMachine::setState(STATE_READY);
                } else {
                    Logger::warn(TAG, "Failed to load product catalog, will retry in 3s");
                    UiManager::showNetworkErrorScreen();
                    lastRenderedState = STATE_OFFLINE;
                }
            }
            break;

        case STATE_READY:
            if (lastRenderedState != STATE_READY) {
                OrderManager::reset();
                RealtimeManager::reset();
                PaymentManager::cancel();
                printedReceiptForCurrentOrder = false;
                UiManager::showWelcomeScreen();
                lastRenderedState = STATE_READY;
                lastSessionCheck = millis();
            }
            break;

        case STATE_SELECTING_PRODUCT:
            if (lastRenderedState != STATE_SELECTING_PRODUCT) {
                UiManager::showProductSelectionScreen(cachedProducts);
                lastRenderedState = STATE_SELECTING_PRODUCT;
                lastSessionCheck = millis();
            }
            break;

        case STATE_SELECTING_VOLUME:
            if (lastRenderedState != STATE_SELECTING_VOLUME) {
                const ProductItem& prod = OrderManager::getSelectedProduct();
                UiManager::showVolumeSelectionScreen(prod.availableVolumes);
                lastRenderedState = STATE_SELECTING_VOLUME;
                lastSessionCheck = millis();
            }
            break;

        case STATE_SELECTING_QUANTITY:
            if (lastRenderedState != STATE_SELECTING_QUANTITY) {
                UiManager::showQuantityScreen();
                lastRenderedState = STATE_SELECTING_QUANTITY;
                lastSessionCheck = millis();
            }
            break;

        case STATE_ORDER_REVIEW:
            if (lastRenderedState != STATE_ORDER_REVIEW) {
                UiManager::showCartScreen();
                lastRenderedState = STATE_ORDER_REVIEW;
                lastSessionCheck = millis();
            }
            break;

        case STATE_PAYMENT_PENDING:
            if (lastRenderedState != STATE_PAYMENT_PENDING) {
                const ProductItem& prod = OrderManager::getSelectedProduct();
                int vol = OrderManager::getSelectedVolume();
                int qty = OrderManager::getQuantity();
                
                UiManager::showPaymentProcessingScreen();

                Logger::info(TAG, "Creating backend order: prod=%s, vol=%dml, qty=%d, ch=%d",
                    prod.id.c_str(), vol, qty, prod.channelId);
                OrderCreateResult orderRes = ApiClient::createOrder(prod.id, vol, prod.channelId, qty);

                if (orderRes.success) {
                    OrderManager::setCreatedOrder(orderRes.orderId, orderRes.orderNumber, orderRes.amount);
                    if (PaymentManager::startPayment(orderRes.orderId)) {
                        UiManager::showPaymentQrScreen(
                            PaymentManager::getQrPayload(),
                            orderRes.orderNumber,
                            orderRes.amount
                        );
                        RealtimeManager::subscribeOrder(orderRes.orderId);
                        lastRenderedState = STATE_PAYMENT_PENDING;
                    } else {
                        Logger::error(TAG, "Payment initialization failed");
                        StateMachine::setState(STATE_PAYMENT_FAILED);
                    }
                } else {
                    Logger::error(TAG, "Order creation failed: %s", orderRes.error.c_str());
                    StateMachine::setState(STATE_PAYMENT_FAILED);
                }
                lastSessionCheck = millis();
            }
            break;

        case STATE_PAYMENT_PROCESSING:
            if (lastRenderedState != STATE_PAYMENT_PROCESSING) {
                UiManager::showPaymentProcessingScreen();
                lastRenderedState = STATE_PAYMENT_PROCESSING;
            }
            break;

        case STATE_PAYMENT_SUCCESS:
            if (lastRenderedState != STATE_PAYMENT_SUCCESS) {
                UiManager::showPaymentSuccessScreen();
                lastRenderedState = STATE_PAYMENT_SUCCESS;
                UiManager::startAutoReturnTimer(2000);
            } else if (UiManager::isAutoReturnExpired()) {
                Logger::info(TAG, "Payment confirmed. Transitioning to QUEUED for dispenser %s",
                    StorageManager::getAssignedDispenserCode().c_str());
                StateMachine::setState(STATE_QUEUED);
            }
            break;

        case STATE_QUEUED:
        case STATE_DISPENSING: {
            const DispenseProgressData& p = RealtimeManager::getProgress();
            const ProductItem& prod = OrderManager::getSelectedProduct();
            if (lastRenderedState != STATE_QUEUED && lastRenderedState != STATE_DISPENSING) {
                UiManager::showDispensingScreen(prod.name, OrderManager::getSelectedVolume(), p.dispensedMl, p.percentage);
                lastRenderedState = currentState;
            } else {
                UiManager::updateDispensingProgress(p.dispensedMl, p.percentage);
            }
            break;
        }

        case STATE_COMPLETED: {
            const ProductItem& prod = OrderManager::getSelectedProduct();
            int vol = OrderManager::getSelectedVolume();
            
            if (lastRenderedState != STATE_COMPLETED) {
                UiManager::showCompletionScreen(prod.name, vol);
                UiManager::startAutoReturnTimer(UI_COMPLETION_DISPLAY_MS);
                lastRenderedState = STATE_COMPLETED;

                #if PRINTER_ENABLED_DEFAULT
                if (!printedReceiptForCurrentOrder) {
                    PrinterManager::printReceipt(
                        OrderManager::getOrderNumber(),
                        prod.name,
                        vol,
                        OrderManager::getAmount()
                    );
                    printedReceiptForCurrentOrder = true;
                }
                #endif
            } else if (UiManager::isAutoReturnExpired()) {
                Logger::info(TAG, "Dispense cycle completed. Returning to welcome screen.");
                StateMachine::setState(STATE_READY);
            }
            break;
        }

        case STATE_PAYMENT_FAILED:
            if (lastRenderedState != STATE_PAYMENT_FAILED) {
                UiManager::showErrorScreen("PAYMENT FAILED", "Transaction was declined or timed out.\nPlease try again.");
                UiManager::startAutoReturnTimer(5000);
                lastRenderedState = STATE_PAYMENT_FAILED;
            } else if (UiManager::isAutoReturnExpired()) {
                StateMachine::setState(STATE_READY);
            }
            break;

        case STATE_DISPENSING_FAILED:
            if (lastRenderedState != STATE_DISPENSING_FAILED) {
                UiManager::showErrorScreen("DISPENSING ERROR", "Payment: SUCCESS\nDispensing: HARDWARE FAULT\nPlease contact customer support.");
                UiManager::startAutoReturnTimer(7000);
                lastRenderedState = STATE_DISPENSING_FAILED;
            } else if (UiManager::isAutoReturnExpired()) {
                StateMachine::setState(STATE_READY);
            }
            break;

        default:
            break;
    }

    // Customer Inactivity / Session Idle Auto-Reset
    if (StateMachine::isCustomerActive()) {
        if (millis() - lastSessionCheck > UI_AUTO_RESET_TIMEOUT_MS) {
            Logger::warn(TAG, "Customer session timed out due to inactivity (%d ms)", UI_AUTO_RESET_TIMEOUT_MS);
            StateMachine::setState(STATE_READY);
        }
    }
}
