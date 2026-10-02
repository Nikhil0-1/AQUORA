#ifndef LOGGER_H
#define LOGGER_H

#include <Arduino.h>

enum LogLevel {
    LOG_LEVEL_DEBUG = 0,
    LOG_LEVEL_INFO,
    LOG_LEVEL_WARN,
    LOG_LEVEL_ERROR
};

class Logger {
public:
    static void init(unsigned long baudRate = 115200);
    static void setLevel(LogLevel level);
    static void debug(const char* tag, const char* format, ...);
    static void info(const char* tag, const char* format, ...);
    static void warn(const char* tag, const char* format, ...);
    static void error(const char* tag, const char* format, ...);

private:
    static LogLevel currentLevel;
    static void log(LogLevel level, const char* prefix, const char* tag, const char* format, va_list args);
};

#endif // LOGGER_H
