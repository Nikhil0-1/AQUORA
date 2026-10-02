#include "logger.h"
#include <stdarg.h>

void Logger::init(unsigned long baudRate) {
    Serial.begin(baudRate);
    delay(50);
}

void Logger::debug(const char* tag, const char* format, ...) {
    va_list args;
    va_start(args, format);
    char buf[256];
    vsnprintf(buf, sizeof(buf), format, args);
    va_end(args);
    Serial.printf("[%7lu] [DEBUG] [%s] %s\n", millis(), tag, buf);
}

void Logger::info(const char* tag, const char* format, ...) {
    va_list args;
    va_start(args, format);
    char buf[256];
    vsnprintf(buf, sizeof(buf), format, args);
    va_end(args);
    Serial.printf("[%7lu] [INFO]  [%s] %s\n", millis(), tag, buf);
}

void Logger::warn(const char* tag, const char* format, ...) {
    va_list args;
    va_start(args, format);
    char buf[256];
    vsnprintf(buf, sizeof(buf), format, args);
    va_end(args);
    Serial.printf("[%7lu] [WARN]  [%s] %s\n", millis(), tag, buf);
}

void Logger::error(const char* tag, const char* format, ...) {
    va_list args;
    va_start(args, format);
    char buf[256];
    vsnprintf(buf, sizeof(buf), format, args);
    va_end(args);
    Serial.printf("[%7lu] [ERROR] [%s] %s\n", millis(), tag, buf);
}
