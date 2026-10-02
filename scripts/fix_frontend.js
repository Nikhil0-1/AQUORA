const fs = require('fs');

// 1. API Client
let apiFile = 'packages/api-client/src/index.ts';
let api = fs.readFileSync(apiFile, 'utf8');
api = api.replace(/QRValidateRequest,/g, '');
api = api.replace(/QRValidateResponse,/g, '');
api = api.replace(/async validateQR\([\s\S]*?\}\n/m, '');
fs.writeFileSync(apiFile, api, 'utf8');

// 2. Cart Context
let cartFile = 'apps/customer-web/src/context/CartContext.tsx';
let cart = fs.readFileSync(cartFile, 'utf8');
cart = cart.replace(/productId:/g, 'product_id:');
cart = cart.replace(/item\.productId/g, 'item.product_id');
cart = cart.replace(/product_id: product\.id, quantity,/g, 'product_id: product.id, quantity, volume_ml: product.volume_ml || 100,');
fs.writeFileSync(cartFile, cart, 'utf8');

// 3. Checkout Page
let checkFile = 'apps/customer-web/src/pages/CheckoutPage.tsx';
let check = fs.readFileSync(checkFile, 'utf8');
check = check.replace(/imageUrl/g, 'image_url');
fs.writeFileSync(checkFile, check, 'utf8');

// 4. Order Ready Page
let readyFile = 'apps/customer-web/src/pages/OrderReadyPage.tsx';
let ready = fs.readFileSync(readyFile, 'utf8');
ready = ready.replace(/'QR_GENERATED'/g, "'QUEUED'");
ready = ready.replace(/'READY_TO_DISPENSE'/g, "'QUEUED'");
ready = ready.replace(/'VALIDATING'/g, "'AUTHORIZED'");
ready = ready.replace(/'QR_SCANNED'/g, "'AUTHORIZED'");
fs.writeFileSync(readyFile, ready, 'utf8');

console.log('Fixed frontends');
