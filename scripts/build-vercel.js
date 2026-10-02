const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'dist');
const terminalDist = path.join(rootDir, 'apps', 'payment-terminal', 'dist');
const adminDist = path.join(rootDir, 'apps', 'admin-dashboard', 'dist');

console.log('📦 Assembling unified Vercel deployment bundle...');

// Clean/ensure root dist directory
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// 1. Copy Public Customer Web (apps/payment-terminal/dist) -> dist/
if (fs.existsSync(terminalDist)) {
  fs.cpSync(terminalDist, outDir, { recursive: true });
  console.log('✓ Public Customer Web App copied to root /');
} else {
  console.warn('⚠️ payment-terminal/dist not found');
}

// 2. Copy Admin Dashboard (apps/admin-dashboard/dist) -> dist/admin/
const adminOutDir = path.join(outDir, 'admin');
if (fs.existsSync(adminDist)) {
  fs.mkdirSync(adminOutDir, { recursive: true });
  fs.cpSync(adminDist, adminOutDir, { recursive: true });
  console.log('✓ Admin Dashboard copied to /admin');
} else {
  console.warn('⚠️ admin-dashboard/dist not found');
}

console.log('✨ Unified Vercel production build ready at dist/');
