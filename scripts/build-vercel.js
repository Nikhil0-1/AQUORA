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

// 1. Copy Public Customer Web -> dist/
const publicWebDist = fs.existsSync(terminalDist) ? terminalDist : path.join(rootDir, 'AQUORA_PUBLIC_WEB', 'dist');
if (fs.existsSync(publicWebDist)) {
  fs.cpSync(publicWebDist, outDir, { recursive: true });
  console.log(`✓ Public Customer Web App copied to root / (from ${path.relative(rootDir, publicWebDist)})`);
} else {
  console.warn('⚠️ Public Web dist not found');
}

// 2. Copy Admin Dashboard -> dist/admin/
const adminOutDir = path.join(outDir, 'admin');
const adminSrcDist = fs.existsSync(adminDist) ? adminDist : path.join(rootDir, 'AQUORA_ADMIN_PANEL', 'frontend', 'dist');
if (fs.existsSync(adminSrcDist)) {
  fs.mkdirSync(adminOutDir, { recursive: true });
  fs.cpSync(adminSrcDist, adminOutDir, { recursive: true });
  console.log(`✓ Admin Dashboard copied to /admin (from ${path.relative(rootDir, adminSrcDist)})`);
} else {
  console.warn('⚠️ Admin Dashboard dist not found');
}

console.log('✨ Unified Vercel production build ready at dist/');
