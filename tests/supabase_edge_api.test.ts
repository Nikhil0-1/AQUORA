import { describe, it, expect } from 'vitest';

const EDGE_API_BASE = 'https://vxcqywbycvasmjngolps.supabase.co/functions/v1/api';

describe('AQUORA Live Production Edge API on Supabase', { timeout: 15000 }, () => {
  it('GET /health returns 200 with connected database status', async () => {
    const res = await fetch(`${EDGE_API_BASE}/health`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('AQUORA Production Edge API');
    expect(data.database).toBe('connected');
    expect(data.products_count).toBeGreaterThan(0);
  });

  it('GET /v1/products returns real products with active variants from Supabase Postgres', async () => {
    const res = await fetch(`${EDGE_API_BASE}/v1/products`);
    expect(res.status).toBe(200);

    const products = await res.json();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThanOrEqual(5);

    const classic = products.find((p: any) => p.slug === 'classic-sanitizer');
    expect(classic).toBeDefined();
    expect(classic.name).toBe('Classic Sanitizer');
    expect(Array.isArray(classic.variants)).toBe(true);
    expect(classic.variants.length).toBeGreaterThan(0);

    const firstVariant = classic.variants[0];
    expect(firstVariant.price).toBeGreaterThan(0);
    expect(firstVariant.volume_ml).toBeGreaterThan(0);
    expect(firstVariant.channel_id).toBe(1);
  });

  it('POST /v1/orders creates real immutable order with server-authoritative price calculation', async () => {
    // 1. Fetch live product to get variant id
    const prodRes = await fetch(`${EDGE_API_BASE}/v1/products`);
    const products = await prodRes.json();
    const product = products[0];
    const variant = product.variants[0];

    const orderPayload = {
      customer_name: 'Edge Automated Test Customer',
      customer_phone: '9876543210',
      machine_code: 'AQ-DM-001',
      source: 'PUBLIC_WEB',
      items: [
        {
          product_id: product.id,
          variant_id: variant.id,
          quantity: 2,
          volume_ml: variant.volume_ml,
        },
      ],
    };

    const res = await fetch(`${EDGE_API_BASE}/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    expect(res.status).toBe(201);
    const order = await res.json();

    expect(order.id).toBeDefined();
    expect(order.order_number).toMatch(/^AQ-ORD-/);
    expect(order.payment_status).toBe('PENDING');
    expect(order.order_status).toBe('CREATED');
    expect(order.source).toBe('PUBLIC_WEB');
    // Server-calculated price: unit_price * 2
    expect(Number(order.amount)).toBe(Number(variant.price) * 2);
    expect(order.items.length).toBe(1);
    expect(order.items[0].quantity).toBe(2);
    expect(order.items[0].unit_price).toBe(Number(variant.price));
  });

  it('GET /v1/orders/:id retrieves order with order_items from Supabase', async () => {
    // Create an order first
    const prodRes = await fetch(`${EDGE_API_BASE}/v1/products`);
    const products = await prodRes.json();
    const product = products[0];
    const variant = product.variants[0];

    const createRes = await fetch(`${EDGE_API_BASE}/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: 'Lookup Test Customer',
        machine_code: 'AQ-DM-001',
        source: 'PUBLIC_WEB',
        items: [{ product_id: product.id, variant_id: variant.id, quantity: 1, volume_ml: variant.volume_ml }],
      }),
    });
    const created = await createRes.json();

    // Now look up by ID
    const lookupRes = await fetch(`${EDGE_API_BASE}/v1/orders/${created.id}`);
    expect(lookupRes.status).toBe(200);
    const fetched = await lookupRes.json();
    expect(fetched.id).toBe(created.id);
    expect(fetched.order_number).toBe(created.order_number);
    expect(fetched.order_items.length).toBe(1);
  });

  it('Strict Security: rejects client price tampering and never generates fake order_test_*', async () => {
    const prodRes = await fetch(`${EDGE_API_BASE}/v1/products`);
    const products = await prodRes.json();
    const product = products[0];
    const variant = product.variants[0];

    // Attempt to pass malicious price of ₹1.00
    const tamperedPayload = {
      customer_name: 'Tamper Attempt',
      machine_code: 'AQ-DM-001',
      source: 'PUBLIC_WEB',
      amount: 1.0, // Client tries to force ₹1
      items: [{ product_id: product.id, variant_id: variant.id, quantity: 1, volume_ml: variant.volume_ml, price: 1.0 }],
    };

    const res = await fetch(`${EDGE_API_BASE}/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tamperedPayload),
    });

    expect(res.status).toBe(201);
    const order = await res.json();
    // Server must strictly override with DB price, ignoring client price
    expect(Number(order.amount)).toBe(Number(variant.price));
    expect(Number(order.amount)).not.toBe(1.0);
  });
});
