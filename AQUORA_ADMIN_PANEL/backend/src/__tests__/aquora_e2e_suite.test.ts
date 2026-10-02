import { describe, it, expect } from 'vitest';
import { getDatabase } from '../db';
import { orderService } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import { machineService } from '../services/machine.service';
import { PROTOCOL_VERSION, ErrorCode } from '@aquora/machine-protocol';

describe('AQUORA End-to-End System Tests', () => {
  const db = getDatabase();
  let sharedJob: any;

  it('1. Verifies products and channels are correctly configured', async () => {
    const products = await db.getProducts();
    expect(products.length).toBeGreaterThanOrEqual(5);

    const classic = products.find((p) => p.name.includes('Classic'));
    expect(classic).toBeDefined();
    expect(classic?.channel_id).toBe(1);

    const aloe = products.find((p) => p.name.includes('Aloe'));
    expect(aloe).toBeDefined();
    expect(aloe?.channel_id).toBe(2);
  });

  it('2. Customer creates order on System 1 Payment Terminal', async () => {
    const products = await db.getProducts();
    const aloeProduct = products.find((p) => p.name.includes('Aloe'))!;

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      customer_name: 'Test Customer',
      items: [
        {
          product_id: aloeProduct.id,
          quantity: 1,
          volume_ml: 100,
        },
      ],
    });

    expect(order).toBeDefined();
    expect(order.order_status).toBe('CREATED');
    expect(order.payment_status).toBe('PENDING');
    expect(order.amount).toBe(60.0);
    expect(order.items[0].channel_id).toBe(2);
  });

  it('3. Section 22 & 78: Payment Webhook Idempotency (Webhook arrives 5 times)', async () => {
    const products = await db.getProducts();
    const aloe = products.find((p) => p.name.includes('Aloe'))!;

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      customer_name: 'Idempotency Tester',
      items: [{ product_id: aloe.id, quantity: 1, volume_ml: 100 }],
    });

    const paymentId = `pay_webhook_test_${Date.now()}`;

    // Call 1
    const res1 = await paymentService.handleVerifiedPayment({
      order_id: order.id,
      payment_id: paymentId,
      amount: 60.0,
      provider: 'RAZORPAY',
    });

    expect(res1.success).toBe(true);
    expect(res1.order.payment_status).toBe('PAID');
    expect(res1.order.order_status).toBe('QUEUED');
    expect(res1.job).toBeDefined();
    const authorizedJobId = res1.job?.id;

    // Call 2, 3, 4, 5 with identical payment_id
    for (let i = 2; i <= 5; i++) {
      const resN = await paymentService.handleVerifiedPayment({
        order_id: order.id,
        payment_id: paymentId,
        amount: 60.0,
        provider: 'RAZORPAY',
      });

      expect(resN.success).toBe(true);
      expect(resN.job?.id).toBe(authorizedJobId); // EXACT same single job
    }

    // Verify exactly ONE job exists for this order
    const jobs = (db as any).dispenseJobs.filter((j: any) => j.order_id === order.id);
    expect(jobs.length).toBe(1);
  });

  it('4. System 2 receives and validates job from queue', async () => {
    sharedJob = await machineService.getNextJobForMachine('AQ-DM-001');
    expect(sharedJob).toBeDefined();
    expect(sharedJob.protocol_version).toBe(PROTOCOL_VERSION);
    expect(sharedJob.channel).toBe(2);
    expect(sharedJob.target_volume_ml).toBe(100);

    // Job Accept
    const acceptRes = await machineService.handleJobAccept({
      job_id: sharedJob.job_id,
      machine_id: 'AQ-DM-001',
      status: 'ACCEPTED',
      timestamp: new Date().toISOString(),
    });
    expect(acceptRes.status).toBe('ACCEPTED');
  });

  it('5. System 2 starts dispensing with real pulse progress reporting', async () => {
    expect(sharedJob).toBeDefined();

    // Start Pump
    const startRes = await machineService.handleDispenseStart({
      machine_id: 'AQ-DM-001',
      machine_code: 'AQ-DM-001',
      channel_number: sharedJob.channel,
      job_id: sharedJob.job_id,
      target_volume_ml: 100,
      timestamp: new Date().toISOString(),
    });
    expect(startRes.job_status).toBe('DISPENSING');

    // Live Flow Sensor Progress (e.g. 63ml actual from 630 pulses)
    await machineService.handleDispenseProgress({
      machine_id: 'AQ-DM-001',
      machine_code: 'AQ-DM-001',
      channel_number: 2,
      job_id: sharedJob.job_id,
      target_volume_ml: 100,
      dispensed_volume_ml: 63,
      flow_rate_ml_s: 15.2,
      elapsed_seconds: 4.1,
      percentage: 63,
    });

    const currentOrder = await db.getOrderById(sharedJob.order_id);
    expect(currentOrder?.order_status).toBe('DISPENSING');
  });

  it('6. Target reached: System 2 stops pump and completes job with Section 111 idempotency', async () => {
    expect(sharedJob).toBeDefined();

    // Complete Job: 1000 pulses = 100ml
    const completeRes1 = await machineService.handleDispenseComplete({
      machine_id: 'AQ-DM-001',
      machine_code: 'AQ-DM-001',
      channel_number: 2,
      job_id: sharedJob.job_id,
      timestamp: new Date().toISOString(),
      final_volume_ml: 100,
      duration_seconds: 6.5,
      total_pulses: 1000,
    });
    expect(completeRes1.job_status).toBe('DISPENSED');

    // Duplicate Complete Call (network retry): must remain idempotent!
    const completeRes2 = await machineService.handleDispenseComplete({
      machine_id: 'AQ-DM-001',
      machine_code: 'AQ-DM-001',
      channel_number: 2,
      job_id: sharedJob.job_id,
      timestamp: new Date().toISOString(),
      final_volume_ml: 100,
      duration_seconds: 6.5,
      total_pulses: 1000,
    });
    expect(completeRes2.job_status).toBe('DISPENSED');

    const finalOrder = await db.getOrderById(sharedJob.order_id);
    expect(finalOrder?.order_status).toBe('DISPENSED');
  });

  it('7. Handles hardware faults: Flow Error / Pump Timeout aborts cleanly', async () => {
    const products = await db.getProducts();
    const classic = products.find((p) => p.name.includes('Classic'))!;
    expect(classic).toBeDefined();

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      items: [{ product_id: classic.id, quantity: 1, volume_ml: 50 }],
    });

    const paymentRes = await paymentService.handleVerifiedPayment({
      order_id: order.id,
      payment_id: `pay_fault_test_${Date.now()}`,
      amount: order.amount,
      provider: 'RAZORPAY',
    });

    // Simulate Pump Timeout / No-flow failure
    await machineService.handleDispenseFail({
      machine_id: 'AQ-DM-001',
      machine_code: 'AQ-DM-001',
      channel_number: 1,
      job_id: paymentRes.job!.id,
      dispensed_so_far_ml: 12,
      error_code: ErrorCode.FLOW_ERROR,
      error_message: 'No flow pulses detected after pump activation',
    });

    const failedOrder = await db.getOrderById(order.id);
    expect(failedOrder?.order_status).toBe('FAILED');
    expect(failedOrder?.payment_status).toBe('PAID'); // Payment remains PAID independently
  });
});
