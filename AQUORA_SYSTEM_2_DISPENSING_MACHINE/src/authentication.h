#ifndef AUTHENTICATION_H
#define AUTHENTICATION_H

#include <Arduino.h>

class MachineAuth {
public:
    static bool authenticate();
    static bool isAuthenticated();
    static const String& getSessionToken();

private:
    static bool authenticated;
    static String sessionToken;
};

#endif // AUTHENTICATION_H
