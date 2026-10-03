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

// 1. Copy Unified Public Web & Admin App -> dist/
const aquoraWebDist = path.join(rootDir, 'AQUORA_PUBLIC_WEB', 'dist');
const publicWebDist = fs.existsSync(aquoraWebDist) ? aquoraWebDist : terminalDist;
if (fs.existsSync(publicWebDist)) {
  fs.cpSync(publicWebDist, outDir, { recursive: true });
  console.log(`✓ Unified Web App (Public + Admin) copied to root / (from ${path.relative(rootDir, publicWebDist)})`);
} else {
  console.warn('⚠️ Public Web dist not found');
}

// 2. Fallback legacy standalone Admin Dashboard if needed
if (!fs.existsSync(path.join(outDir, 'index.html')) && fs.existsSync(adminDist)) {
  const adminOutDir = path.join(outDir, 'admin');
  fs.mkdirSync(adminOutDir, { recursive: true });
  fs.cpSync(adminDist, adminOutDir, { recursive: true });
  console.log(`✓ Standalone Admin Dashboard copied to /admin (from ${path.relative(rootDir, adminDist)})`);
}

console.log('✨ Unified Vercel production build ready at dist/');
