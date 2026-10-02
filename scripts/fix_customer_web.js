const fs = require('fs');

// 1. replace in CartContext
let cartFile = 'apps/customer-web/src/context/CartContext.tsx';
let cart = fs.readFileSync(cartFile, 'utf8');
cart = cart.replace(/productId/g, 'product_id');
fs.writeFileSync(cartFile, cart, 'utf8');

// 2. CheckoutPage
let checkFile = 'apps/customer-web/src/pages/CheckoutPage.tsx';
let check = fs.readFileSync(checkFile, 'utf8');
check = check.replace(/productId:/g, 'product_id:');
check = check.replace(/quantity\s*\}/g, 'quantity, volume_ml: 100 }'); 
check = check.replace(/processPayment/g, 'processMockPayment');
fs.writeFileSync(checkFile, check, 'utf8');

// 3. ProductCard
let pcFile = 'apps/customer-web/src/components/ProductCard.tsx';
let pc = fs.readFileSync(pcFile, 'utf8');
pc = pc.replace(/imageUrl/g, 'image_url');
pc = pc.replace(/inStock/g, 'is_available');
fs.writeFileSync(pcFile, pc, 'utf8');

// 4. CartDrawer
let cdFile = 'apps/customer-web/src/components/CartDrawer.tsx';
let cd = fs.readFileSync(cdFile, 'utf8');
cd = cd.replace(/imageUrl/g, 'image_url');
fs.writeFileSync(cdFile, cd, 'utf8');

// 5. OrderReadyPage
let orp = fs.readFileSync('apps/customer-web/src/pages/OrderReadyPage.tsx', 'utf8');
orp = orp.replace(/=== 'QUEUED'/g, "=== 'AUTHORIZED'"); // simplify statuses
orp = orp.replace(/=== 'AUTHORIZED' \|\| order\.order_status === 'AUTHORIZED'/g, "=== 'AUTHORIZED'"); 
orp = orp.replace(/\|\| order\.order_status === 'EXPIRED'/g, ""); 
fs.writeFileSync('apps/customer-web/src/pages/OrderReadyPage.tsx', orp, 'utf8');

// 6. Fix API Client (leftover)
let apiFile = 'packages/api-client/src/index.ts';
let api = fs.readFileSync(apiFile, 'utf8');
api = api.replace(/validateQR[\s\S]*?\}\n/m, '');
api = api.replace(/export \{[\s\S]*?QRValidateRequest,[\s\S]*?\}/m, "export { \n// ...\n}");
fs.writeFileSync(apiFile, api, 'utf8');

console.log('Fixed frontends');
