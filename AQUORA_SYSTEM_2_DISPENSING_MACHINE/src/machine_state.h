#ifndef MACHINE_STATE_H
#define MACHINE_STATE_H

#include <Arduino.h>

enum DispenserState {
    STATE_BOOT = 0,
    STATE_CONNECTING_WIFI,
    STATE_AUTHENTICATING,
    STATE_IDLE,
    STATE_WAITING_FOR_JOB,
    STATE_JOB_RECEIVED,
    STATE_VALIDATING_JOB,
    STATE_SAFETY_CHECK,
    STATE_DISPENSING,
    STATE_COMPLETING,
    STATE_ERROR,
    STATE_SAFE_MODE,
    STATE_MAINTENANCE,
    STATE_OFFLINE
};

class MachineState {
public:
    static void init();
    static void setState(DispenserState newState);
    static DispenserState getState();
    static const char* getStateName(DispenserState state);

private:
    static DispenserState currentState;
};

#endif // MACHINE_STATE_H
