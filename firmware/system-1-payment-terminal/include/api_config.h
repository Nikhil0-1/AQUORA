#ifndef AQUORA_API_CONFIG_H
#define AQUORA_API_CONFIG_H

// ==============================================================================
// AQUORA System 1 — API Routes & Endpoints
// ==============================================================================

#define API_BASE_URL_DEFAULT        "http://192.168.1.100:3001/api/v1"
#define WS_URL_DEFAULT              "ws://192.168.1.100:3001/ws"

// REST Endpoints matching Section 57
#define ENDPOINT_PRODUCTS           "/products"
#define ENDPOINT_ORDERS             "/orders"
#define ENDPOINT_PAYMENTS_CREATE    "/payments/create"
#define ENDPOINT_ORDER_STATUS       "/orders/%s/status"
#define ENDPOINT_MACHINE_CONFIG     "/machine/config"

#endif // AQUORA_API_CONFIG_H
