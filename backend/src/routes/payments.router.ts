import { Router, Request, Response } from 'express';
import * as crypto from 'crypto';
import { ProcessPaymentSchema } from '@aquora/validation';
import { paymentService } from '../services/payment.service';
import { getDatabase } from '../db';

export const paymentsRouter = Router();

/**
 * POST /api/v1/payments/create
 * Creates / initiates payment for an order using server-authoritative pricing.
 */
paymentsRouter.post('/create', async (req: Request, res: Response) => {
  try {
    const { order_id, provider = 'RAZORPAY' } = req.body;
    if (!order_id) {
      return res.status(400).json({ error: 'MISSING_ORDER_ID', message: 'order_id is required' });
    }

    const db = getDatabase();
    const order = await db.getOrderById(order_id);
    if (!order) {
      return res.status(404).json({ error: 'ORDER_NOT_FOUND', message: 'Order not found' });
    }

    if (order.payment_status === 'PAID') {
      return res.status(400).json({ error: 'ALREADY_PAID', message: 'Order has already been paid' });
    }

    if (order.order_status === 'DISPENSED') {
      return res.status(400).json({ error: 'ALREADY_DISPENSED', message: 'Order has already been dispensed' });
    }

    const cleanOrderNumber = order.order_number.replace(/[^a-zA-Z0-9]/g, '');
    let providerOrderId = `order_${cleanOrderNumber}_${Date.now()}`;
    const amountPaise = Math.round(order.amount * 100);
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    // Call official Razorpay Orders API if credentials exist
    if (razorpayKeyId && razorpayKeySecret && !razorpayKeySecret.includes('mock')) {
      try {
        const basicAuth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
        const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountPaise,
            currency: order.currency || 'INR',
            receipt: order.order_number.slice(0, 40),
            notes: {
              aquora_order_id: order.id,
              machine_code: order.machine_code,
            },
          }),
        });

        if (rzpRes.ok) {
          const rzpJson = (await rzpRes.json()) as any;
          if (rzpJson.id) {
            providerOrderId = rzpJson.id;
          }
        } else {
          const rzpErr = await rzpRes.json().catch(() => ({}));
          console.warn('[RAZORPAY ORDERS API RESPONSE]', rzpErr);
        }
      } catch (rzpApiErr) {
        console.warn('[RAZORPAY API CALL EXCEPTION]', rzpApiErr);
      }
    }

    const upiQrString = `upi://pay?pa=aquora@icici&pn=AQUORA+VENDING&am=${order.amount.toFixed(2)}&cu=INR&tr=${order.order_number}&tn=Aquora+Sanitizer+Dispense`;

    return res.status(201).json({
      success: true,
      order_id: order.id,
      order_number: order.order_number,
      amount: order.amount,
      amount_paise: amountPaise,
      currency: order.currency,
      provider,
      provider_order_id: providerOrderId,
      razorpay_key_id: razorpayKeyId,
      qr_code_data: upiQrString,
      expires_at: order.expires_at,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'PAYMENT_INITIATION_FAILED', message: error.message });
  }
});

/**
 * POST /api/v1/payments/verify
 * Cryptographic server-side verification of Razorpay payment callback.
 * Required: razorpay_order_id, razorpay_payment_id, razorpay_signature
 */
paymentsRouter.post('/verify', async (req: Request, res: Response) => {
  try {
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        error: 'MISSING_VERIFICATION_FIELDS',
        message: 'order_id, razorpay_order_id, razorpay_payment_id, and razorpay_signature are required',
      });
    }

    const result = await paymentService.verifyRazorpayPayment({
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    return res.json({
      success: true,
      order_id: result.order.id,
      payment_status: result.order.payment_status,
      order_status: result.order.order_status,
      job_id: result.job?.id,
    });
  } catch (error: any) {
    console.error('[PAYMENT VERIFY ERROR]', error);
    const status = error.message.includes('INVALID_SIGNATURE') ? 401 : 400;
    return res.status(status).json({
      error: 'PAYMENT_VERIFICATION_FAILED',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/payments/process (Mock/Dev testing — Strictly protected)
 * Direct payment simulation without gateway signature is strictly blocked in production.
 */
paymentsRouter.post('/process', async (req: Request, res: Response) => {
  try {
    if (process.env.NODE_ENV !== 'test' && process.env.ALLOW_MOCK_PAYMENT !== 'true') {
      return res.status(403).json({
        error: 'DIRECT_PAYMENT_FORBIDDEN',
        message: 'Direct payment mock is strictly disabled. Payment must be verified via Razorpay signature or webhook.',
      });
    }

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

/**
 * POST /api/v1/payments/webhook
 * Section 22: Idempotent Payment Webhook with HMAC signature verification.
 */
paymentsRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = (req.headers['x-razorpay-signature'] as string) || req.body.signature;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.PAYMENT_WEBHOOK_SECRET || 'aquora_webhook_secret_production';

    // Verify signature in all non-test environments or when signature is supplied
    if (signature || process.env.NODE_ENV !== 'test') {
      if (!signature) {
        return res.status(400).json({ error: 'MISSING_SIGNATURE', message: 'x-razorpay-signature header is required' });
      }

      const bodyContent = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(bodyContent)
        .digest('hex');

      const sigBuf = Buffer.from(signature, 'utf8');
      const expBuf = Buffer.from(expectedSignature, 'utf8');
      const isSignatureValid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

      if (!isSignatureValid) {
        return res.status(401).json({ error: 'INVALID_SIGNATURE', message: 'Webhook signature verification failed' });
      }
    }

    const { payment_id, order_id, amount } = req.body;
    if (!order_id) {
      return res.status(400).json({ error: 'MISSING_ORDER_ID', message: 'Order ID is required' });
    }

    const result = await paymentService.createDispenseJobAfterVerifiedPayment({
      order_id,
      payment_id: payment_id || `pay_${Date.now()}`,
      amount: amount !== undefined ? Number(amount) : undefined,
      provider: 'RAZORPAY',
      signature: signature || 'verified_webhook_signature',
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
    const status = error.message.includes('MISMATCH') ? 400 : 500;
    return res.status(status).json({ error: 'WEBHOOK_FAILED', message: error.message });
  }
});
