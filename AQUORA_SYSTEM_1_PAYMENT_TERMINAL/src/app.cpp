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

    // 6. Non-blocking WiFi
    StateMachine::setState(STATE_CONNECTING_WIFI);
    WifiManager::init();

    // 7. Hardware Watchdog
    WatchdogManager::init(WATCHDOG_TIMEOUT_SECONDS);

    Logger::info(TAG, "System 1 initialization sequence completed");
}

void Application::loop() {
    // Feed hardware watchdog every iteration
    WatchdogManager::feed();

    // Update non-blocking managers
    WifiManager::update();
    LvglManager::update();
    PaymentManager::update();
    RealtimeManager::update();

    TerminalState state = StateMachine::getState();

    // State actions
    switch (state) {
        case STATE_CONNECTING_WIFI:
            if (WifiManager::isConnected()) {
                StateMachine::setState(STATE_LOADING_CONFIG);
            }
            break;

        case STATE_LOADING_CONFIG:
            Logger::info(TAG, "Fetching product catalog from backend...");
            if (ApiClient::fetchProducts(cachedProducts)) {
                StateMachine::setState(STATE_READY);
                UiManager::showWelcomeScreen();
            } else {
                Logger::warn(TAG, "Retrying product fetch in 3 seconds...");
                delay(3000);
            }
            break;

        case STATE_READY:
            // Idle on welcome screen
            break;

        case STATE_SELECTING_PRODUCT:
            UiManager::showProductSelectionScreen(cachedProducts);
            StateMachine::setState(STATE_SELECTING_VOLUME);
            break;

        case STATE_SELECTING_VOLUME:
            // Displayed by UI event callback
            break;

        case STATE_ORDER_REVIEW:
            UiManager::showOrderSummaryScreen();
            break;

        case STATE_PAYMENT_PENDING: {
            const ProductItem& prod = OrderManager::getSelectedProduct();
            int vol = OrderManager::getSelectedVolume();
            OrderCreateResult orderRes = ApiClient::createOrder(prod.id, vol, prod.channelId);

            if (orderRes.success) {
                OrderManager::setCreatedOrder(orderRes.orderId, orderRes.orderNumber, orderRes.amount);
                if (PaymentManager::startPayment(orderRes.orderId)) {
                    UiManager::showPaymentQrScreen(
                        PaymentManager::getQrPayload(),
                        orderRes.orderNumber,
                        orderRes.amount
                    );
                    RealtimeManager::subscribeOrder(orderRes.orderId);
                } else {
                    StateMachine::setState(STATE_PAYMENT_FAILED);
                }
            } else {
                StateMachine::setState(STATE_PAYMENT_FAILED);
            }
            break;
        }

        case STATE_PAYMENT_SUCCESS:
            Logger::info(TAG, "Payment confirmed. Transitioning to QUEUED for machine AQ-DM-001");
            StateMachine::setState(STATE_QUEUED);
            break;

        case STATE_QUEUED:
        case STATE_DISPENSING: {
            const DispenseProgressData& p = RealtimeManager::getProgress();
            const ProductItem& prod = OrderManager::getSelectedProduct();
            UiManager::showDispensingScreen(prod.name, OrderManager::getSelectedVolume(), p.dispensedMl, p.percentage);
            break;
        }

        case STATE_COMPLETED: {
            const ProductItem& prod = OrderManager::getSelectedProduct();
            int vol = OrderManager::getSelectedVolume();
            UiManager::showCompletionScreen(prod.name, vol);

            #if PRINTER_ENABLED_DEFAULT
            PrinterManager::printReceipt(
                OrderManager::getOrderNumber(),
                prod.name,
                vol,
                OrderManager::getAmount()
            );
            #endif

            delay(5000);
            OrderManager::reset();
            StateMachine::setState(STATE_READY);
            UiManager::showWelcomeScreen();
            break;
        }

        case STATE_PAYMENT_FAILED:
            UiManager::showErrorScreen("PAYMENT FAILED", "Transaction was declined or timed out.\nPlease try again.");
            delay(5000);
            OrderManager::reset();
            StateMachine::setState(STATE_READY);
            UiManager::showWelcomeScreen();
            break;

        case STATE_DISPENSING_FAILED:
            UiManager::showErrorScreen("DISPENSING ERROR", "Payment: SUCCESS\nDispensing: HARDWARE FAULT\nPlease contact customer support.");
            delay(7000);
            OrderManager::reset();
            StateMachine::setState(STATE_READY);
            UiManager::showWelcomeScreen();
            break;

        default:
            break;
    }

    // Session Idle Timeout check (Section 114)
    if (StateMachine::isCustomerActive()) {
        if (millis() - lastSessionCheck > UI_AUTO_RESET_TIMEOUT_MS) {
            Logger::warn(TAG, "Customer session timed out due to inactivity");
            OrderManager::reset();
            StateMachine::setState(STATE_READY);
            UiManager::showWelcomeScreen();
            lastSessionCheck = millis();
        }
    } else {
        lastSessionCheck = millis();
    }
}
