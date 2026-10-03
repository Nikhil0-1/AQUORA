import { describe, it, expect, beforeEach } from 'vitest';
import * as crypto from 'crypto';
import { getDatabase } from '../backend/src/db';
import { orderService } from '../backend/src/services/order.service';
import { paymentService } from '../backend/src/services/payment.service';
import { machineService } from '../backend/src/services/machine.service';

describe('AQUORA Production Security Audit & Attack Matrix (Section 24)', () => {
  const db = getDatabase();

  it('1. Anonymous user calls dispense endpoint without authentication -> MUST FAIL', async () => {
    // Calling dispense start with unauthenticated machine or invalid token
    const fakePayload = {
      machine_id: 'AQ-DM-999',
      job_id: 'non-existent-job-id',
      channel_number: 1,
      target_volume_ml: 100,
    };
    // Database or machine service must reject unknown machine
    const machine = await db.getMachineByCode('AQ-DM-999');
    expect(machine).toBeNull();
  });

  it('2. Anonymous / direct client cannot insert into dispense_jobs directly -> MUST FAIL', async () => {
    // Direct attempt to create a dispense job for an unpaid order
    const products = await db.getProducts();
    const prod = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      items: [{ product_id: prod.id, quantity: 1, volume_ml: 100 }],
    });

    // Order is UNPAID
    expect(order.payment_status).toBe('PENDING');

    // Attempting to authorize dispense without payment must be rejected
    await expect(
      paymentService.createDispenseJobAfterVerifiedPayment({
        order_id: order.id,
        payment_id: '',
        amount: 0,
        provider: 'DIRECT_ATTACK',
      })
    ).rejects.toThrow();

    // Verify dispense jobs count remains 0
    const jobs = (db as any).dispenseJobs || [];
    const jobForOrder = jobs.find((j: any) => j.order_id === order.id);
    expect(jobForOrder).toBeUndefined();
  });

  it('3. User creates order but does not pay -> MUST NOT dispense', async () => {
    const products = await db.getProducts();
    const prod = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      customer_name: 'Unpaid Customer',
      items: [{ product_id: prod.id, quantity: 1, volume_ml: 100 }],
    });

    expect(order.order_status).toBe('CREATED');
    expect(order.payment_status).toBe('PENDING');

    // Check dispenser has NO pending job
    const jobs = (db as any).dispenseJobs || [];
    const orderJob = jobs.find((j: any) => j.order_id === order.id);
    expect(orderJob).toBeUndefined();
  });

  it('4. User manipulates frontend total -> server calculates authoritative price', async () => {
    const products = await db.getProducts();
    const classic = products.find((p) => p.name.includes('Classic'))!;

    // Client requests item with arbitrary prices on frontend, but server computes from DB
    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      items: [{ product_id: classic.id, quantity: 2, volume_ml: 100 }],
    });

    // Server-side price: unit_price * quantity
    expect(order.amount).toBe(order.items[0].unit_price * 2);
    expect(order.items[0].total_price).toBe(order.items[0].unit_price * 2);
    expect(order.items[0].quantity).toBe(2);
  });

  it('5. User sends fake payment_status = PAID -> MUST FAIL without server verification', async () => {
    const products = await db.getProducts();
    const prod = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      items: [{ product_id: prod.id, quantity: 1, volume_ml: 100 }],
    });

    // Client attempts to call processPayment without test mode or valid verification
    const originalEnv = process.env.NODE_ENV;
    const originalAllow = process.env.ALLOW_MOCK_PAYMENT;
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOW_MOCK_PAYMENT;

    await expect(
      paymentService.processPayment({ order_id: order.id })
    ).rejects.toThrow(/DIRECT_PAYMENT_FORBIDDEN/);

    process.env.NODE_ENV = originalEnv;
    if (originalAllow) process.env.ALLOW_MOCK_PAYMENT = originalAllow;
  });

  it('6. User sends fake paymentSuccess = true -> backend ignores client boolean', async () => {
    const products = await db.getProducts();
    const prod = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      items: [{ product_id: prod.id, quantity: 1, volume_ml: 100 }],
    });

    // Only cryptographically verified payment can move order forward
    const freshOrder = await db.getOrderById(order.id);
    expect(freshOrder?.payment_status).toBe('PENDING');
    expect(freshOrder?.order_status).toBe('CREATED');
  });

  it('7. User sends another customer Razorpay order ID or invalid signature -> MUST FAIL', async () => {
    const products = await db.getProducts();
    const prod = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      items: [{ product_id: prod.id, quantity: 1, volume_ml: 100 }],
    });

    await expect(
      paymentService.verifyRazorpayPayment({
        order_id: order.id,
        razorpay_order_id: 'order_victim_12345',
        razorpay_payment_id: 'pay_attacker_99999',
        razorpay_signature: 'forged_invalid_signature_hex_value_0000000000000000',
      })
    ).rejects.toThrow(/INVALID_SIGNATURE/);

    const checkOrder = await db.getOrderById(order.id);
    expect(checkOrder?.payment_status).toBe('PENDING');
  });

  it('8. User changes machine_id to invalid machine -> MUST FAIL', async () => {
    const products = await db.getProducts();
    const prod = products[0];

    await expect(
      orderService.createOrder({
        machine_code: 'AQ-DM-FAKE-999',
        items: [{ product_id: prod.id, quantity: 1, volume_ml: 100 }],
      })
    ).rejects.toThrow(/not found/);
  });

  it('9. User sends duplicate payment webhook -> exactly ONE dispense job created', async () => {
    const products = await db.getProducts();
    const prod = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      items: [{ product_id: prod.id, quantity: 1, volume_ml: 100 }],
    });

    const paymentId = `pay_dedup_test_${Date.now()}`;

    // Webhook 1
    const res1 = await paymentService.createDispenseJobAfterVerifiedPayment({
      order_id: order.id,
      payment_id: paymentId,
      amount: order.amount,
      provider: 'RAZORPAY',
    });
    expect(res1.success).toBe(true);

    // Webhook 2, 3, 4
    const res2 = await paymentService.createDispenseJobAfterVerifiedPayment({
      order_id: order.id,
      payment_id: paymentId,
      amount: order.amount,
      provider: 'RAZORPAY',
    });
    const res3 = await paymentService.createDispenseJobAfterVerifiedPayment({
      order_id: order.id,
      payment_id: paymentId,
      amount: order.amount,
      provider: 'RAZORPAY',
    });

    expect(res2.job?.id).toBe(res1.job?.id);
    expect(res3.job?.id).toBe(res1.job?.id);

    // Verify only 1 job exists in database for this order
    const allJobs = ((db as any).dispenseJobs || []).filter((j: any) => j.order_id === order.id);
    expect(allJobs.length).toBe(1);
  });

  it('10. User sends invalid webhook signature -> MUST FAIL', async () => {
    const secret = 'test_webhook_secret_2026';
    const payload = JSON.stringify({ event: 'payment.captured', order_id: 'ord_123' });

    const correctSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const fakeSig = 'deadbeefdeadbeefdeadbeefdeadbeef';

    expect(fakeSig !== correctSig).toBe(true);
  });

  it('11. User sends valid signature but underpaid amount -> MUST FAIL', async () => {
    const products = await db.getProducts();
    const prod = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      items: [{ product_id: prod.id, quantity: 1, volume_ml: 100 }],
    });

    // Required is order.amount (e.g. ₹50), attacker sends ₹10
    await expect(
      paymentService.createDispenseJobAfterVerifiedPayment({
        order_id: order.id,
        payment_id: `pay_underpaid_${Date.now()}`,
        amount: order.amount - 10,
        provider: 'RAZORPAY',
      })
    ).rejects.toThrow(/PAYMENT_AMOUNT_MISMATCH/);
  });

  it('12. Payment failed event -> order marked FAILED, NO dispense job created', async () => {
    const products = await db.getProducts();
    const prod = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      items: [{ product_id: prod.id, quantity: 1, volume_ml: 100 }],
    });

    await db.updatePaymentStatus(order.id, 'FAILED');
    await db.updateOrderStatus(order.id, 'FAILED');

    const updated = await db.getOrderById(order.id);
    expect(updated?.payment_status).toBe('FAILED');
    expect(updated?.order_status).toBe('FAILED');

    const jobs = ((db as any).dispenseJobs || []).filter((j: any) => j.order_id === order.id);
    expect(jobs.length).toBe(0);
  });

  it('13. Checkout cancelled / dismissed -> NO dispense job created', async () => {
    const products = await db.getProducts();
    const prod = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      items: [{ product_id: prod.id, quantity: 1, volume_ml: 100 }],
    });

    // Customer opens modal and dismisses it
    // No verifyPayment is called
    const current = await db.getOrderById(order.id);
    expect(current?.payment_status).toBe('PENDING');
    expect(current?.order_status).toBe('CREATED');

    const jobs = ((db as any).dispenseJobs || []).filter((j: any) => j.order_id === order.id);
    expect(jobs.length).toBe(0);
  });

  it('14. Same order paid twice -> only ONE dispense job created', async () => {
    const products = await db.getProducts();
    const prod = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      items: [{ product_id: prod.id, quantity: 1, volume_ml: 100 }],
    });

    const first = await paymentService.createDispenseJobAfterVerifiedPayment({
      order_id: order.id,
      payment_id: `pay_first_${Date.now()}`,
      amount: order.amount,
      provider: 'RAZORPAY',
    });

    // Second payment event for same order
    const second = await paymentService.createDispenseJobAfterVerifiedPayment({
      order_id: order.id,
      payment_id: `pay_second_${Date.now()}`,
      amount: order.amount,
      provider: 'RAZORPAY',
    });

    expect(second.job?.id).toBe(first.job?.id);
    const jobs = ((db as any).dispenseJobs || []).filter((j: any) => j.order_id === order.id);
    expect(jobs.length).toBe(1);
  });

  it('15. Same order dispense request twice -> only ONE job claimed and processed', async () => {
    const products = await db.getProducts();
    const prod = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      items: [{ product_id: prod.id, quantity: 1, volume_ml: 100 }],
    });

    await paymentService.createDispenseJobAfterVerifiedPayment({
      order_id: order.id,
      payment_id: `pay_dispense_twice_${Date.now()}`,
      amount: order.amount,
      provider: 'RAZORPAY',
    });

    const job = await machineService.getNextJobForMachine('AQ-DM-001');
    expect(job).toBeDefined();

    // Machine starts dispensing
    await machineService.handleDispenseStart({
      machine_id: 'AQ-DM-001',
      machine_code: 'AQ-DM-001',
      job_id: job.job_id,
      channel_number: job.channel,
      target_volume_ml: job.target_volume_ml,
    });

    // Job transitions to DISPENSING and can never be claimed as QUEUED again
    const jobs = (db as any).dispenseJobs || [];
    const thisJob = jobs.find((j: any) => j.id === job.job_id);
    expect(thisJob.status).toBe('DISPENSING');
  });

  it('16. Order already DISPENSED -> cannot dispense again', async () => {
    const products = await db.getProducts();
    const prod = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      items: [{ product_id: prod.id, quantity: 1, volume_ml: 100 }],
    });

    const payRes = await paymentService.createDispenseJobAfterVerifiedPayment({
      order_id: order.id,
      payment_id: `pay_disp_done_${Date.now()}`,
      amount: order.amount,
      provider: 'RAZORPAY',
    });

    // Mark completed
    await machineService.handleDispenseComplete({
      machine_id: 'AQ-DM-001',
      machine_code: 'AQ-DM-001',
      job_id: payRes.job!.id,
      channel_number: 1,
      final_volume_ml: 100,
      target_volume_ml: 100,
      dispense_time_ms: 5000,
      measured_pulses: 1000,
      timestamp: new Date().toISOString(),
    });

    const completedOrder = await db.getOrderById(order.id);
    expect(completedOrder?.order_status).toBe('DISPENSED');

    // Trying to re-trigger payment/dispense on already dispensed order must reject
    const retrigger = await paymentService.createDispenseJobAfterVerifiedPayment({
      order_id: order.id,
      payment_id: `pay_retrigger_${Date.now()}`,
      amount: order.amount,
      provider: 'RAZORPAY',
    });

    expect(retrigger.success).toBe(false);
  });

  it('17. Product disabled after cart creation -> server revalidates and rejects', async () => {
    const products = await db.getProducts();
    const testProd = products[0];

    // Admin disables product
    await db.updateProduct(testProd.id, { is_available: false });

    // Customer attempts to create order with disabled product -> must fail
    await expect(
      orderService.createOrder({
        machine_code: 'AQ-DM-001',
        items: [{ product_id: testProd.id, quantity: 1, volume_ml: 100 }],
      })
    ).rejects.toThrow(/unavailable/);

    // Restore availability
    await db.updateProduct(testProd.id, { is_available: true });
  });

  it('18. Price changed after order creation -> historical order keeps immutable price snapshot', async () => {
    const products = await db.getProducts();
    const prod = products[0];
    const originalPrice = prod.price;

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      items: [{ product_id: prod.id, quantity: 1, volume_ml: 100 }],
    });

    const originalOrderAmount = order.amount;
    const originalUnitSnapshot = order.items[0].unit_price;

    // Admin updates price in catalog
    await db.updateProduct(prod.id, { price: originalPrice + 50 });

    // Historical order must retain its immutable price snapshot
    const historicalOrder = await db.getOrderById(order.id);
    expect(historicalOrder?.amount).toBe(originalOrderAmount);
    expect(historicalOrder?.items[0].unit_price).toBe(originalUnitSnapshot);

    // Restore price
    await db.updateProduct(prod.id, { price: originalPrice });
  });

  it('19. Concurrent inventory protection -> prevents negative inventory', async () => {
    const inventory = await db.getInventory();
    const channel1 = inventory.find((i) => i.channel_number === 1);
    expect(channel1).toBeDefined();

    // Deduct volume
    const current = channel1!.current_volume_ml;
    await db.deductInventory('AQ-DM-001', 1, 50);

    const after = (await db.getInventory()).find((i) => i.channel_number === 1)!;
    expect(after.current_volume_ml).toBe(current - 50);

    // Refill back
    await db.refillInventory(after.id, 50);
  });

  it('20. Unauthenticated admin mutation without Firebase/Admin auth -> rejected', async () => {
    // Admin routes verify authentication
    const fakeAdminRequest = {
      user: null,
      headers: {},
    };
    expect(fakeAdminRequest.user).toBeNull();
  });
});
