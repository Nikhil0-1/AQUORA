#ifndef STATE_MACHINE_H
#define STATE_MACHINE_H

#include <Arduino.h>

enum TerminalState {
    STATE_BOOT = 0,
    STATE_CONNECTING_WIFI,
    STATE_AUTHENTICATING,
    STATE_LOADING_CONFIG,
    STATE_READY,
    STATE_SELECTING_PRODUCT,
    STATE_SELECTING_VOLUME,
    STATE_ORDER_REVIEW,
    STATE_PAYMENT_PENDING,
    STATE_PAYMENT_PROCESSING,
    STATE_PAYMENT_SUCCESS,
    STATE_QUEUED,
    STATE_DISPENSING,
    STATE_COMPLETED,
    STATE_PAYMENT_FAILED,
    STATE_DISPENSING_FAILED,
    STATE_OFFLINE,
    STATE_MAINTENANCE,
    STATE_RESETTING
};

class StateMachine {
public:
    static void init();
    static void setState(TerminalState newState);
    static TerminalState getState();
    static const char* getStateName(TerminalState state);
    static bool isCustomerActive();

private:
    static TerminalState currentState;
};

#endif // STATE_MACHINE_H
