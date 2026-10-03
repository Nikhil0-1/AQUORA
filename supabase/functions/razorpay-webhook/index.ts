import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function cleanCredential(val: string | undefined | null): string {
  if (!val) return "";
  let s = val.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/**
 * Verify Razorpay Webhook HMAC-SHA256 signature using standard Web Crypto API.
 * Uses constant-time comparison to prevent timing attacks.
 */
async function verifyRazorpaySignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!signature || !secret || !rawBody) return false;
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(rawBody)
    );
    const expectedHex = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedHex.length !== signature.length) return false;

    // Constant-time comparison
    let mismatch = 0;
    for (let i = 0; i < expectedHex.length; i++) {
      mismatch |= expectedHex.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return mismatch === 0;
  } catch (err) {
    console.error("[WEBHOOK] Signature calculation error:", err);
    return false;
  }
}

/**
 * Generate cryptographic signature for System 2 hardware job verification.
 */
async function generateJobSignature(
  orderId: string,
  machineCode: string,
  channel: number,
  volumeMl: number
): Promise<string> {
  const payload = `${orderId}:${machineCode}:${channel}:${volumeMl}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(payload));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req: Request) => {
  // 1. Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Only POST is accepted." }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. Verify server-side secret configuration
  const webhookSecret = cleanCredential(
    Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || Deno.env.get("RZP_WEBHOOK_SECRET")
  );

  if (!webhookSecret) {
    console.error("[CRITICAL] RAZORPAY_WEBHOOK_SECRET environment variable is missing on server");
    return new Response(
      JSON.stringify({
        error: "Server webhook configuration error",
        message: "RAZORPAY_WEBHOOK_SECRET must be configured in Supabase Edge Function Secrets",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // 3. Receive raw HTTP body for cryptographic verification
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      console.warn("[WEBHOOK] Rejected: Missing x-razorpay-signature header");
      return new Response(
        JSON.stringify({ error: "Missing x-razorpay-signature header" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Cryptographic HMAC-SHA256 signature verification
    const isValidSignature = await verifyRazorpaySignature(
      rawBody,
      signature,
      webhookSecret
    );

    if (!isValidSignature) {
      console.warn("[WEBHOOK] Rejected: Invalid signature");
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Parse JSON after successful signature verification
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({ error: "Malformed JSON payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const event = payload.event;
    // Extract unique event ID from payload or header
    const eventId =
      payload.id ||
      payload.event_id ||
      req.headers.get("x-razorpay-event-id") ||
      `${event}_${payload.payload?.payment?.entity?.id || Date.now()}`;

    // Initialize Supabase client with Service Role privileges
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 6. Idempotency Check: Verify if this event was already processed
    const { data: existingEvent } = await supabase
      .from("webhook_events")
      .select("id, status")
      .eq("razorpay_event_id", eventId)
      .maybeSingle();

    if (existingEvent && existingEvent.status === "PROCESSED") {
      console.log(`[WEBHOOK] Idempotent duplicate event detected: ${eventId}. Ignoring duplicate.`);
      return new Response(
        JSON.stringify({
          status: "ignored_duplicate_event",
          event_id: eventId,
          message: "Event has already been processed",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log event as RECEIVED in webhook_events
    if (!existingEvent) {
      await supabase.from("webhook_events").insert({
        razorpay_event_id: eventId,
        event_type: event,
        provider: "RAZORPAY",
        status: "RECEIVED",
        received_at: new Date().toISOString(),
      });
    }

    // 7. Handle Payment Success Events: payment.captured or order.paid
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;

      if (!paymentEntity && !orderEntity) {
        await supabase
          .from("webhook_events")
          .update({ status: "FAILED", error_message: "Missing payment and order entities in payload" })
          .eq("razorpay_event_id", eventId);
        return new Response(
          JSON.stringify({ error: "Missing payment and order entities in payload" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const providerPaymentId = paymentEntity?.id || null;
      const providerOrderId = paymentEntity?.order_id || orderEntity?.id || null;
      const amountPaise = paymentEntity?.amount || orderEntity?.amount || 0;
      const amountInr = amountPaise / 100;

      // Match order by notes.order_id or order_number or payments lookup
      let orderId = paymentEntity?.notes?.order_id || orderEntity?.notes?.order_id;
      let orderNumber = paymentEntity?.notes?.order_number || orderEntity?.notes?.order_number;

      let order: any = null;

      if (orderId) {
        const { data } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("id", orderId)
          .maybeSingle();
        order = data;
      }

      if (!order && orderNumber) {
        const { data } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("order_number", orderNumber)
          .maybeSingle();
        order = data;
      }

      if (!order && providerOrderId) {
        const { data: payRecord } = await supabase
          .from("payments")
          .select("order_id")
          .eq("provider_order_id", providerOrderId)
          .maybeSingle();
        if (payRecord?.order_id) {
          const { data } = await supabase
            .from("orders")
            .select("*, order_items(*)")
            .eq("id", payRecord.order_id)
            .maybeSingle();
          order = data;
        }
      }

      if (!order) {
        console.error(`[WEBHOOK] Order not found for payment: ${providerPaymentId || providerOrderId}`);
        await supabase
          .from("webhook_events")
          .update({
            status: "FAILED",
            error_message: `Order not found for payment ${providerPaymentId || providerOrderId}`,
          })
          .eq("razorpay_event_id", eventId);

        return new Response(
          JSON.stringify({ error: "Order not found matching payment notes" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      // 8. Server-side payment verification (Amount check)
      if (Math.abs(Number(order.amount) - amountInr) > 0.01) {
        console.error(
          `[WEBHOOK] Amount mismatch! Order amount: ${order.amount}, Paid: ${amountInr}`
        );
        await supabase
          .from("webhook_events")
          .update({
            status: "FAILED",
            error_message: `Amount mismatch: expected ${order.amount}, received ${amountInr}`,
          })
          .eq("razorpay_event_id", eventId);

        return new Response(
          JSON.stringify({
            error: "Payment amount mismatch",
            expected: order.amount,
            received: amountInr,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const nowIso = new Date().toISOString();

      // 9. Update/Insert Payment Record (Status: PAID)
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("order_id", order.id)
        .maybeSingle();

      if (existingPayment) {
        await supabase
          .from("payments")
          .update({
            status: "PAID",
            provider: "RAZORPAY",
            provider_payment_id: providerPaymentId || undefined,
            provider_order_id: providerOrderId || undefined,
            amount: amountInr,
            gateway_response: paymentEntity || orderEntity,
          })
          .eq("id", existingPayment.id);
      } else {
        await supabase.from("payments").insert({
          order_id: order.id,
          payment_method: "UPI_RAZORPAY",
          provider: "RAZORPAY",
          provider_payment_id: providerPaymentId,
          provider_order_id: providerOrderId,
          amount: amountInr,
          currency: "INR",
          status: "PAID",
          gateway_response: paymentEntity || orderEntity,
        });
      }

      // 10. Update Order Status (payment_status: PAID, order_status: PAID / QUEUED)
      // Note: Payment success != Dispense success. We do NOT set DISPENSED here.
      await supabase
        .from("orders")
        .update({
          payment_status: "PAID",
          order_status: "PAID",
          updated_at: nowIso,
        })
        .eq("id", order.id);

      // 11. Create Exactly ONE Dispense Job for System 2 ESP32
      // Strong cross-event idempotency: check if dispense job ALREADY exists for this order
      const { data: existingJob } = await supabase
        .from("dispense_jobs")
        .select("id, status")
        .eq("order_id", order.id)
        .maybeSingle();

      let createdJobId = existingJob?.id;

      if (!existingJob) {
        const item =
          order.order_items && order.order_items.length > 0
            ? order.order_items[0]
            : null;

        const targetChannel = item?.channel_id || 1;
        const targetVolume = item?.volume_ml || 100;
        let productId = item?.product_id;

        if (!productId) {
          // Look up product assigned to this channel from machine_channels or products
          const { data: channelData } = await supabase
            .from("machine_channels")
            .select("product_id")
            .eq("channel_number", targetChannel)
            .maybeSingle();
          productId = channelData?.product_id;
        }

        if (!productId) {
          const { data: defaultProduct } = await supabase
            .from("products")
            .select("id")
            .eq("channel_id", targetChannel)
            .maybeSingle();
          productId = defaultProduct?.id;
        }

        const machineCode = order.machine_code || "AQ-DM-001";
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        // Cryptographic signature for System 2 machine validation
        const jobSignature = await generateJobSignature(
          order.id,
          machineCode,
          targetChannel,
          targetVolume
        );

        const { data: newJob, error: jobError } = await supabase
          .from("dispense_jobs")
          .insert({
            order_id: order.id,
            machine_code: machineCode,
            product_id: productId,
            channel_id: targetChannel,
            target_volume_ml: targetVolume,
            dispensed_volume_ml: 0,
            flow_rate: 0,
            status: "QUEUED",
            signature: jobSignature,
            expires_at: expiresAt,
            created_at: nowIso,
          })
          .select("id")
          .single();

        if (jobError) {
          console.error("[WEBHOOK] Error creating dispense job:", jobError);
        } else {
          createdJobId = newJob.id;
          // Advance order_status to QUEUED
          await supabase
            .from("orders")
            .update({ order_status: "QUEUED", updated_at: nowIso })
            .eq("id", order.id);

          console.log(`[WEBHOOK] Dispense Job created: ${createdJobId} for Order: ${order.id}`);
        }
      } else {
        console.log(`[WEBHOOK] Dispense job already exists for order ${order.id}: ${existingJob.id} (Reconciled)`);
      }

      // Mark webhook event as PROCESSED
      await supabase
        .from("webhook_events")
        .update({
          status: "PROCESSED",
          processed_at: new Date().toISOString(),
        })
        .eq("razorpay_event_id", eventId);

      return new Response(
        JSON.stringify({
          success: true,
          order_id: order.id,
          payment_status: "PAID",
          dispense_job_id: createdJobId,
          job_status: existingJob ? existingJob.status : "QUEUED",
          note: existingJob ? "Dispense job already existed; reconciled successfully" : "New dispense job queued",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 12. Handle Payment Failure Events: payment.failed
    if (event === "payment.failed") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.notes?.order_id;

      if (orderId) {
        await supabase
          .from("orders")
          .update({
            payment_status: "FAILED",
            order_status: "FAILED",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        await supabase
          .from("payments")
          .update({
            status: "FAILED",
            gateway_response: paymentEntity,
          })
          .eq("order_id", orderId);
      }

      await supabase
        .from("webhook_events")
        .update({
          status: "PROCESSED",
          processed_at: new Date().toISOString(),
        })
        .eq("razorpay_event_id", eventId);

      console.warn(`[WEBHOOK] Recorded payment.failed for order: ${orderId}`);
      return new Response(
        JSON.stringify({
          success: true,
          status: "payment_failed_recorded",
          order_id: orderId,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 13. Other events: Log and acknowledge safely
    await supabase
      .from("webhook_events")
      .update({
        status: "IGNORED",
        processed_at: new Date().toISOString(),
      })
      .eq("razorpay_event_id", eventId);

    return new Response(
      JSON.stringify({ status: "ignored_unhandled_event", event: event }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[WEBHOOK ERROR] Internal unhandled exception:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
