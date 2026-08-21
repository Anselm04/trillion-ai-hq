import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { ensureProfile, ensureSeed, writeAudit } from "./bootstrap";
import { stripeConfig, stripeGet, stripeRequest } from "./payments";
import { COMPANY } from "./company";
import type { Order } from "./types";

type Sql = Awaited<ReturnType<typeof getSql>>;

function appOrigin() {
  const env = process.env.BETTER_AUTH_URL?.replace(/\/+$/, "");
  if (env) return env;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, "")}`;
  }
  return COMPANY.siteUrl;
}

async function activateSubscription(sql: Sql, userId: string, productId: number) {
  const rows = await sql<{ billing_interval: string | null }>`
    select billing_interval from products where id = ${productId} limit 1
  `;
  const interval = rows[0]?.billing_interval;
  const days = interval === "year" ? 365 : interval === "week" ? 7 : interval === "quarter" ? 90 : 30;
  await sql`
    insert into subscriptions (user_id, product_id, status, current_period_end)
    values (${userId}, ${productId}, 'active', now() + (${days} * interval '1 day'))
  `;
}

export async function markOrderPaid(sql: Sql, orderId: number, sessionId?: string | null) {
  const rows = await sql<{
    id: number;
    user_id: string;
    product_id: number;
    billing: string;
    status: string;
  }>`
    select id, user_id, product_id, billing, status from orders where id = ${orderId} limit 1
  `;
  const order = rows[0];
  if (!order) return { ok: false as const };
  if (order.status === "paid") return { ok: true as const };
  if (sessionId) {
    await sql`
      update orders set status = 'paid', stripe_session_id = ${sessionId} where id = ${orderId}
    `;
  } else {
    await sql`update orders set status = 'paid' where id = ${orderId}`;
  }
  if (order.billing === "subscription") {
    await activateSubscription(sql, order.user_id, order.product_id);
  }
  await sql`
    insert into usage_events (user_id, event_type, product_id)
    values (${order.user_id}, 'purchase', ${order.product_id})
  `;
  await writeAudit(sql, {
    actorId: order.user_id,
    action: "order.paid",
    targetType: "order",
    targetId: String(orderId),
    detail: sessionId ? `Stripe ${sessionId}` : "paid",
  });
  return { ok: true as const };
}

type PriceRow = {
  id: number;
  name: string;
  amount_cents: number;
  billing: string;
  billing_interval: string | null;
  stripe_price_id: string | null;
};

async function resolveSale(
  sql: Sql,
  slug: string,
  priceId?: number,
) {
  const product = await sql<{
    id: number;
    name: string;
    slug: string;
    price_cents: number | null;
    billing: string;
    billing_interval: string | null;
  }>`
    select id, name, slug, price_cents, billing, billing_interval from products
    where slug = ${slug} and status = 'published' limit 1
  `;
  const p = product[0];
  if (!p) throw new Error("Product not found");
  let tier: PriceRow | null = null;
  if (priceId) {
    const found = await sql<PriceRow>`
      select id, name, amount_cents, billing, billing_interval, stripe_price_id
      from product_prices where id = ${priceId} and product_id = ${p.id} limit 1
    `;
    tier = found[0] ?? null;
  }
  if (!tier) {
    const first = await sql<PriceRow>`
      select id, name, amount_cents, billing, billing_interval, stripe_price_id
      from product_prices where product_id = ${p.id} and active = true
      order by sort_order asc, id asc limit 1
    `;
    tier = first[0] ?? null;
  }
  const amount = tier?.amount_cents ?? p.price_cents;
  const billing = tier?.billing ?? p.billing;
  const interval = tier?.billing_interval ?? p.billing_interval;
  if (amount == null) throw new Error("This product is not listed for sale yet.");
  return { p, tier, amount, billing, interval };
}

export const startCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { slug: string; priceId?: number }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const access = await ensureProfile(sql, context.userId);
    const { p, tier, amount, billing, interval } = await resolveSale(sql, data.slug, data.priceId);
    if (billing === "free" || amount === 0) {
      await sql`
        insert into orders (user_id, product_id, amount_cents, billing, status)
        values (${context.userId}, ${p.id}, 0, 'free', 'paid')
      `;
      return { kind: "free" as const, url: null, orderId: 0 };
    }
    const inserted = await sql<{ id: number }>`
      insert into orders (user_id, product_id, amount_cents, billing, status)
      values (${context.userId}, ${p.id}, ${amount}, ${billing}, 'pending')
      returning id
    `;
    const orderId = inserted[0]!.id;
    const cfg = await stripeConfig(sql);
    if (!cfg.secret) throw new Error("Connect Stripe in Payments so this plan can be charged.");
    const origin = appOrigin();
    const sub = billing === "subscription";
    const recInterval = interval === "year" ? "year" : interval === "week" ? "week" : "month";
    const intervalCount = interval === "quarter" ? 3 : 1;
    const label = `${p.name}${tier?.name ? ` — ${tier.name}` : ""}`;
    const params = new URLSearchParams();
    params.set("mode", sub ? "subscription" : "payment");
    params.set("success_url", `${origin}/checkout/complete?session_id={CHECKOUT_SESSION_ID}&order=${orderId}`);
    params.set("cancel_url", `${origin}/checkout/cancel?slug=${encodeURIComponent(p.slug)}`);
    params.set("client_reference_id", String(orderId));
    params.set("allow_promotion_codes", "true");
    params.set("billing_address_collection", "auto");
    if (access.email) params.set("customer_email", access.email);
    params.set("line_items[0][quantity]", "1");
    params.set("metadata[order_id]", String(orderId));
    params.set("metadata[product_id]", String(p.id));
    params.set("metadata[user_id]", context.userId);
    if (sub) {
      params.set("subscription_data[metadata][order_id]", String(orderId));
    }
    if (cfg.alipay) {
      params.append("payment_method_types[0]", "card");
      params.append("payment_method_types[1]", "alipay");
    }
    if (tier?.stripe_price_id) {
      params.set("line_items[0][price]", tier.stripe_price_id);
    } else {
      params.set("line_items[0][price_data][currency]", "usd");
      params.set("line_items[0][price_data][product_data][name]", label);
      params.set("line_items[0][price_data][unit_amount]", String(amount));
      if (sub) {
        params.set("line_items[0][price_data][recurring][interval]", recInterval);
        params.set("line_items[0][price_data][recurring][interval_count]", String(intervalCount));
      }
    }
    const headers: Record<string, string> = {
      Authorization: `Bearer ${cfg.secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": `trillion-order-${orderId}`,
    };
    if (cfg.account) headers["Stripe-Account"] = cfg.account;
    if (!sub) {
      params.set("payment_intent_data[metadata][order_id]", String(orderId));
      params.set("payment_intent_data[metadata][product_id]", String(p.id));
      params.set("submit_type", "pay");
    }
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers,
      body: params,
    });
    const body = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
    if (!res.ok || !body.url) {
      throw new Error(body.error?.message || "Stripe could not open checkout.");
    }
    await sql`update orders set stripe_session_id = ${body.id ?? null} where id = ${orderId}`;
    return { kind: "stripe" as const, url: body.url, orderId };
  });

export const createElementsIntent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { slug: string; priceId?: number }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const access = await ensureProfile(sql, context.userId);
    const { p, tier, amount, billing, interval } = await resolveSale(sql, data.slug, data.priceId);
    if (billing === "free" || amount === 0) {
      await sql`
        insert into orders (user_id, product_id, amount_cents, billing, status)
        values (${context.userId}, ${p.id}, 0, 'free', 'paid')
      `;
      return { kind: "free" as const, clientSecret: null, publishableKey: null, orderId: 0, amount: 0, label: p.name };
    }
    const cfg = await stripeConfig(sql);
    if (!cfg.secret) throw new Error("Connect Stripe in Payments so this plan can be charged.");
    if (!cfg.publishable) {
      throw new Error("Add a Stripe publishable key (pk_live_ or pk_test_) in Payments.");
    }
    const inserted = await sql<{ id: number }>`
      insert into orders (user_id, product_id, amount_cents, billing, status)
      values (${context.userId}, ${p.id}, ${amount}, ${billing}, 'pending')
      returning id
    `;
    const orderId = inserted[0]!.id;
    const label = `${p.name}${tier?.name ? ` — ${tier.name}` : ""}`;
    const sub = billing === "subscription";
    const recInterval = interval === "year" ? "year" : interval === "week" ? "week" : "month";
    const intervalCount = interval === "quarter" ? 3 : 1;
    let clientSecret = "";
    let stripeId = "";

    if (sub) {
      const customerParams = new URLSearchParams();
      if (access.email) customerParams.set("email", access.email);
      customerParams.set("metadata[user_id]", context.userId);
      const customer = (await stripeRequest(
        cfg.secret,
        "/customers",
        customerParams,
        cfg.account || undefined,
      )) as { id: string };
      const subParams = new URLSearchParams();
      subParams.set("customer", customer.id);
      subParams.set("payment_behavior", "default_incomplete");
      subParams.set("payment_settings[save_default_payment_method]", "on_subscription");
      subParams.append("expand[]", "latest_invoice.payment_intent");
      subParams.set("metadata[order_id]", String(orderId));
      subParams.set("metadata[product_id]", String(p.id));
      if (tier?.stripe_price_id) {
        subParams.set("items[0][price]", tier.stripe_price_id);
      } else {
        subParams.set("items[0][price_data][currency]", "usd");
        subParams.set("items[0][price_data][unit_amount]", String(amount));
        subParams.set("items[0][price_data][product_data][name]", label);
        subParams.set("items[0][price_data][recurring][interval]", recInterval);
        subParams.set("items[0][price_data][recurring][interval_count]", String(intervalCount));
      }
      if (cfg.alipay) {
        subParams.append("payment_settings[payment_method_types][0]", "card");
        subParams.append("payment_settings[payment_method_types][1]", "alipay");
      }
      const subscription = (await stripeRequest(
        cfg.secret,
        "/subscriptions",
        subParams,
        cfg.account || undefined,
      )) as {
        id: string;
        latest_invoice?: { payment_intent?: { id?: string; client_secret?: string } | string };
      };
      const pi = subscription.latest_invoice?.payment_intent;
      const secret =
        typeof pi === "object" && pi && "client_secret" in pi ? pi.client_secret : "";
      if (!secret) throw new Error("Stripe did not return a payment form for this subscription.");
      clientSecret = String(secret);
      stripeId = typeof pi === "object" && pi?.id ? String(pi.id) : subscription.id;
    } else {
      const piParams = new URLSearchParams();
      piParams.set("amount", String(amount));
      piParams.set("currency", "usd");
      piParams.set("metadata[order_id]", String(orderId));
      piParams.set("metadata[product_id]", String(p.id));
      piParams.set("metadata[user_id]", context.userId);
      piParams.set("description", label);
      if (access.email) piParams.set("receipt_email", access.email);
      if (cfg.alipay) {
        piParams.append("payment_method_types[0]", "card");
        piParams.append("payment_method_types[1]", "alipay");
      } else {
        piParams.set("automatic_payment_methods[enabled]", "true");
      }
      const intent = (await stripeRequest(
        cfg.secret,
        "/payment_intents",
        piParams,
        cfg.account || undefined,
      )) as { id: string; client_secret: string };
      if (!intent.client_secret) throw new Error("Stripe did not return a payment form.");
      clientSecret = intent.client_secret;
      stripeId = intent.id;
    }

    await sql`update orders set stripe_session_id = ${stripeId} where id = ${orderId}`;
    return {
      kind: "elements" as const,
      clientSecret,
      publishableKey: cfg.publishable,
      accountId: cfg.account || null,
      orderId,
      amount,
      billing,
      interval,
      label,
    };
  });

export const confirmLedgerCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((orderId: number) => orderId)
  .handler(async ({ context, data: orderId }) => {
    const sql = await getSql();
    const rows = await sql<{ status: string; billing: string; amount_cents: number }>`
      select status, billing, amount_cents from orders
      where id = ${orderId} and user_id = ${context.userId} limit 1
    `;
    const order = rows[0];
    if (!order) throw new Error("Order not found");
    if (order.status === "paid") return { ok: true as const };
    if (order.billing !== "free" && order.amount_cents > 0) {
      throw new Error("This order must be paid on Stripe.");
    }
    return markOrderPaid(sql, orderId);
  });

export const fulfillStripeOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { orderId?: number; sessionId?: string; paymentIntent?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const cfg = await stripeConfig(sql);
    if (!cfg.secret) throw new Error("Stripe is not connected.");
    const ref = data.paymentIntent || data.sessionId;
    if (!ref) throw new Error("Missing payment reference.");
    let orderId = data.orderId || 0;
    let stripeRef = ref;
    if (ref.startsWith("pi_")) {
      const intent = (await stripeGet(cfg.secret, `/payment_intents/${ref}`, cfg.account || undefined)) as {
        id?: string;
        status?: string;
        metadata?: { order_id?: string };
      };
      if (intent.status !== "succeeded") throw new Error("Payment is not complete yet.");
      orderId = orderId || Number(intent.metadata?.order_id || 0);
      stripeRef = intent.id || ref;
    } else {
      const session = (await stripeGet(
        cfg.secret,
        `/checkout/sessions/${ref}`,
        cfg.account || undefined,
      )) as {
        id?: string;
        status?: string;
        payment_status?: string;
        client_reference_id?: string;
        metadata?: { order_id?: string };
      };
      const paid = session.payment_status === "paid" || session.status === "complete";
      if (!paid) throw new Error("Payment is not complete yet.");
      orderId = orderId || Number(session.client_reference_id || session.metadata?.order_id || 0);
      stripeRef = session.id || ref;
    }
    if (!orderId) throw new Error("Order not found for this checkout.");
    const rows = await sql<{ id: number; user_id: string; status: string }>`
      select id, user_id, status from orders
      where id = ${orderId} and user_id = ${context.userId} limit 1
    `;
    const order = rows[0];
    if (!order) throw new Error("Order not found");
    if (order.status === "paid") return { ok: true as const, orderId };
    return { ...(await markOrderPaid(sql, orderId, stripeRef)), orderId };
  });

export const myCommerce = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const orders = await sql<{
      id: number;
      user_id: string;
      product_id: number;
      amount_cents: number;
      billing: string;
      status: string;
      created_at: string;
      name: string;
    }>`
      select o.id, o.user_id, o.product_id, o.amount_cents, o.billing, o.status,
             o.created_at::text as created_at, p.name
      from orders o join products p on p.id = o.product_id
      where o.user_id = ${context.userId}
      order by o.created_at desc
    `;
    const tickets = await sql<{
      id: number;
      subject: string;
      status: string;
      priority: string;
      created_at: string;
    }>`
      select id, subject, status, priority, created_at::text as created_at
      from tickets where user_id = ${context.userId}
      order by created_at desc
    `;
    const mapped: Order[] = orders.map((o) => ({
      id: o.id,
      userId: o.user_id,
      productId: o.product_id,
      productName: o.name,
      amountCents: o.amount_cents,
      billing: o.billing,
      status: o.status,
      createdAt: o.created_at,
    }));
    return { orders: mapped, tickets };
  });

export const openTicket = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { subject: string; body: string; priority?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const subject = data.subject.trim();
    const body = data.body.trim();
    if (!subject || !body) throw new Error("Subject and message are required");
    const rows = await sql<{ id: number }>`
      insert into tickets (user_id, subject, body, priority)
      values (${context.userId}, ${subject}, ${body}, ${data.priority ?? "normal"})
      returning id
    `;
    return { id: rows[0]!.id };
  });
