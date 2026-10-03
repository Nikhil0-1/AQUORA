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

// 3. Generate High-Performance Vercel Edge API Proxies connecting to Supabase Edge Backend
try {
  const apiDir = path.join(rootDir, 'api');
  const webApiDir = path.join(rootDir, 'AQUORA_PUBLIC_WEB', 'api');
  fs.mkdirSync(apiDir, { recursive: true });
  fs.mkdirSync(webApiDir, { recursive: true });

  const healthEdgeCode = `export const config = { runtime: 'edge' };
export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with',
      },
    });
  }
  const targetUrl = 'https://vxcqywbycvasmjngolps.supabase.co/functions/v1/api/health';
  const headers = new Headers(req.headers);
  headers.delete('host');
  try {
    const res = await fetch(targetUrl, { method: req.method, headers });
    const resHeaders = new Headers(res.headers);
    resHeaders.set('Access-Control-Allow-Origin', '*');
    resHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    resHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-requested-with');
    return new Response(res.body, { status: res.status, headers: resHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Gateway error', message: err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};
`;

  const apiEdgeCode = `export const config = { runtime: 'edge' };
export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with',
      },
    });
  }
  const edgeApiBase = 'https://vxcqywbycvasmjngolps.supabase.co/functions/v1/api';
  const url = new URL(req.url);
  let subPath = url.pathname;
  if (subPath.startsWith('/api')) {
    subPath = subPath.slice(4);
  }
  if (!subPath.startsWith('/')) {
    subPath = '/' + subPath;
  }
  const targetUrl = \`\${edgeApiBase}\${subPath}\${url.search}\`;
  const headers = new Headers(req.headers);
  headers.delete('host');
  try {
    const fetchOptions = { method: req.method, headers };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = await req.arrayBuffer();
    }
    const res = await fetch(targetUrl, fetchOptions);
    const resHeaders = new Headers(res.headers);
    resHeaders.set('Access-Control-Allow-Origin', '*');
    resHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    resHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-requested-with');
    return new Response(res.body, { status: res.status, headers: resHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Gateway error', message: err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};
`;

  fs.writeFileSync(path.join(apiDir, 'health.js'), healthEdgeCode);
  fs.writeFileSync(path.join(apiDir, 'index.js'), healthEdgeCode);
  fs.writeFileSync(path.join(apiDir, '[...all].js'), apiEdgeCode);

  fs.writeFileSync(path.join(webApiDir, 'health.js'), healthEdgeCode);
  fs.writeFileSync(path.join(webApiDir, 'index.js'), healthEdgeCode);
  fs.writeFileSync(path.join(webApiDir, '[...all].js'), apiEdgeCode);

  console.log('✓ Vercel Edge proxies configured to Supabase Edge API in api/ and AQUORA_PUBLIC_WEB/api/');
} catch (bundleErr) {
  console.warn('⚠️ Edge proxy generation notice:', bundleErr.message);
}

console.log('✨ Unified Vercel production build ready at dist/');
