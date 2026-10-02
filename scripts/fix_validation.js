const fs = require('fs');

// 1. validation schema
let valFile = 'packages/validation/src/index.ts';
let val = fs.readFileSync(valFile, 'utf8');
val = val.replace(/order_id:/g, 'job_id:');
fs.writeFileSync(valFile, val, 'utf8');

// 2. machine.service.ts qrService
let mService = fs.readFileSync('services/backend/src/services/machine.service.ts', 'utf8');
mService = mService.replace(/await qrService\.markTokenUsed\([\s\S]*?\);/g, '');
mService = mService.replace(/qrToken\.id/g, 'payload.job_id');
mService = mService.replace(/qrToken\.machine_code/g, 'payload.machine_code');
mService = mService.replace(/qrToken/g, 'payload'); // rough fallback
fs.writeFileSync('services/backend/src/services/machine.service.ts', mService, 'utf8');

console.log('Fixed');
