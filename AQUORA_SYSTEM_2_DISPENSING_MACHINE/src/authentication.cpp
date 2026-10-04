#include "authentication.h"
#include "https_client.h"
#include "storage_manager.h"
#include "logger.h"
#include "../config.h"
#include <ArduinoJson.h>

static const char* TAG = "Auth";

bool MachineAuth::authenticated = false;
String MachineAuth::sessionToken = "";

bool MachineAuth::authenticate() {
    String url = StorageManager::getApiServerUrl() + "/machine/auth";
    Logger::info(TAG, "Authenticating machine with backend at %s", url.c_str());

    StaticJsonDocument<512> doc;
    doc["machine_id"] = StorageManager::getMachineCode();
    doc["api_key"] = AQUORA_MACHINE_SECRET;

    String body;
    serializeJson(doc, body);

    HttpResponse res = HttpsClient::post(url, body);
    if (!res.success) {
        Logger::error(TAG, "Authentication failed: %s", res.error.c_str());
        authenticated = false;
        return false;
    }

    StaticJsonDocument<512> resDoc;
    deserializeJson(resDoc, res.payload);
    sessionToken = resDoc["token"].as<String>();
    authenticated = true;

    Logger::info(TAG, "Machine authenticated! Session Token: %s", sessionToken.substring(0, 8).c_str());
    return true;
}

bool MachineAuth::isAuthenticated() {
    return authenticated;
}

const String& MachineAuth::getSessionToken() {
    return sessionToken;
}
