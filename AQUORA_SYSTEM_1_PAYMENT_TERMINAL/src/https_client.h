#ifndef HTTPS_CLIENT_H
#define HTTPS_CLIENT_H

#include <Arduino.h>
#include <HTTPClient.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>

struct HttpResponse {
    int statusCode;
    String payload;
    bool success;
    String error;
};

class HttpsClient {
public:
    static HttpResponse get(const String& url, const String& bearerToken = "");
    static HttpResponse post(const String& url, const String& jsonBody, const String& bearerToken = "");
    static HttpResponse put(const String& url, const String& jsonBody, const String& bearerToken = "");

private:
    static void configureClient(HTTPClient& http, const String& url, const String& bearerToken);
};

#endif // HTTPS_CLIENT_H
