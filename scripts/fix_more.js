const fs = require('fs');

// 1. machine.router.ts
let mRouter = fs.readFileSync('services/backend/src/routes/machine.router.ts', 'utf8');
mRouter = mRouter.replace(/order_id:/g, 'job_id:'); 
mRouter = mRouter.replace(/req\.body\.order_id/g, 'req.body.job_id');
// Remove validateQRScan route block completely
mRouter = mRouter.replace(/machineRouter\.post\('\/qr\/validate'[\s\S]*?\}\);\n/m, '');
fs.writeFileSync('services/backend/src/routes/machine.router.ts', mRouter, 'utf8');

// 2. machine.service.ts
let mService = fs.readFileSync('services/backend/src/services/machine.service.ts', 'utf8');
mService = mService.replace(/\.order_id/g, '.job_id');
mService = mService.replace(/getQRTokenByOrderId/g, 'getDispenseJobByOrderId');
mService = mService.replace(/qrService\.markTokenUsed\(qrToken\.id\);/g, '');
mService = mService.replace(/const qrToken = await this\.db\.getDispenseJobByOrderId\(payload\.job_id\);/g, '');
mService = mService.replace(/if \(qrToken\) \{[\s\S]*?\}/g, '');
fs.writeFileSync('services/backend/src/services/machine.service.ts', mService, 'utf8');

// 3. order.service.ts
let oService = fs.readFileSync('services/backend/src/services/order.service.ts', 'utf8');
oService = oService.replace(/customer_email:/g, '// customer_email:');
fs.writeFileSync('services/backend/src/services/order.service.ts', oService, 'utf8');

console.log('Fixed');
