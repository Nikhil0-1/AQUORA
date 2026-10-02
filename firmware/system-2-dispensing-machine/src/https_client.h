#ifndef HTTPS_CLIENT_H
#define HTTPS_CLIENT_H

#include <Arduino.h>
#include <HTTPClient.h>

struct HttpResponse {
    int statusCode;
    String payload;
    bool success;
    String error;
};

class HttpsClient {
public:
    static HttpResponse get(const String& url, const String& token = "");
    static HttpResponse post(const String& url, const String& jsonBody, const String& token = "");
};

#endif // HTTPS_CLIENT_H
