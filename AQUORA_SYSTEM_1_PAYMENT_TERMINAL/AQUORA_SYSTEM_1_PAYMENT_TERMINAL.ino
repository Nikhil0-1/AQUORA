#include <Arduino.h>
#include "version.h"
#include "config.h"
#include "pins.h"
#include "include/board_config.h"
#include "include/api_config.h"

// Core Application subsystem
#include "src/app.h"

void setup() {
    Serial.begin(115200);
    delay(200);
    Serial.println("\nAQUORA SYSTEM 1");
    Serial.println("Payment Terminal");
    Serial.print("Firmware: ");
    Serial.println(AQUORA_FIRMWARE_VERSION);
    Serial.println();

    Application::setup();
}

void loop() {
    Application::loop();
}
