import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { ensureProfile, ensureSeed, writeAudit } from "./bootstrap";
import type { Order } from "./types";

async function stripeSecret(): Promise<string | undefined> {
  return process.env.STRIPE_SECRET_KEY?.trim() || undefined;
}

export const startCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((slug: string) => slug)
  .handler(async ({ context, data: slug }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const access = await ensureProfile(sql, context.userId);
    const product = await sql<{
      id: number;
      name: string;
      slug: string;
      price_cents: number | null;
      billing: string;
    }>`
      select id, name, slug, price_cents, billing from products
      where slug = ${slug} and status = 'published' limit 1
    `;
    const p = product[0];
    if (!p) throw new Error("Product not found");
    if (p.price_cents == null) {
      throw new Error("This product is not listed for sale yet.");
    }
    if (p.billing === "free" || p.price_cents === 0) {
      await sql`
        insert into orders (user_id, product_id, amount_cents, billing, status)
        values (${context.userId}, ${p.id}, 0, 'free', 'paid')
      `;
      await writeAudit(sql, {
        actorId: context.userId,
        actorEmail: access.email,
        action: "order.free",
        targetType: "product",
        targetId: String(p.id),
        detail: p.name,
      });
      return { kind: "free" as const, orderId: 0 };
    }
    const amount = p.price_cents ?? 0;
    const inserted = await sql<{ id: number }>`
      insert into orders (user_id, product_id, amount_cents, billing, status)
      values (${context.userId}, ${p.id}, ${amount}, ${p.billing}, 'pending')
      returning id
    `;
    const orderId = inserted[0]!.id;
    const key = await stripeSecret();
    if (key) {
      const origin =
        process.env.BETTER_AUTH_URL?.replace(/\/+$/, "") ||
        "http://localhost:8080";
      const params = new URLSearchParams();
      params.set("mode", "payment");
      params.set("success_url", `${origin}/checkout/complete?session_id={CHECKOUT_SESSION_ID}&order=${orderId}`);
      params.set("cancel_url", `${origin}/market/${p.slug}`);
      params.set("client_reference_id", String(orderId));
      params.set("customer_email", access.email ?? "");
      params.set("line_items[0][quantity]", "1");
      params.set("line_items[0][price_data][currency]", "usd");
      params.set("line_items[0][price_data][product_data][name]", p.name);
      params.set("line_items[0][price_data][unit_amount]", String(amount));
      const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });
      if (res.ok) {
        const body = (await res.json()) as { id: string; url: string };
        await sql`
          update orders set stripe_session_id = ${body.id} where id = ${orderId}
        `;
        return { kind: "stripe" as const, url: body.url, orderId };
      }
      throw new Error("Stripe could not open checkout. Write the desk instead.");
    }
    throw new Error("Purchases open when a product is listed for sale.");
  });

export const confirmLedgerCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((orderId: number) => orderId)
  .handler(async ({ context, data: orderId }) => {
    const sql = await getSql();
    const access = await ensureProfile(sql, context.userId);
    const rows = await sql<{
      id: number;
      user_id: string;
      product_id: number;
      billing: string;
      status: string;
    }>`
      select id, user_id, product_id, billing, status from orders
      where id = ${orderId} and user_id = ${context.userId} limit 1
    `;
    const order = rows[0];
    if (!order) throw new Error("Order not found");
    if (order.status === "paid") return { ok: true as const };
    await sql`update orders set status = 'paid' where id = ${orderId} and user_id = ${context.userId}`;
    if (order.billing === "subscription") {
      await sql`
        insert into subscriptions (user_id, product_id, status, current_period_end)
        values (${context.userId}, ${order.product_id}, 'active', now() + interval '30 days')
      `;
    }
    await sql`
      insert into usage_events (user_id, event_type, product_id)
      values (${context.userId}, 'purchase', ${order.product_id})
    `;
    await writeAudit(sql, {
      actorId: context.userId,
      actorEmail: access.email,
      action: "order.paid",
      targetType: "order",
      targetId: String(orderId),
      detail: "Ledger checkout confirmed",
    });
    return { ok: true as const };
  });

export const fulfillStripeOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { orderId: number; sessionId: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ id: number; user_id: string; product_id: number; billing: string; status: string }>`
      select id, user_id, product_id, billing, status from orders
      where id = ${data.orderId} and user_id = ${context.userId} limit 1
    `;
    const order = rows[0];
    if (!order) throw new Error("Order not found");
    if (order.status === "paid") return { ok: true as const };
    await sql`
      update orders set status = 'paid', stripe_session_id = ${data.sessionId}
      where id = ${data.orderId} and user_id = ${context.userId}
    `;
    if (order.billing === "subscription") {
      await sql`
        insert into subscriptions (user_id, product_id, status, current_period_end)
        values (${context.userId}, ${order.product_id}, 'active', now() + interval '30 days')
      `;
    }
    return { ok: true as const };
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
