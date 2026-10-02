#include "https_client.h"
#include "logger.h"

static const char* TAG = "HttpClient";

HttpResponse HttpsClient::get(const String& url, const String& token) {
    HttpResponse res = { -1, "", false, "" };
    HTTPClient http;
    http.begin(url);
    http.setTimeout(10000);
    http.addHeader("Content-Type", "application/json");
    if (token.length() > 0) http.addHeader("Authorization", "Bearer " + token);

    int code = http.GET();
    res.statusCode = code;
    if (code > 0) {
        res.payload = http.getString();
        res.success = (code >= 200 && code < 300);
    } else {
        res.error = http.errorToString(code);
        Logger::error(TAG, "GET %s failed: %s", url.c_str(), res.error.c_str());
    }
    http.end();
    return res;
}

HttpResponse HttpsClient::post(const String& url, const String& jsonBody, const String& token) {
    HttpResponse res = { -1, "", false, "" };
    HTTPClient http;
    http.begin(url);
    http.setTimeout(10000);
    http.addHeader("Content-Type", "application/json");
    if (token.length() > 0) http.addHeader("Authorization", "Bearer " + token);

    int code = http.POST(jsonBody);
    res.statusCode = code;
    if (code > 0) {
        res.payload = http.getString();
        res.success = (code >= 200 && code < 300);
    } else {
        res.error = http.errorToString(code);
        Logger::error(TAG, "POST %s failed: %s", url.c_str(), res.error.c_str());
    }
    http.end();
    return res;
}
