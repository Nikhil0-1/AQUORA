const fs = require('fs');
let checkFile = 'apps/customer-web/src/pages/CheckoutPage.tsx';
let check = fs.readFileSync(checkFile, 'utf8');
check = check.replace(/Qty: \{item\.quantity, volume_ml: 100 \}/g, 'Qty: {item.quantity}');
fs.writeFileSync(checkFile, check, 'utf8');
console.log('Fixed checkout');
