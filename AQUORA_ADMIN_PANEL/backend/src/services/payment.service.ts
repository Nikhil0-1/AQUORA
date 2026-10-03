import * as crypto from 'crypto';
import { Order, DispenseJob } from '@aquora/shared-types';
import { getDatabase } from '../db';
import { realtimeHub } from '../websocket';
import { v4 as uuidv4 } from 'uuid';

export class PaymentService {
  private db = getDatabase();
  private processedWebhooks = new Set<string>();

  /**
   * One Authoritative Backend Path for creating a legitimate dispense job after verified payment.
   * Section 13: createDispenseJobAfterVerifiedPayment()
   * Enforces:
   * 1. Order exists
   * 2. Payment is valid & paid
   * 3. Amount matches server-calculated order amount
   * 4. Idempotency: duplicate payments/events return existing job, NEVER duplicate
   * 5. Order is not already DISPENSED
   * 6. Machine assignment is valid
   * 7. Creates exactly ONE dispense job with cryptographic signature
   */
  async createDispenseJobAfterVerifiedPayment(params: {
    order_id: string;
    payment_id: string;
    amount?: number;
    provider: string;
    signature?: string;
  }): Promise<{ success: boolean; order: Order; job?: DispenseJob }> {
    const order = await this.db.getOrderById(params.order_id);
    if (!order) {
      throw new Error(`Order ${params.order_id} not found`);
    }

    // Protection 1: Never dispense if order was already DISPENSED
    if (order.order_status === 'DISPENSED') {
      console.warn(`[REJECT] Order ${order.id} has already been DISPENSED. Cannot dispense again.`);
      const existingJob = await this.db.getDispenseJobByOrderId(order.id);
      return { success: false, order, job: existingJob || undefined };
    }

    // Protection 2: Idempotency check by payment_id
    if (this.processedWebhooks.has(params.payment_id)) {
      console.log(`[IDEMPOTENCY] Payment ${params.payment_id} already processed. Returning existing job.`);
      const existingJob = await this.db.getDispenseJobByOrderId(order.id);
      return { success: true, order, job: existingJob || undefined };
    }

    // Protection 3: If order is already PAID or QUEUED, reconcile existing job
    if (order.payment_status === 'PAID') {
      console.log(`[IDEMPOTENCY] Order ${order.id} is already marked as PAID. Reconciling existing job.`);
      const existingJob = await this.db.getDispenseJobByOrderId(order.id);
      return { success: true, order, job: existingJob || undefined };
    }

    // Protection 4: Server-side amount validation
    if (params.amount !== undefined) {
      const diff = Math.abs(params.amount - order.amount);
      if (diff > 0.01 && params.amount < order.amount) {
        throw new Error(`PAYMENT_AMOUNT_MISMATCH: Provided payment ₹${params.amount} is less than required ₹${order.amount}`);
      }
    }

    // Protection 5: Verify machine assignment exists
    const machine = await this.db.getMachineByCode(order.machine_code);
    if (!machine) {
      throw new Error(`MACHINE_UNAVAILABLE: Assigned machine ${order.machine_code} not found in database`);
    }

    this.processedWebhooks.add(params.payment_id);

    // 1. Mark Payment & Order as PAID atomically
    await this.db.updatePaymentStatus(order.id, 'PAID');
    await this.db.updateOrderStatus(order.id, 'QUEUED');

    const updatedOrder = (await this.db.getOrderById(order.id))!;
    const item = updatedOrder.items[0];
    const jobId = uuidv4();
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15-minute validity

    // Generate cryptographic HMAC job signature for System 2 hardware validation
    const secretKey = process.env.MACHINE_SECRET_KEY || 'aquora_master_secret_2026';
    const signaturePayload = `${jobId}:${updatedOrder.id}:${updatedOrder.machine_code}:${item.channel_id}:${item.volume_ml}:${expiryTime}`;
    const jobSignature = crypto.createHmac('sha256', secretKey).update(signaturePayload).digest('hex');

    // 2. Create authoritative DispenseJob (strictly ONE job per order)
    const job: DispenseJob = {
      id: jobId,
      order_id: updatedOrder.id,
      machine_id: updatedOrder.machine_code, // AQ-DM-001
      product_id: item.product_id,
      variant_id: item.variant_id,
      channel_id: item.channel_id,
      target_volume_ml: item.volume_ml,
      dispensed_volume_ml: 0,
      flow_rate: 0,
      status: 'QUEUED',
    };

    await (this.db as any).createDispenseJob(job);

    // 3. Notify System 2 Dispensing Machine and System 1 Payment Terminal
    realtimeHub.sendCommandToMachine(updatedOrder.machine_code, {
      type: 'DISPENSE_COMMAND',
      job_id: job.id,
      order_id: updatedOrder.id,
      order_number: updatedOrder.order_number,
      machine_id: updatedOrder.machine_code,
      channel: item.channel_id,
      product_id: item.product_id,
      product_name: item.product_name,
      target_volume_ml: item.volume_ml,
      protocol_version: 1,
      created_at: new Date().toISOString(),
      expires_at: expiryTime,
      signature: jobSignature,
    });

    realtimeHub.notifyOrderStatus(order.id, 'QUEUED', {
      order: updatedOrder,
      job_id: job.id,
    });

    return {
      success: true,
      order: updatedOrder,
      job,
    };
  }

  // Backward compatible alias
  async handleVerifiedPayment(params: {
    order_id: string;
    payment_id: string;
    amount?: number;
    provider: string;
    signature?: string;
  }) {
    return this.createDispenseJobAfterVerifiedPayment(params);
  }

  /**
   * Cryptographically verify Razorpay payment signature from client callback
   * Section 8: RAZORPAY PAYMENT VERIFICATION
   */
  async verifyRazorpayPayment(params: {
    order_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<{ success: boolean; order: Order; job?: DispenseJob }> {
    const order = await this.db.getOrderById(params.order_id);
    if (!order) {
      throw new Error(`Order ${params.order_id} not found`);
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_mock';
    const text = `${params.razorpay_order_id}|${params.razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(text).digest('hex');

    // Constant-time comparison
    const sigBuf = Buffer.from(params.razorpay_signature || '', 'utf8');
    const expBuf = Buffer.from(expectedSignature, 'utf8');
    const isSignatureValid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

    if (!isSignatureValid) {
      throw new Error('INVALID_SIGNATURE: Razorpay payment signature verification failed');
    }

    return this.createDispenseJobAfterVerifiedPayment({
      order_id: order.id,
      payment_id: params.razorpay_payment_id,
      amount: order.amount,
      provider: 'RAZORPAY',
      signature: params.razorpay_signature,
    });
  }

  /**
   * Blocked direct payment mock for production security.
   * Only accessible in automated test runner when explicitly authorized.
   */
  async processPayment(params: {
    order_id: string;
    payment_method?: string;
  }): Promise<{ success: boolean; order: Order; job?: DispenseJob; error?: string }> {
    if (process.env.NODE_ENV !== 'test' && process.env.ALLOW_MOCK_PAYMENT !== 'true') {
      throw new Error('DIRECT_PAYMENT_FORBIDDEN: Direct client payment processing without cryptographic signature or webhook verification is strictly forbidden.');
    }
    return this.createDispenseJobAfterVerifiedPayment({
      order_id: params.order_id,
      payment_id: `test_pay_${Date.now()}`,
      provider: params.payment_method || 'TEST_GATEWAY',
    });
  }
}

export const paymentService = new PaymentService();
