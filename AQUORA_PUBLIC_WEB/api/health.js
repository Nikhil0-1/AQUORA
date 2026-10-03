export const config = { runtime: 'edge' };
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
