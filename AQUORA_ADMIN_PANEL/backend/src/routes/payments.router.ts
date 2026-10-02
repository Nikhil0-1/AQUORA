import { Router, Request, Response } from 'express';
import * as crypto from 'crypto';
import { ProcessPaymentSchema } from '@aquora/validation';
import { paymentService } from '../services/payment.service';
import { getDatabase } from '../db';

export const paymentsRouter = Router();

// POST /api/v1/payments/create
paymentsRouter.post('/create', async (req: Request, res: Response) => {
  try {
    const { order_id, provider = 'RAZORPAY' } = req.body;
    if (!order_id) {
      return res.status(400).json({ message: 'order_id is required' });
    }

    const db = getDatabase();
    const order = await db.getOrderById(order_id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const upiQrString = `upi://pay?pa=aquora@icici&pn=AQUORA+VENDING&am=${order.amount.toFixed(2)}&cu=INR&tr=${order.order_number}&tn=Aquora+Sanitizer+Dispense`;
    const providerOrderId = `order_${order.order_number}_${Date.now()}`;

    return res.status(201).json({
      success: true,
      order_id: order.id,
      order_number: order.order_number,
      amount: order.amount,
      currency: order.currency,
      provider,
      provider_order_id: providerOrderId,
      qr_code_data: upiQrString,
      expires_at: order.expires_at,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// POST /api/v1/payments/process (Mock/Dev testing)
paymentsRouter.post('/process', async (req: Request, res: Response) => {
  try {
    const validated = ProcessPaymentSchema.parse(req.body);
    const orderId = validated.order_id;
    if (!orderId) {
      return res.status(400).json({ message: 'order_id must be provided' });
    }
    const result = await paymentService.processPayment({
      order_id: orderId,
      payment_method: validated.provider || 'UPI_MOCK',
    });

    if (!result.success) {
      return res.status(402).json({
        message: result.error || 'Payment failed',
        order: result.order,
      });
    }

    return res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    return res.status(400).json({ message: error.message });
  }
});

// POST /api/v1/payment/webhook (Section 22: Idempotent Payment Webhook)
paymentsRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = (req.headers['x-razorpay-signature'] as string) || req.body.signature;
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'aquora_webhook_secret_production';

    if (signature && process.env.NODE_ENV === 'production') {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        return res.status(400).json({ error: 'INVALID_SIGNATURE', message: 'Webhook signature verification failed' });
      }
    }

    const { payment_id, order_id, amount } = req.body;
    if (!order_id) {
      return res.status(400).json({ error: 'MISSING_ORDER_ID', message: 'Order ID is required' });
    }

    const result = await paymentService.handleVerifiedPayment({
      order_id,
      payment_id: payment_id || `pay_${Date.now()}`,
      amount: Number(amount) || undefined,
      provider: 'RAZORPAY',
      signature: signature || 'dev_mock_signature',
    });

    return res.json({
      success: true,
      order_id: result.order.id,
      payment_status: result.order.payment_status,
      order_status: result.order.order_status,
      job_id: result.job?.id,
    });
  } catch (error: any) {
    console.error('[WEBHOOK ERROR]', error);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
  }
});
