#include "telemetry.h"
#include "https_client.h"
#include "authentication.h"
#include "storage_manager.h"
#include "machine_state.h"
#include "pump_controller.h"
#include "flow_sensor.h"
#include "wifi_manager.h"
#include "emergency_stop.h"
#include "../include/machine_config.h"
#include "logger.h"
#include <ArduinoJson.h>

static const char* TAG = "Telemetry";

unsigned long TelemetryManager::lastHeartbeatTime = 0;
unsigned long TelemetryManager::lastTelemetryTime = 0;

void TelemetryManager::init() {
    lastHeartbeatTime = millis();
    lastTelemetryTime = millis();
}

bool TelemetryManager::sendHeartbeat() {
    if (!MachineAuth::isAuthenticated()) return false;

    String url = StorageManager::getApiServerUrl() + "/machine/heartbeat";
    JsonDocument doc;
    doc["machine_id"] = StorageManager::getMachineCode();
    doc["firmware_version"] = DEFAULT_FIRMWARE_VERSION;
    doc["protocol_version"] = DEFAULT_PROTOCOL_VERSION;
    doc["uptime"] = millis() / 1000;
    doc["wifi_status"] = WifiManager::isConnected();
    doc["wifi_rssi"] = WifiManager::getRSSI();
    doc["machine_state"] = MachineState::getStateName(MachineState::getState());

    JsonArray pumps = doc["pump_states"].to<JsonArray>();
    for (int i = 1; i <= 5; i++) pumps.add(PumpController::isPumpActive(i));

    JsonArray sensors = doc["flow_sensor_states"].to<JsonArray>();
    for (int i = 1; i <= 5; i++) sensors.add(true);

    if (EmergencyStop::isTriggered()) {
        doc["error_code"] = "EMERGENCY_STOP";
    } else {
        doc["error_code"] = nullptr;
    }

    String body;
    serializeJson(doc, body);
    HttpResponse res = HttpsClient::post(url, body, MachineAuth::getSessionToken());
    return res.success;
}

bool TelemetryManager::sendTelemetry() {
    if (!MachineAuth::isAuthenticated()) return false;

    String url = StorageManager::getApiServerUrl() + "/machine/telemetry";
    JsonDocument doc;
    doc["machine_id"] = StorageManager::getMachineCode();
    doc["wifi_rssi"] = WifiManager::getRSSI();
    doc["state"] = MachineState::getStateName(MachineState::getState());

    JsonArray pumps = doc["pump_states"].to<JsonArray>();
    for (int i = 1; i <= 5; i++) pumps.add(PumpController::isPumpActive(i));

    JsonArray pulses = doc["flow_pulses"].to<JsonArray>();
    for (int i = 1; i <= 5; i++) pulses.add(FlowSensorManager::getPulseCount(i));

    doc["current_volume"] = FlowSensorManager::getVolumeMl(PumpController::getActiveChannel());
    doc["error"] = EmergencyStop::isTriggered() ? "EMERGENCY_STOP" : nullptr;
    doc["uptime"] = millis() / 1000;
    doc["firmware_version"] = DEFAULT_FIRMWARE_VERSION;

    String body;
    serializeJson(doc, body);
    HttpResponse res = HttpsClient::post(url, body, MachineAuth::getSessionToken());
    return res.success;
}

void TelemetryManager::update() {
    if (millis() - lastHeartbeatTime >= HEARTBEAT_INTERVAL_MS) {
        lastHeartbeatTime = millis();
        sendHeartbeat();
    }
    if (millis() - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
        lastTelemetryTime = millis();
        sendTelemetry();
    }
}
