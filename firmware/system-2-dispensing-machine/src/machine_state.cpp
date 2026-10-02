#include "machine_state.h"
#include "logger.h"

static const char* TAG = "State";
DispenserState MachineState::currentState = STATE_BOOT;

void MachineState::init() {
    currentState = STATE_BOOT;
    Logger::info(TAG, "Machine state initialized to STATE_BOOT");
}

void MachineState::setState(DispenserState newState) {
    if (newState != currentState) {
        Logger::info(TAG, "Machine transition: %s -> %s",
            getStateName(currentState), getStateName(newState));
        currentState = newState;
    }
}

DispenserState MachineState::getState() {
    return currentState;
}

const char* MachineState::getStateName(DispenserState state) {
    switch (state) {
        case STATE_BOOT: return "BOOT";
        case STATE_CONNECTING_WIFI: return "CONNECTING_WIFI";
        case STATE_AUTHENTICATING: return "AUTHENTICATING";
        case STATE_IDLE: return "IDLE";
        case STATE_WAITING_FOR_JOB: return "WAITING_FOR_JOB";
        case STATE_JOB_RECEIVED: return "JOB_RECEIVED";
        case STATE_VALIDATING_JOB: return "VALIDATING_JOB";
        case STATE_SAFETY_CHECK: return "SAFETY_CHECK";
        case STATE_DISPENSING: return "DISPENSING";
        case STATE_COMPLETING: return "COMPLETING";
        case STATE_ERROR: return "ERROR";
        case STATE_SAFE_MODE: return "SAFE_MODE";
        case STATE_MAINTENANCE: return "MAINTENANCE";
        case STATE_OFFLINE: return "OFFLINE";
        default: return "UNKNOWN";
    }
}
