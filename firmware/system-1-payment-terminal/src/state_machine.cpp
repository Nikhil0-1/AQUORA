#include "state_machine.h"
#include "logger.h"

static const char* TAG = "StateMach";
TerminalState StateMachine::currentState = STATE_BOOT;

void StateMachine::init() {
    currentState = STATE_BOOT;
    Logger::info(TAG, "Terminal State Machine Initialized in STATE_BOOT");
}

void StateMachine::setState(TerminalState newState) {
    if (newState != currentState) {
        Logger::info(TAG, "State transition: %s -> %s",
            getStateName(currentState), getStateName(newState));
        currentState = newState;
    }
}

TerminalState StateMachine::getState() {
    return currentState;
}

const char* StateMachine::getStateName(TerminalState state) {
    switch (state) {
        case STATE_BOOT: return "BOOT";
        case STATE_CONNECTING_WIFI: return "CONNECTING_WIFI";
        case STATE_AUTHENTICATING: return "AUTHENTICATING";
        case STATE_LOADING_CONFIG: return "LOADING_CONFIG";
        case STATE_READY: return "READY";
        case STATE_SELECTING_PRODUCT: return "SELECTING_PRODUCT";
        case STATE_SELECTING_VOLUME: return "SELECTING_VOLUME";
        case STATE_ORDER_REVIEW: return "ORDER_REVIEW";
        case STATE_PAYMENT_PENDING: return "PAYMENT_PENDING";
        case STATE_PAYMENT_PROCESSING: return "PAYMENT_PROCESSING";
        case STATE_PAYMENT_SUCCESS: return "PAYMENT_SUCCESS";
        case STATE_QUEUED: return "QUEUED";
        case STATE_DISPENSING: return "DISPENSING";
        case STATE_COMPLETED: return "COMPLETED";
        case STATE_PAYMENT_FAILED: return "PAYMENT_FAILED";
        case STATE_DISPENSING_FAILED: return "DISPENSING_FAILED";
        case STATE_OFFLINE: return "OFFLINE";
        case STATE_MAINTENANCE: return "MAINTENANCE";
        case STATE_RESETTING: return "RESETTING";
        default: return "UNKNOWN";
    }
}

bool StateMachine::isCustomerActive() {
    return currentState >= STATE_SELECTING_PRODUCT && currentState <= STATE_PAYMENT_PENDING;
}
