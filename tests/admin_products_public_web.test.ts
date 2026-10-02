import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryDatabase } from '../backend/src/db/memory-db';

describe('AQUORA Admin Product Management & Public Web Order Pipeline', () => {
  let db: MemoryDatabase;

  beforeEach(() => {
    db = new MemoryDatabase();
  });

  it('1. Admin can create, update, and toggle products without breaking schema', async () => {
    const newProduct = await db.createProduct({
      name: 'Eucalyptus Hand Sanitizer',
      description: 'Refreshing and calming organic blend',
      category: 'Organic Sanitizers',
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae',
      is_available: true,
      display_order: 10,
    });

    expect(newProduct.id).toBeDefined();
    expect(newProduct.name).toBe('Eucalyptus Hand Sanitizer');
    expect(newProduct.is_available).toBe(true);

    // Update
    const updated = await db.updateProduct(newProduct.id, {
      name: 'Eucalyptus Mint Hand Sanitizer',
      is_available: false,
    });
    expect(updated?.name).toBe('Eucalyptus Mint Hand Sanitizer');
    expect(updated?.is_available).toBe(false);

    // Toggle
    const toggled = await db.toggleProductAvailability(newProduct.id);
    expect(toggled?.is_available).toBe(true);
  });

  it('2. Admin can manage product variants (volume, price, quantity) with server pricing', async () => {
    const products = await db.getProducts();
    const product = products[0];

    const variant = await db.createVariant(product.id, {
      name: 'Travel Pack',
      volume_ml: 60,
      price: 25.0,
      available_quantity: 150,
      display_order: 1,
    });

    expect(variant.id).toBeDefined();
    expect(variant.volume_ml).toBe(60);
    expect(variant.price).toBe(25.0);
    expect(variant.available_quantity).toBe(150);

    // Update price from ₹25 to ₹30
    const updatedVariant = await db.updateVariant(variant.id, {
      price: 30.0,
      available_quantity: 140,
    });
    expect(updatedVariant?.price).toBe(30.0);
    expect(updatedVariant?.available_quantity).toBe(140);
  });

  it('3. Safe Soft-Delete preserves historical orders and snapshots', async () => {
    const products = await db.getProducts();
    const product = products[0];

    // Create an order referencing this product
    const order = await db.createOrder({
      customer_name: 'Historical Customer',
      amount: 15.0,
      source: 'SYSTEM_1_TERMINAL',
      machine_code: 'AQ-DM-001',
      items: [
        {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          volume_ml: 100,
          unit_price: 15.0,
          total_price: 15.0,
          channel_id: 1,
        },
      ],
    });

    expect(order.id).toBeDefined();

    // Now admin attempts to delete the product
    const deleteResult = await db.deleteProduct(product.id);
    expect(deleteResult.success).toBe(true);
    expect(deleteResult.archived).toBe(true); // Must soft-delete/archive

    // Historical order must still exist intact with product name and price snapshot
    const fetchedOrder = await db.getOrderById(order.id);
    expect(fetchedOrder).toBeDefined();
    expect(fetchedOrder?.items[0].product_name).toBe(product.name);
    expect(fetchedOrder?.items[0].unit_price).toBe(15.0);

    // Product is hidden from active catalog
    const activeProducts = await db.getProducts();
    expect(activeProducts.find((p) => p.id === product.id)).toBeUndefined();
  });

  it('4. Public Web order sets source PUBLIC_WEB and server-assigned machine AQ-DM-001', async () => {
    const products = await db.getProducts();
    const product = products[0];

    const webOrder = await db.createOrder({
      customer_name: 'Web Shopper',
      amount: 40.0,
      source: 'PUBLIC_WEB',
      machine_code: 'AQ-DM-001',
      items: [
        {
          product_id: product.id,
          product_name: product.name,
          quantity: 2,
          volume_ml: 250,
          unit_price: 20.0,
          total_price: 40.0,
          channel_id: 1,
        },
      ],
    });

    expect(webOrder.source).toBe('PUBLIC_WEB');
    expect(webOrder.machine_code).toBe('AQ-DM-001');

    const adminOrders = await db.getOrders();
    const found = adminOrders.find((o) => o.id === webOrder.id);
    expect(found?.source).toBe('PUBLIC_WEB');
  });

  it('5. Estimated Inventory adjustments (+ / - / set) and audit log tracking', async () => {
    const inv = await db.getInventory();
    const ch1 = inv.find((i) => i.channel_number === 1)!;
    const initialVol = ch1.current_volume_ml;

    // Quick Refill +200ml
    const updatedCh1 = await db.adjustStock({
      machine_code: 'AQ-DM-001',
      channel_number: 1,
      action: 'ADD',
      amount_ml: 200,
      reason: 'Tank Top-up Refill',
      actor_id: 'admin_test',
    });

    expect(updatedCh1.current_volume_ml).toBe(initialVol + 200);

    // Verify Audit Log
    const logs = await db.getInventoryLogs('AQ-DM-001');
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].channel_number).toBe(1);
    expect(logs[0].change_amount_ml).toBe(200);
    expect(logs[0].resulting_volume_ml).toBe(initialVol + 200);
    expect(logs[0].actor_id).toBe('admin_test');
  });

  it('6. Admin user role mapping (Firebase UID -> AQUORA Admin Role)', async () => {
    const adminUser = await db.upsertAdminUser({
      firebase_uid: 'fb_admin_test_uid_123',
      email: 'lead.admin@aquora.com',
      role: 'SUPER_ADMIN',
      display_name: 'Lead Admin',
      is_active: true,
    });

    expect(adminUser.firebase_uid).toBe('fb_admin_test_uid_123');
    expect(adminUser.role).toBe('SUPER_ADMIN');

    const fetched = await db.getAdminUserByFirebaseUid('fb_admin_test_uid_123');
    expect(fetched).toBeDefined();
    expect(fetched?.email).toBe('lead.admin@aquora.com');
    expect(fetched?.role).toBe('SUPER_ADMIN');
  });
});
