import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Environment variables provided automatically by Supabase Edge Runtime
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_test_1DP5mmOlF5G5ag";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Max-Age": "86400",
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function errorResponse(message: string, status = 400, details?: unknown): Response {
  return new Response(
    JSON.stringify({
      error: message,
      message,
      ...(details ? { details } : {}),
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Verify Razorpay payment signature (order_id + '|' + payment_id) HMAC-SHA256
 */
async function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!orderId || !paymentId || !signature || !secret) return false;
  try {
    const payload = `${orderId}|${paymentId}`;
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
      encoder.encode(payload)
    );
    const expectedHex = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return constantTimeCompare(expectedHex, signature);
  } catch (err) {
    console.error("[CRYPTO] Signature error:", err);
    return false;
  }
}

/**
 * Generate cryptographic SHA-256 signature for System 2 hardware job verification.
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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  // Normalize path removing function prefix if present (e.g., /functions/v1/api/...)
  let path = url.pathname;
  if (path.startsWith("/functions/v1/api")) {
    path = path.replace("/functions/v1/api", "");
  } else if (path.startsWith("/api")) {
    path = path.replace("/api", "");
  }
  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // -------------------------------------------------------------
    // 1. HEALTH ENDPOINT (/health, /api/health)
    // -------------------------------------------------------------
    if (path === "/health" || path === "") {
      const { count, error } = await supabase.from("products").select("*", { count: "exact", head: true });
      return jsonResponse({
        status: "ok",
        service: "AQUORA Production Edge API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        database: error ? "degraded" : "connected",
        products_count: count ?? 0,
        razorpay_configured: Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET),
      });
    }

    // -------------------------------------------------------------
    // 2. PRODUCTS ENDPOINT (GET /v1/products, GET /v1/products/:id)
    // -------------------------------------------------------------
    if (path === "/v1/products" || path === "/products") {
      if (req.method === "GET") {
        const { data: products, error: pErr } = await supabase
          .from("products")
          .select("*")
          .eq("is_archived", false)
          .order("display_order", { ascending: true, nullsFirst: false });

        if (pErr) {
          console.error("[API] Error fetching products:", pErr);
          return errorResponse("Failed to fetch products", 500, pErr.message);
        }

        const { data: variants, error: vErr } = await supabase
          .from("product_variants")
          .select("*")
          .eq("is_archived", false)
          .order("display_order", { ascending: true, nullsFirst: false });

        if (vErr) {
          console.error("[API] Error fetching variants:", vErr);
        }

        const enriched = (products || []).map((p) => {
          const pVariants = (variants || []).filter((v) => v.product_id === p.id);
          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            short_description: p.short_description || p.description,
            category_id: p.category_id,
            price: Number(p.price),
            discount_price: p.discount_price ? Number(p.discount_price) : undefined,
            currency: p.currency || "INR",
            image_url: p.image_url,
            volume_ml: p.volume_ml,
            ingredients: p.ingredients,
            nutrition: p.nutrition,
            is_available: p.is_available ?? true,
            is_featured: p.is_featured ?? false,
            channel_id: p.channel_id,
            variants: pVariants.map((v) => ({
              id: v.id,
              product_id: v.product_id,
              volume_ml: v.volume_ml,
              price: Number(v.price),
              channel_id: v.channel_id,
              is_available: v.is_available ?? true,
              available_quantity: v.available_quantity ?? 100,
            })),
          };
        });

        return jsonResponse(enriched);
      }
    }

    // Specific product: /v1/products/:id
    const productMatch = path.match(/^\/(?:v1\/)?products\/([a-zA-Z0-9_-]+)$/);
    if (productMatch && req.method === "GET") {
      const productId = productMatch[1];
      const { data: p, error: pErr } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();

      if (pErr || !p) {
        return errorResponse("Product not found", 404);
      }

      const { data: variants } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", p.id)
        .eq("is_archived", false);

      return jsonResponse({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        short_description: p.short_description || p.description,
        category_id: p.category_id,
        price: Number(p.price),
        discount_price: p.discount_price ? Number(p.discount_price) : undefined,
        currency: p.currency || "INR",
        image_url: p.image_url,
        volume_ml: p.volume_ml,
        ingredients: p.ingredients,
        nutrition: p.nutrition,
        is_available: p.is_available ?? true,
        is_featured: p.is_featured ?? false,
        channel_id: p.channel_id,
        variants: (variants || []).map((v) => ({
          id: v.id,
          product_id: v.product_id,
          volume_ml: v.volume_ml,
          price: Number(v.price),
          channel_id: v.channel_id,
          is_available: v.is_available ?? true,
          available_quantity: v.available_quantity ?? 100,
        })),
      });
    }

    // Categories
    if (path === "/v1/categories" || path === "/categories") {
      const { data: cats, error } = await supabase.from("categories").select("*");
      if (error) return errorResponse("Failed to fetch categories", 500, error.message);
      return jsonResponse(cats || []);
    }

    // -------------------------------------------------------------
    // 3. ORDERS ENDPOINT (POST /v1/orders, GET /v1/orders/:id)
    // -------------------------------------------------------------
    if ((path === "/v1/orders" || path === "/orders") && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const items = Array.isArray(body.items) ? body.items : [];

      if (items.length === 0) {
        return errorResponse("Order must contain at least one item", 400);
      }

      // Authoritative server-side price & item calculation
      let totalAmount = 0;
      const validatedItems: Array<{
        product_id: string;
        product_name: string;
        channel_id: number;
        quantity: number;
        volume_ml: number;
        unit_price: number;
        total_price: number;
      }> = [];

      for (const item of items) {
        const qty = Math.max(1, Number(item.quantity) || 1);
        let unitPrice = 0;
        let productName = "Sanitizer Product";
        let channelId = 1;
        let volumeMl = Number(item.volume_ml) || 100;
        let resolvedProductId = item.product_id;

        // Try lookup variant first
        if (item.variant_id) {
          const { data: variant } = await supabase
            .from("product_variants")
            .select("*, products(name, channel_id)")
            .eq("id", item.variant_id)
            .maybeSingle();

          if (variant) {
            unitPrice = Number(variant.price);
            resolvedProductId = variant.product_id;
            channelId = variant.channel_id || (variant.products as any)?.channel_id || 1;
            volumeMl = variant.volume_ml || volumeMl;
            productName = (variant.products as any)?.name || productName;
          }
        }

        // If not found via variant, query product directly
        if (unitPrice <= 0 && resolvedProductId) {
          const { data: prod } = await supabase
            .from("products")
            .select("id, name, price, channel_id, volume_ml")
            .eq("id", resolvedProductId)
            .maybeSingle();

          if (prod) {
            unitPrice = Number(prod.price);
            productName = prod.name;
            channelId = prod.channel_id || 1;
            volumeMl = prod.volume_ml || volumeMl;
          }
        }

        if (unitPrice <= 0) {
          return errorResponse(`Invalid product or variant price for item: ${item.product_id || item.variant_id}`, 400);
        }

        const itemTotal = unitPrice * qty;
        totalAmount += itemTotal;

        validatedItems.push({
          product_id: resolvedProductId,
          product_name: productName,
          channel_id: channelId,
          quantity: qty,
          volume_ml: volumeMl,
          unit_price: unitPrice,
          total_price: itemTotal,
        });
      }

      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderNumber = `AQ-ORD-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name: body.customer_name || "Online Customer",
          customer_phone: body.customer_phone || "",
          terminal_code: body.terminal_code || "ONLINE_WEB",
          machine_code: body.machine_code || "AQ-DM-001",
          amount: totalAmount,
          currency: "INR",
          payment_status: "PENDING",
          order_status: "CREATED",
          source: body.source || "PUBLIC_WEB",
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (orderErr || !order) {
        console.error("[API] Order insert error:", orderErr);
        return errorResponse("Failed to create order in database", 500, orderErr?.message);
      }

      const itemsToInsert = validatedItems.map((vi) => ({
        order_id: order.id,
        product_id: vi.product_id,
        product_name: vi.product_name,
        channel_id: vi.channel_id,
        quantity: vi.quantity,
        volume_ml: vi.volume_ml,
        unit_price: vi.unit_price,
        total_price: vi.total_price,
      }));

      const { data: insertedItems, error: itemsErr } = await supabase
        .from("order_items")
        .insert(itemsToInsert)
        .select();

      if (itemsErr) {
        console.error("[API] Order items insert error:", itemsErr);
      }

      return jsonResponse(
        {
          ...order,
          items: insertedItems || validatedItems,
        },
        201
      );
    }

    // Lookup order: /v1/orders/:id
    const orderMatch = path.match(/^\/(?:v1\/)?orders\/([a-zA-Z0-9_-]+)$/);
    if (orderMatch && req.method === "GET") {
      const orderIdOrNum = orderMatch[1];
      let query = supabase.from("orders").select("*, order_items(*), payments(*), dispense_jobs(*)");

      if (orderIdOrNum.includes("-") && orderIdOrNum.length > 25) {
        query = query.eq("id", orderIdOrNum);
      } else {
        query = query.eq("order_number", orderIdOrNum);
      }

      const { data: order, error } = await query.maybeSingle();
      if (error || !order) {
        return errorResponse("Order not found", 404);
      }

      return jsonResponse(order);
    }

    // -------------------------------------------------------------
    // 4. PAYMENTS CREATE (POST /v1/payments/create)
    // -------------------------------------------------------------
    if ((path === "/v1/payments/create" || path === "/payments/create") && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const orderId = body.order_id;

      if (!orderId) {
        return errorResponse("order_id is required", 400);
      }

      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select("id, order_number, amount, currency, payment_status, source")
        .eq("id", orderId)
        .maybeSingle();

      if (orderErr || !order) {
        return errorResponse("Order not found", 404);
      }

      if (order.payment_status === "PAID") {
        return errorResponse("Order is already paid", 400);
      }

      const amountPaise = Math.round(Number(order.amount) * 100);

      // Verify Razorpay Secret is available on backend
      if (!RAZORPAY_KEY_SECRET) {
        console.error("[PAYMENTS] RAZORPAY_KEY_SECRET is not configured in environment");
        return errorResponse(
          "Payment gateway credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Supabase Secrets.",
          503
        );
      }

      // Call authentic Razorpay Orders API
      const authHeader = "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          receipt: order.order_number,
          notes: {
            order_id: order.id,
            order_number: order.order_number,
            source: order.source || "PUBLIC_WEB",
          },
        }),
      });

      const rzpData = await rzpRes.json().catch(() => ({}));

      if (!rzpRes.ok) {
        console.error("[PAYMENTS] Razorpay Orders API error:", rzpData);
        return errorResponse(
          rzpData.error?.description || "Payment service is temporarily unavailable. Please try again.",
          502,
          rzpData
        );
      }

      const providerOrderId = rzpData.id;

      // Upsert payment row in Supabase database
      const { data: existingPay } = await supabase
        .from("payments")
        .select("id")
        .eq("order_id", order.id)
        .maybeSingle();

      if (existingPay) {
        await supabase
          .from("payments")
          .update({
            provider: "RAZORPAY",
            provider_order_id: providerOrderId,
            amount: Number(order.amount),
            currency: "INR",
            status: "PENDING",
            gateway_response: rzpData,
          })
          .eq("id", existingPay.id);
      } else {
        await supabase.from("payments").insert({
          order_id: order.id,
          payment_method: "UPI_RAZORPAY",
          provider: "RAZORPAY",
          provider_order_id: providerOrderId,
          amount: Number(order.amount),
          currency: "INR",
          status: "PENDING",
          gateway_response: rzpData,
        });
      }

      return jsonResponse({
        success: true,
        order_id: order.id,
        order_number: order.order_number,
        amount: Number(order.amount),
        amount_paise: amountPaise,
        currency: "INR",
        provider_order_id: providerOrderId,
        razorpay_key_id: RAZORPAY_KEY_ID,
      });
    }

    // -------------------------------------------------------------
    // 5. PAYMENTS VERIFY (POST /v1/payments/verify)
    // -------------------------------------------------------------
    if ((path === "/v1/payments/verify" || path === "/payments/verify") && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

      if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return errorResponse("Missing required payment verification parameters", 400);
      }

      if (!RAZORPAY_KEY_SECRET) {
        return errorResponse("Payment verification unavailable: RAZORPAY_KEY_SECRET missing", 503);
      }

      const isValid = await verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        RAZORPAY_KEY_SECRET
      );

      if (!isValid) {
        console.warn("[PAYMENTS] Invalid signature verification attempt for order:", order_id);
        return errorResponse("Invalid payment signature. Verification failed.", 400);
      }

      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", order_id)
        .maybeSingle();

      if (orderErr || !order) {
        return errorResponse("Order not found for verification", 404);
      }

      const nowIso = new Date().toISOString();

      // Update payment record to PAID
      await supabase
        .from("payments")
        .update({
          status: "PAID",
          provider_payment_id: razorpay_payment_id,
          provider_order_id: razorpay_order_id,
        })
        .eq("order_id", order.id);

      // Update order status to PAID
      await supabase
        .from("orders")
        .update({
          payment_status: "PAID",
          order_status: "PAID",
          updated_at: nowIso,
        })
        .eq("id", order.id);

      // Authoritative dispense job creation (Strictly 1 dispense job per order)
      const { data: existingJob } = await supabase
        .from("dispense_jobs")
        .select("id, status")
        .eq("order_id", order.id)
        .maybeSingle();

      let createdJobId = existingJob?.id;

      if (!existingJob) {
        const item = order.order_items?.[0];
        const targetChannel = item?.channel_id || 1;
        const targetVolume = item?.volume_ml || 100;
        const productId = item?.product_id;
        const machineCode = order.machine_code || "AQ-DM-001";
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        const jobSignature = await generateJobSignature(
          order.id,
          machineCode,
          targetChannel,
          targetVolume
        );

        const { data: newJob, error: jobErr } = await supabase
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

        if (jobErr) {
          console.error("[PAYMENTS] Dispense job creation error:", jobErr);
        } else {
          createdJobId = newJob.id;
          await supabase
            .from("orders")
            .update({ order_status: "QUEUED", updated_at: nowIso })
            .eq("id", order.id);
        }
      }

      return jsonResponse({
        success: true,
        order_id: order.id,
        payment_status: "PAID",
        order_status: "QUEUED",
        job_id: createdJobId,
      });
    }

    // -------------------------------------------------------------
    // 6. ADMIN STATS & ADMIN ROUTES
    // -------------------------------------------------------------
    if (path === "/v1/admin/stats" || path === "/admin/stats") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();

      const { data: ordersToday } = await supabase
        .from("orders")
        .select("amount, payment_status, order_status")
        .gte("created_at", todayIso);

      const revenueToday = (ordersToday || [])
        .filter((o) => o.payment_status === "PAID")
        .reduce((sum, o) => sum + Number(o.amount || 0), 0);

      const dispensedToday = (ordersToday || []).filter((o) => o.order_status === "DISPENSED").length;
      const failedToday = (ordersToday || []).filter((o) => o.order_status === "FAILED").length;

      const { count: machineCount } = await supabase
        .from("dispensing_machines")
        .select("*", { count: "exact", head: true });

      return jsonResponse({
        revenue_today: revenueToday,
        orders_today: ordersToday?.length || 0,
        dispensed_today: dispensedToday,
        failed_today: failedToday,
        active_machines: machineCount || 1,
        offline_machines: 0,
        low_stock_count: 0,
      });
    }

    if (path === "/v1/admin/orders" || path === "/admin/orders") {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*, order_items(*), payments(*), dispense_jobs(*)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) return errorResponse("Failed to fetch admin orders", 500, error.message);
      return jsonResponse(orders || []);
    }

    if (path === "/v1/admin/machines" || path === "/admin/machines") {
      const { data: machines, error } = await supabase.from("dispensing_machines").select("*");
      if (error) return errorResponse("Failed to fetch machines", 500, error.message);
      return jsonResponse(machines || []);
    }

    // Fallback 404 for unknown route
    return errorResponse(`Route not found: ${req.method} ${path}`, 404);
  } catch (err: any) {
    console.error("[API] Uncaught error:", err);
    return errorResponse(err.message || "Internal server error", 500);
  }
});
