import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') ?? '';

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing signature' }), { status: 401 });
    }

    // 1. Verify HMAC-SHA256 signature
    const expectedSignature = createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 403 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload.payment.entity;
      const providerPaymentId = paymentEntity.id;
      const orderId = paymentEntity.notes?.order_id;

      if (!orderId) {
        return new Response(JSON.stringify({ error: 'No order_id in notes' }), { status: 400 });
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // 2. Idempotency check
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id, payment_status')
        .eq('provider_payment_id', providerPaymentId)
        .single();

      if (existingPayment && existingPayment.payment_status === 'PAID') {
        return new Response(JSON.stringify({ status: 'ignored_idempotent' }), { status: 200 });
      }

      // 3. Update payment & order
      await supabase
        .from('payments')
        .update({ payment_status: 'PAID', paid_at: new Date().toISOString() })
        .eq('provider_payment_id', providerPaymentId);

      await supabase
        .from('orders')
        .update({ order_status: 'PAID', updated_at: new Date().toISOString() })
        .eq('id', orderId);

      // 4. Create single signed dispensing job
      const { data: order } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();

      if (order && order.order_items && order.order_items.length > 0) {
        const item = order.order_items[0];
        const jobId = `AQ-JOB-${Date.now()}`;
        
        await supabase.from('dispense_jobs').insert({
          id: jobId,
          order_id: orderId,
          machine_id: order.machine_id || 'AQ-DM-001',
          channel: item.channel_id || 1,
          product_id: item.product_id,
          target_volume_ml: item.volume_ml,
          status: 'QUEUED',
          protocol_version: 1,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        });
      }

      return new Response(JSON.stringify({ success: true, order_id: orderId }), { status: 200 });
    }

    return new Response(JSON.stringify({ status: 'ignored_event' }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
