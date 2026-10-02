#include "printer_manager.h"
#include "../include/pins.h"
#include "../include/config.h"
#include "logger.h"

static const char* TAG = "PrinterMgr";

HardwareSerial PrinterManager::printerSerial(1);
bool PrinterManager::initialized = false;

#ifndef PRINTER_BAUD_RATE
#define PRINTER_BAUD_RATE 9600
#endif

void PrinterManager::init() {
    Logger::info(TAG, "Initializing thermal printer on UART1 (TX:%d, RX:%d)", PRINTER_UART_TX, PRINTER_UART_RX);
    printerSerial.begin(PRINTER_BAUD_RATE, SERIAL_8N1, PRINTER_UART_RX, PRINTER_UART_TX);
    initialized = true;
}

bool PrinterManager::printReceipt(const String& orderNumber, const String& productName, int volumeMl, float price) {
    if (!initialized) return false;

    Logger::info(TAG, "Printing receipt for order %s", orderNumber.c_str());

    // ESC/POS Formatting Commands
    const char ESC_INIT[] = { 0x1B, 0x40 };
    const char ESC_ALIGN_CENTER[] = { 0x1B, 0x61, 0x01 };
    const char ESC_ALIGN_LEFT[] = { 0x1B, 0x61, 0x00 };
    const char ESC_BOLD_ON[] = { 0x1B, 0x45, 0x01 };
    const char ESC_BOLD_OFF[] = { 0x1B, 0x45, 0x00 };
    const char ESC_FEED_AND_CUT[] = { 0x1D, 0x56, 0x41, 0x03 };

    printerSerial.write((const uint8_t*)ESC_INIT, sizeof(ESC_INIT));
    printerSerial.write((const uint8_t*)ESC_ALIGN_CENTER, sizeof(ESC_ALIGN_CENTER));
    printerSerial.println("--------------------------------");
    printerSerial.write((const uint8_t*)ESC_BOLD_ON, sizeof(ESC_BOLD_ON));
    printerSerial.println("             AQUORA");
    printerSerial.println("     SMART SANITIZER MACHINE");
    printerSerial.write((const uint8_t*)ESC_BOLD_OFF, sizeof(ESC_BOLD_OFF));
    printerSerial.println("--------------------------------");
    printerSerial.println();

    printerSerial.write((const uint8_t*)ESC_ALIGN_LEFT, sizeof(ESC_ALIGN_LEFT));
    printerSerial.print("Order: ");
    printerSerial.println(orderNumber);
    printerSerial.println();

    printerSerial.print("Product: ");
    printerSerial.println(productName);
    printerSerial.print("Volume:  ");
    printerSerial.print(volumeMl);
    printerSerial.println(" ml");
    printerSerial.print("Price:   INR ");
    printerSerial.println(price, 2);
    printerSerial.println();

    printerSerial.println("Payment:   SUCCESS");
    printerSerial.println("Dispensing: COMPLETED");
    printerSerial.println();

    printerSerial.write((const uint8_t*)ESC_ALIGN_CENTER, sizeof(ESC_ALIGN_CENTER));
    printerSerial.println("Thank You");
    printerSerial.println("--------------------------------");
    printerSerial.println();
    printerSerial.println();

    printerSerial.write((const uint8_t*)ESC_FEED_AND_CUT, sizeof(ESC_FEED_AND_CUT));
    return true;
}
