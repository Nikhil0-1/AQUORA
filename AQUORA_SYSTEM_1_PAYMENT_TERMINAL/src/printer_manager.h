#ifndef PRINTER_MANAGER_H
#define PRINTER_MANAGER_H

#include <Arduino.h>

class PrinterManager {
public:
    static void init();
    static bool printReceipt(const String& orderNumber, const String& productName, int volumeMl, float price);

private:
    static bool initialized;
    static HardwareSerial printerSerial;
};

#endif // PRINTER_MANAGER_H
