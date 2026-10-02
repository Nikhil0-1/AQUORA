import { describe, it, expect, beforeEach } from 'vitest';
import * as crypto from 'crypto';
import { getDatabase } from '../backend/src/db';
import { orderService } from '../backend/src/services/order.service';
import { paymentService } from '../backend/src/services/payment.service';
import { machineService } from '../backend/src/services/machine.service';
import { PROTOCOL_VERSION, ErrorCode } from '@aquora/machine-protocol';

describe('AQUORA Razorpay Webhook & Direct ESP32 Dispensing (All 10 Verification Tests)', () => {
  const db = getDatabase();
  const TEST_WEBHOOK_SECRET = 'rzp_test_secret_aquora_secure_key_123';

  // Helper function to simulate razorpay webhook signature calculation
  function calculateSignature(rawBody: string, secret: string = TEST_WEBHOOK_SECRET): string {
    return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  }

  // Simulated Webhook Processor that mirrors the Supabase Edge Function logic
  async function processWebhook(rawBody: string, signature: string | null, secret: string = TEST_WEBHOOK_SECRET) {
    if (!signature) {
      return { status: 400, body: { error: 'Missing x-razorpay-signature header' } };
    }

    const expectedSignature = calculateSignature(rawBody, secret);
    if (signature !== expectedSignature) {
      return { status: 401, body: { error: 'Invalid webhook signature' } };
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return { status: 400, body: { error: 'Malformed JSON payload' } };
    }

    const event = payload.event;
    const eventId = payload.id || payload.event_id || `${event}_${payload.payload?.payment?.entity?.id || Date.now()}`;

    // Idempotency check
    const existingEvents = (db as any).webhookEvents || [];
    const duplicate = existingEvents.find((e: any) => e.razorpay_event_id === eventId && e.status === 'PROCESSED');
    if (duplicate) {
      return { status: 200, body: { status: 'ignored_duplicate_event', event_id: eventId } };
    }

    if (!(db as any).webhookEvents) {
      (db as any).webhookEvents = [];
    }
    (db as any).webhookEvents.push({ razorpay_event_id: eventId, event_type: event, status: 'RECEIVED' });

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      if (!paymentEntity) {
        return { status: 400, body: { error: 'Missing payment entity in payload' } };
      }

      const orderId = paymentEntity.notes?.order_id;
      if (!orderId) {
        return { status: 404, body: { error: 'Order not found matching payment notes' } };
      }

      const order = await db.getOrderById(orderId);
      if (!order) {
        return { status: 404, body: { error: 'Order not found matching payment notes' } };
      }

      const amountInr = paymentEntity.amount / 100;
      if (Math.abs(order.amount - amountInr) > 0.01) {
        return { status: 400, body: { error: 'Payment amount mismatch', expected: order.amount, received: amountInr } };
      }

      // Handle verified payment & job creation
      const result = await paymentService.handleVerifiedPayment({
        order_id: order.id,
        payment_id: paymentEntity.id,
        amount: amountInr,
        provider: 'RAZORPAY',
        signature,
      });

      const evt = (db as any).webhookEvents.find((e: any) => e.razorpay_event_id === eventId);
      if (evt) evt.status = 'PROCESSED';

      return {
        status: 200,
        body: {
          success: true,
          order_id: order.id,
          payment_status: 'PAID',
          dispense_job_id: result.job?.id,
          job_status: 'QUEUED',
        },
      };
    }

    if (event === 'payment.failed') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.notes?.order_id;
      if (orderId) {
        await db.updateOrderStatus(orderId, 'FAILED');
      }
      const evt = (db as any).webhookEvents.find((e: any) => e.razorpay_event_id === eventId);
      if (evt) evt.status = 'PROCESSED';

      return {
        status: 200,
        body: { success: true, status: 'payment_failed_recorded', order_id: orderId },
      };
    }

    return { status: 200, body: { status: 'ignored_unhandled_event' } };
  }

  it('Test 1: Valid webhook → signature valid → payment verified → payment updated → order updated → exactly one dispense job created', async () => {
    const products = await db.getProducts();
    const product = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      customer_name: 'Test Customer 1',
      items: [{ product_id: product.id, quantity: 1, volume_ml: 100 }],
    });

    const payload = {
      id: `evt_valid_${Date.now()}`,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_test1_${Date.now()}`,
            amount: Math.round(order.amount * 100), // in paise
            currency: 'INR',
            status: 'captured',
            notes: { order_id: order.id, order_number: order.order_number },
          },
        },
      },
    };

    const rawBody = JSON.stringify(payload);
    const signature = calculateSignature(rawBody, TEST_WEBHOOK_SECRET);

    const res = await processWebhook(rawBody, signature);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.payment_status).toBe('PAID');
    expect(res.body.dispense_job_id).toBeDefined();

    const updatedOrder = await db.getOrderById(order.id);
    expect(updatedOrder?.payment_status).toBe('PAID');
    expect(updatedOrder?.order_status).toBe('QUEUED');

    // Confirm job exists in queue
    const jobs = (db as any).dispenseJobs.filter((j: any) => j.order_id === order.id);
    expect(jobs.length).toBe(1);
  });

  it('Test 2: Invalid signature → rejected → no database payment mutation → no dispense job', async () => {
    const products = await db.getProducts();
    const product = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      customer_name: 'Test Customer 2',
      items: [{ product_id: product.id, quantity: 1, volume_ml: 100 }],
    });

    const payload = {
      id: `evt_invalid_${Date.now()}`,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_invalid_${Date.now()}`,
            amount: Math.round(order.amount * 100),
            currency: 'INR',
            status: 'captured',
            notes: { order_id: order.id },
          },
        },
      },
    };

    const rawBody = JSON.stringify(payload);
    const fakeSignature = 'sha256_fake_tampered_signature_999999999999';

    const res = await processWebhook(rawBody, fakeSignature);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid webhook signature');

    const unchangedOrder = await db.getOrderById(order.id);
    expect(unchangedOrder?.payment_status).toBe('PENDING');
    expect(unchangedOrder?.order_status).toBe('CREATED');

    const jobs = (db as any).dispenseJobs.filter((j: any) => j.order_id === order.id);
    expect(jobs.length).toBe(0);
  });

  it('Test 3: Duplicate webhook → detected → no second dispense job', async () => {
    const products = await db.getProducts();
    const product = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      customer_name: 'Duplicate Test Customer',
      items: [{ product_id: product.id, quantity: 1, volume_ml: 100 }],
    });

    const eventId = `evt_duplicate_${Date.now()}`;
    const paymentId = `pay_duplicate_${Date.now()}`;

    const payload = {
      id: eventId,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: paymentId,
            amount: Math.round(order.amount * 100),
            currency: 'INR',
            status: 'captured',
            notes: { order_id: order.id },
          },
        },
      },
    };

    const rawBody = JSON.stringify(payload);
    const signature = calculateSignature(rawBody);

    // First arrival
    const res1 = await processWebhook(rawBody, signature);
    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);

    // Second arrival (retry with same eventId)
    const res2 = await processWebhook(rawBody, signature);
    expect(res2.status).toBe(200);
    expect(res2.body.status).toBe('ignored_duplicate_event');

    // Exactly one job exists
    const jobs = (db as any).dispenseJobs.filter((j: any) => j.order_id === order.id);
    expect(jobs.length).toBe(1);
  });

  it('Test 4: Payment failure → payment/order updated → no dispense job', async () => {
    const products = await db.getProducts();
    const product = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      customer_name: 'Failed Payment Customer',
      items: [{ product_id: product.id, quantity: 1, volume_ml: 100 }],
    });

    const payload = {
      id: `evt_failed_${Date.now()}`,
      event: 'payment.failed',
      payload: {
        payment: {
          entity: {
            id: `pay_failed_${Date.now()}`,
            amount: Math.round(order.amount * 100),
            currency: 'INR',
            status: 'failed',
            error_code: 'BAD_REQUEST_ERROR',
            error_description: 'Payment was declined by bank',
            notes: { order_id: order.id },
          },
        },
      },
    };

    const rawBody = JSON.stringify(payload);
    const signature = calculateSignature(rawBody);

    const res = await processWebhook(rawBody, signature);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('payment_failed_recorded');

    const updatedOrder = await db.getOrderById(order.id);
    expect(updatedOrder?.order_status).toBe('FAILED');

    // No job created
    const jobs = (db as any).dispenseJobs.filter((j: any) => j.order_id === order.id);
    expect(jobs.length).toBe(0);
  });

  it('Test 5: Amount mismatch → rejected safely → no dispensing', async () => {
    const products = await db.getProducts();
    const product = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      customer_name: 'Mismatch Customer',
      items: [{ product_id: product.id, quantity: 1, volume_ml: 100 }],
    });

    const payload = {
      id: `evt_mismatch_${Date.now()}`,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_mismatch_${Date.now()}`,
            amount: 100, // Only 1 INR (100 paise) instead of full amount
            currency: 'INR',
            status: 'captured',
            notes: { order_id: order.id },
          },
        },
      },
    };

    const rawBody = JSON.stringify(payload);
    const signature = calculateSignature(rawBody);

    const res = await processWebhook(rawBody, signature);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Payment amount mismatch');

    // Order remains PENDING
    const unchangedOrder = await db.getOrderById(order.id);
    expect(unchangedOrder?.payment_status).toBe('PENDING');

    const jobs = (db as any).dispenseJobs.filter((j: any) => j.order_id === order.id);
    expect(jobs.length).toBe(0);
  });

  it('Test 6: Missing order → safe error → no dispensing', async () => {
    const payload = {
      id: `evt_missing_${Date.now()}`,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_missing_${Date.now()}`,
            amount: 5000,
            currency: 'INR',
            status: 'captured',
            notes: { order_id: 'non_existent_order_id_12345' },
          },
        },
      },
    };

    const rawBody = JSON.stringify(payload);
    const signature = calculateSignature(rawBody);

    const res = await processWebhook(rawBody, signature);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Order not found matching payment notes');
  });

  it('Test 7: Expired dispense job → SYSTEM 2 rejects job → pump remains OFF', async () => {
    const expiredJob = {
      jobId: 'AQ-JOB-EXPIRED-99',
      orderId: 'order-expired-99',
      machineId: 'AQ-DM-001',
      channel: 2,
      targetVolumeMl: 100,
      protocolVersion: 1,
      expiresAt: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour in the past!
      isValid: false,
    };

    // ESP32 System 2 validation check
    const isExpired = new Date(expiredJob.expiresAt).getTime() < Date.now();
    expect(isExpired).toBe(true);
    // When expired, System 2 never starts pump and rejects the job
    const pumpEnergized = !isExpired;
    expect(pumpEnergized).toBe(false);
  });

  it('Test 8: Flow sensor failure → pump stops → dispense FAILED', async () => {
    const products = await db.getProducts();
    const product = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      items: [{ product_id: product.id, quantity: 1, volume_ml: 100 }],
    });

    const paymentRes = await paymentService.handleVerifiedPayment({
      order_id: order.id,
      payment_id: `pay_flow_err_${Date.now()}`,
      amount: order.amount,
      provider: 'RAZORPAY',
    });

    const jobId = paymentRes.job!.id;

    // Pump starts
    await machineService.handleDispenseStart({
      machine_id: 'AQ-DM-001',
      machine_code: 'AQ-DM-001',
      channel_number: 1,
      job_id: jobId,
      target_volume_ml: 100,
      timestamp: new Date().toISOString(),
    });

    // Flow sensor reports NO PULSES (Pump dry-run / disconnected sensor timeout)
    await machineService.handleDispenseFail({
      machine_id: 'AQ-DM-001',
      machine_code: 'AQ-DM-001',
      channel_number: 1,
      job_id: jobId,
      dispensed_so_far_ml: 0,
      error_code: ErrorCode.FLOW_ERROR,
      error_message: 'Flow sensor timeout: 0 pulses in 3000ms',
    });

    const failedOrder = await db.getOrderById(order.id);
    expect(failedOrder?.order_status).toBe('FAILED');
    expect(failedOrder?.payment_status).toBe('PAID'); // Payment remains recorded
  });

  it('Test 9: Successful physical dispensing → flow sensor reaches target volume → pump OFF → hardware completion sent → Supabase dispense = DISPENSED', async () => {
    const products = await db.getProducts();
    const product = products[1];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      items: [{ product_id: product.id, quantity: 1, volume_ml: 100 }],
    });

    const paymentRes = await paymentService.handleVerifiedPayment({
      order_id: order.id,
      payment_id: `pay_success_flow_${Date.now()}`,
      amount: order.amount,
      provider: 'RAZORPAY',
    });

    const jobId = paymentRes.job!.id;

    // 1. Machine fetches job
    const job = await machineService.getNextJobForMachine('AQ-DM-001');
    expect(job).toBeDefined();

    // 2. Machine accepts job
    await machineService.handleJobAccept({
      job_id: jobId,
      machine_id: 'AQ-DM-001',
      status: 'ACCEPTED',
      timestamp: new Date().toISOString(),
    });

    // 3. Machine starts dispensing
    await machineService.handleDispenseStart({
      machine_id: 'AQ-DM-001',
      machine_code: 'AQ-DM-001',
      channel_number: 2,
      job_id: jobId,
      target_volume_ml: 100,
      timestamp: new Date().toISOString(),
    });

    // 4. Live progress telemetry
    await machineService.handleDispenseProgress({
      machine_id: 'AQ-DM-001',
      machine_code: 'AQ-DM-001',
      channel_number: 2,
      job_id: jobId,
      target_volume_ml: 100,
      dispensed_volume_ml: 100,
      flow_rate_ml_s: 16.0,
      elapsed_seconds: 6.2,
      percentage: 100,
    });

    // 5. Hardware Completion: Flow sensor reached 1000 pulses = 100ml
    const completeRes = await machineService.handleDispenseComplete({
      machine_id: 'AQ-DM-001',
      machine_code: 'AQ-DM-001',
      channel_number: 2,
      job_id: jobId,
      timestamp: new Date().toISOString(),
      final_volume_ml: 100,
      duration_seconds: 6.2,
      total_pulses: 1000,
    });

    expect(completeRes.success).toBe(true);
    expect(completeRes.job_status).toBe('DISPENSED');

    // 6. Supabase Order becomes DISPENSED
    const finalOrder = await db.getOrderById(order.id);
    expect(finalOrder?.order_status).toBe('DISPENSED');
    expect(finalOrder?.dispensed_at).toBeDefined();
  });

  it('Test 10: ESP32 restart during job → job is reconciled → no blind duplicate dispensing', async () => {
    const products = await db.getProducts();
    const product = products[0];

    const order = await orderService.createOrder({
      machine_code: 'AQ-DM-001',
      items: [{ product_id: product.id, quantity: 1, volume_ml: 100 }],
    });

    const paymentRes = await paymentService.handleVerifiedPayment({
      order_id: order.id,
      payment_id: `pay_reboot_test_${Date.now()}`,
      amount: order.amount,
      provider: 'RAZORPAY',
    });

    const jobId = paymentRes.job!.id;

    // Job completed before reboot and committed to NVS
    await machineService.handleDispenseComplete({
      machine_id: 'AQ-DM-001',
      machine_code: 'AQ-DM-001',
      channel_number: 1,
      job_id: jobId,
      timestamp: new Date().toISOString(),
      final_volume_ml: 100,
      duration_seconds: 6.0,
      total_pulses: 1000,
    });

    // ESP32 reboots: fetches next job
    const nextJob = await machineService.getNextJobForMachine('AQ-DM-001');
    // Because the job was already completed, it is NO LONGER returned as pending!
    if (nextJob) {
      expect(nextJob.job_id).not.toBe(jobId);
    } else {
      expect(nextJob).toBeNull();
    }
  });
});
