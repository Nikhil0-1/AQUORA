#include "https_client.h"
#include "logger.h"
#include "../include/config.h"

static const char* TAG = "HttpClient";

void HttpsClient::configureClient(HTTPClient& http, const String& url, const String& bearerToken) {
    http.begin(url);
    http.setTimeout(HTTP_REQUEST_TIMEOUT_MS);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Accept", "application/json");
    http.addHeader("X-Client-Platform", "ESP32S3-CrowPanel70");

    if (bearerToken.length() > 0) {
        http.addHeader("Authorization", "Bearer " + bearerToken);
    }
}

HttpResponse HttpsClient::get(const String& url, const String& bearerToken) {
    HttpResponse response = { -1, "", false, "" };
    HTTPClient http;

    configureClient(http, url, bearerToken);
    int httpCode = http.GET();

    response.statusCode = httpCode;
    if (httpCode > 0) {
        response.payload = http.getString();
        response.success = (httpCode >= 200 && httpCode < 300);
        if (!response.success) {
            response.error = "HTTP error " + String(httpCode);
        }
    } else {
        response.error = http.errorToString(httpCode);
        Logger::error(TAG, "GET request to %s failed: %s", url.c_str(), response.error.c_str());
    }

    http.end();
    return response;
}

HttpResponse HttpsClient::post(const String& url, const String& jsonBody, const String& bearerToken) {
    HttpResponse response = { -1, "", false, "" };
    HTTPClient http;

    configureClient(http, url, bearerToken);
    int httpCode = http.POST(jsonBody);

    response.statusCode = httpCode;
    if (httpCode > 0) {
        response.payload = http.getString();
        response.success = (httpCode >= 200 && httpCode < 300);
        if (!response.success) {
            response.error = "HTTP error " + String(httpCode);
        }
    } else {
        response.error = http.errorToString(httpCode);
        Logger::error(TAG, "POST request to %s failed: %s", url.c_str(), response.error.c_str());
    }

    http.end();
    return response;
}

HttpResponse HttpsClient::put(const String& url, const String& jsonBody, const String& bearerToken) {
    HttpResponse response = { -1, "", false, "" };
    HTTPClient http;

    configureClient(http, url, bearerToken);
    int httpCode = http.PUT(jsonBody);

    response.statusCode = httpCode;
    if (httpCode > 0) {
        response.payload = http.getString();
        response.success = (httpCode >= 200 && httpCode < 300);
        if (!response.success) {
            response.error = "HTTP error " + String(httpCode);
        }
    } else {
        response.error = http.errorToString(httpCode);
        Logger::error(TAG, "PUT request to %s failed: %s", url.c_str(), response.error.c_str());
    }

    http.end();
    return response;
}
