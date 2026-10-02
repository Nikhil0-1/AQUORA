import * as crypto from 'crypto';
import { Order, DispenseJob } from '@aquora/shared-types';
import { getDatabase } from '../db';
import { realtimeHub } from '../websocket';
import { v4 as uuidv4 } from 'uuid';

export class PaymentService {
  private db = getDatabase();
  private processedWebhooks = new Set<string>();

  /**
   * Idempotent payment verification and dispensing job authorization.
   * Section 22: If webhook arrives 5 times, exactly ONE payment, ONE order, ONE dispense job.
   */
  async handleVerifiedPayment(params: {
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

    // Idempotency check 1: by payment_id
    if (this.processedWebhooks.has(params.payment_id)) {
      console.log(`[IDEMPOTENCY] Webhook already processed for payment_id: ${params.payment_id}`);
      const existingJob = await this.db.getDispenseJobByOrderId(order.id);
      return { success: true, order, job: existingJob || undefined };
    }

    // Idempotency check 2: if order is already PAID or beyond
    if (order.payment_status === 'PAID') {
      console.log(`[IDEMPOTENCY] Order ${order.id} is already marked as PAID`);
      const existingJob = await this.db.getDispenseJobByOrderId(order.id);
      return { success: true, order, job: existingJob || undefined };
    }

    // Verify amount if provided
    if (params.amount !== undefined && params.amount < order.amount) {
      throw new Error(`Payment amount ₹${params.amount} is less than required ₹${order.amount}`);
    }

    this.processedWebhooks.add(params.payment_id);

    // 1. Mark Payment & Order as PAID
    await this.db.updatePaymentStatus(order.id, 'PAID');
    await this.db.updateOrderStatus(order.id, 'QUEUED');

    const updatedOrder = (await this.db.getOrderById(order.id))!;
    const item = updatedOrder.items[0];
    const jobId = uuidv4();
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5-minute validity

    // Generate cryptographic HMAC job signature for System 2 hardware validation
    const secretKey = process.env.MACHINE_SECRET_KEY || 'aquora_master_secret_2026';
    const signaturePayload = `${jobId}:${updatedOrder.id}:${updatedOrder.machine_code}:${item.channel_id}:${item.volume_ml}:${expiryTime}`;
    const jobSignature = crypto.createHmac('sha256', secretKey).update(signaturePayload).digest('hex');

    // 2. Create authoritative DispenseJob
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

    // 3. Notify Dispensing Machine (System 2) and Payment Terminal (System 1)
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

  /**
   * Process mock/dev payment
   */
  async processPayment(params: {
    order_id: string;
    payment_method?: string;
  }): Promise<{ success: boolean; order: Order; job?: DispenseJob; error?: string }> {
    return this.handleVerifiedPayment({
      order_id: params.order_id,
      payment_id: `mock_pay_${Date.now()}`,
      provider: params.payment_method || 'UPI_MOCK',
    });
  }
}

export const paymentService = new PaymentService();
