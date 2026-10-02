#include "logger.h"
#include <stdarg.h>

LogLevel Logger::currentLevel = LOG_LEVEL_DEBUG;

void Logger::init(unsigned long baudRate) {
    Serial.begin(baudRate);
    delay(50);
}

void Logger::setLevel(LogLevel level) {
    currentLevel = level;
}

void Logger::log(LogLevel level, const char* prefix, const char* tag, const char* format, va_list args) {
    if (level < currentLevel) return;

    char timeBuf[16];
    snprintf(timeBuf, sizeof(timeBuf), "[%7lu] ", millis());
    Serial.print(timeBuf);
    Serial.print(prefix);
    Serial.print(" [");
    Serial.print(tag);
    Serial.print("] ");

    char logBuf[256];
    vsnprintf(logBuf, sizeof(logBuf), format, args);
    Serial.println(logBuf);
}

void Logger::debug(const char* tag, const char* format, ...) {
    va_list args;
    va_start(args, format);
    log(LOG_LEVEL_DEBUG, "[DEBUG]", tag, format, args);
    va_end(args);
}

void Logger::info(const char* tag, const char* format, ...) {
    va_list args;
    va_start(args, format);
    log(LOG_LEVEL_INFO, "[INFO] ", tag, format, args);
    va_end(args);
}

void Logger::warn(const char* tag, const char* format, ...) {
    va_list args;
    va_start(args, format);
    log(LOG_LEVEL_WARN, "[WARN] ", tag, format, args);
    va_end(args);
}

void Logger::error(const char* tag, const char* format, ...) {
    va_list args;
    va_start(args, format);
    log(LOG_LEVEL_ERROR, "[ERROR]", tag, format, args);
    va_end(args);
}
