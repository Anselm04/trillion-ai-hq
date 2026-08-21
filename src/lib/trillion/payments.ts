import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { staffAccess, writeAudit } from "./bootstrap";
import type { PriceTier } from "./types";

type Sql = Awaited<ReturnType<typeof getSql>>;

export type PaymentStatus = {
  connected: boolean;
  mode: "live" | "test" | "off";
  publishableKey: string | null;
  stripeAccountId: string | null;
  alipayEnabled: boolean;
  lastSyncAt: string | null;
  lastError: string | null;
  secretHint: string | null;
  webhookHint: string | null;
  webhookUrl: string;
};

async function readSettings(sql: Sql) {
  await sql`insert into payment_settings (id) values (1) on conflict (id) do nothing`;
  try {
    const rows = await sql<{
      stripe_secret_key: string | null;
      stripe_publishable_key: string | null;
      stripe_account_id: string | null;
      alipay_enabled: boolean;
      last_sync_at: string | null;
      last_error: string | null;
      stripe_webhook_secret: string | null;
    }>`
      select stripe_secret_key, stripe_publishable_key, stripe_account_id,
             alipay_enabled, last_sync_at::text as last_sync_at, last_error,
             stripe_webhook_secret
      from payment_settings where id = 1
    `;
    return rows[0];
  } catch {
    const rows = await sql<{
      stripe_secret_key: string | null;
      stripe_publishable_key: string | null;
      stripe_account_id: string | null;
      alipay_enabled: boolean;
      last_sync_at: string | null;
      last_error: string | null;
    }>`
      select stripe_secret_key, stripe_publishable_key, stripe_account_id,
             alipay_enabled, last_sync_at::text as last_sync_at, last_error
      from payment_settings where id = 1
    `;
    return { ...rows[0], stripe_webhook_secret: null };
  }
}

export async function stripeConfig(sql: Sql) {
  const s = await readSettings(sql);
  const secret = s?.stripe_secret_key?.trim() || process.env.STRIPE_SECRET_KEY?.trim() || "";
  const account = s?.stripe_account_id?.trim() || process.env.STRIPE_ACCOUNT_ID?.trim() || "";
  const alipay = Boolean(s?.alipay_enabled);
  const webhook = s?.stripe_webhook_secret?.trim() || process.env.STRIPE_WEBHOOK_SECRET?.trim() || "";
  return { secret, account, alipay, publishable: s?.stripe_publishable_key?.trim() || "", webhook };
}

export async function stripeRequest(
  secret: string,
  path: string,
  params: URLSearchParams,
  account?: string,
) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (account) headers["Stripe-Account"] = account;
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers,
    body: params,
  });
  const body = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const err = body.error as { message?: string } | undefined;
    throw new Error(err?.message || "Stripe request failed");
  }
  return body;
}

export async function stripeGet(secret: string, path: string, account?: string) {
  const headers: Record<string, string> = { Authorization: `Bearer ${secret}` };
  if (account) headers["Stripe-Account"] = account;
  const res = await fetch(`https://api.stripe.com/v1${path}`, { headers });
  const body = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const err = body.error as { message?: string } | undefined;
    throw new Error(err?.message || "Stripe request failed");
  }
  return body;
}

export const getPaymentStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<PaymentStatus> => {
    const { sql } = await staffAccess(context.userId, "enterThrone");
    const s = await readSettings(sql);
    const secret = s?.stripe_secret_key?.trim() || process.env.STRIPE_SECRET_KEY?.trim() || "";
    const webhook = s?.stripe_webhook_secret?.trim() || process.env.STRIPE_WEBHOOK_SECRET?.trim() || "";
    const live = secret.startsWith("sk_live_");
    const origin =
      process.env.BETTER_AUTH_URL?.replace(/\/+$/, "") || "https://trillionaitech.com";
    return {
      connected: Boolean(secret),
      mode: secret ? (live ? "live" : "test") : "off",
      publishableKey: s?.stripe_publishable_key ?? null,
      stripeAccountId: s?.stripe_account_id ?? null,
      alipayEnabled: Boolean(s?.alipay_enabled),
      lastSyncAt: s?.last_sync_at ?? null,
      lastError: s?.last_error ?? null,
      secretHint: secret ? `${secret.slice(0, 7)}…${secret.slice(-4)}` : null,
      webhookHint: webhook ? `whsec_…${webhook.slice(-4)}` : null,
      webhookUrl: `${origin}/api/stripe/webhook`,
    };
  });

export const savePaymentSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      secretKey?: string;
      publishableKey?: string;
      stripeAccountId?: string;
      alipayEnabled?: boolean;
      webhookSecret?: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const { sql, access } = await staffAccess(context.userId, "enterThrone");
    await sql`insert into payment_settings (id) values (1) on conflict (id) do nothing`;
    const current = await readSettings(sql);
    const secret = data.secretKey?.trim() || current?.stripe_secret_key || null;
    const pub = data.publishableKey?.trim() ?? current?.stripe_publishable_key ?? null;
    const acct = data.stripeAccountId?.trim() ?? current?.stripe_account_id ?? null;
    const alipay = data.alipayEnabled ?? current?.alipay_enabled ?? false;
    const webhookSecret = data.webhookSecret?.trim() || current?.stripe_webhook_secret || null;
    if (data.webhookSecret?.trim() && !data.webhookSecret.trim().startsWith("whsec_")) {
      throw new Error("Webhook secret must start with whsec_ (Stripe Dashboard → Webhooks → Signing secret).");
    }
    if (data.secretKey?.trim() && !/^sk_(live|test)_/.test(data.secretKey.trim())) {
      throw new Error("Secret key must start with sk_live_ or sk_test_.");
    }
    await sql`
      update payment_settings set
        stripe_secret_key = ${secret},
        stripe_publishable_key = ${pub},
        stripe_account_id = ${acct},
        alipay_enabled = ${alipay},
        stripe_webhook_secret = ${webhookSecret},
        connected_at = case when ${secret} is not null then now() else connected_at end,
        last_error = null
      where id = 1
    `;
    if (secret) {
      try {
        await stripeGet(secret, "/account", acct || undefined);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not reach Stripe";
        await sql`update payment_settings set last_error = ${message} where id = 1`;
        throw new Error(message);
      }
    }
    await writeAudit(sql, {
      actorId: access.userId,
      actorEmail: access.email,
      action: "payments.connect",
      targetType: "stripe",
      detail: acct || "platform",
    });
    return { ok: true as const };
  });

function stripeInterval(interval: string | null | undefined) {
  if (interval === "year") return { interval: "year", count: 1 };
  if (interval === "week") return { interval: "week", count: 1 };
  if (interval === "quarter") return { interval: "month", count: 3 };
  return { interval: "month", count: 1 };
}

export async function syncTiersToStripe(
  sql: Sql,
  product: { id: number; name: string; description?: string },
  tiers: PriceTier[],
) {
  const cfg = await stripeConfig(sql);
  if (!cfg.secret) return tiers;
  let stripeProductId: string | undefined;
  const origin =
    process.env.BETTER_AUTH_URL?.replace(/\/+$/, "") || "https://trillionaitech.com";
  const synced: PriceTier[] = [];
  for (const tier of tiers) {
    if (tier.billing === "free" || !tier.amountCents) {
      synced.push({ ...tier, stripePriceId: null, paymentLinkUrl: null });
      continue;
    }
    if (!stripeProductId) {
      const created = await stripeRequest(
        cfg.secret,
        "/products",
        new URLSearchParams({
          name: product.name,
          description: product.description || product.name,
          "metadata[trillion_product_id]": String(product.id),
        }),
        cfg.account || undefined,
      );
      stripeProductId = String(created.id);
    }
    const rec = stripeInterval(tier.billingInterval);
    const priceParams = new URLSearchParams({
      product: stripeProductId,
      currency: "usd",
      unit_amount: String(tier.amountCents),
      "metadata[tier]": tier.name || "plan",
    });
    if (tier.billing === "subscription") {
      priceParams.set("recurring[interval]", rec.interval);
      priceParams.set("recurring[interval_count]", String(rec.count));
    }
    const price = await stripeRequest(cfg.secret, "/prices", priceParams, cfg.account || undefined);
    const priceId = String(price.id);
    const linkParams = new URLSearchParams({
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      "after_completion[type]": "redirect",
      "after_completion[redirect][url]": `${origin}/checkout/complete`,
    });
    if (cfg.alipay) {
      linkParams.append("payment_method_types[0]", "card");
      linkParams.append("payment_method_types[1]", "alipay");
    }
    const link = await stripeRequest(cfg.secret, "/payment_links", linkParams, cfg.account || undefined);
    const url = String((link as { url?: string }).url || "");
    synced.push({ ...tier, stripePriceId: priceId, paymentLinkUrl: url });
    if (tier.id) {
      await sql`
        update product_prices
        set stripe_price_id = ${priceId},
            stripe_product_id = ${stripeProductId},
            payment_link_url = ${url}
        where id = ${tier.id}
      `;
    }
  }
  await sql`update payment_settings set last_sync_at = now(), last_error = null where id = 1`;
  return synced;
}

export async function loadPrices(sql: Sql, productIds: number[]): Promise<Map<number, PriceTier[]>> {
  const map = new Map<number, PriceTier[]>();
  if (!productIds.length) return map;
  try {
    const rows = await sql<{
      id: number;
      product_id: number;
      name: string;
      amount_cents: number;
      billing: string;
      billing_interval: string | null;
      stripe_price_id: string | null;
      payment_link_url: string | null;
      active: boolean;
    }>`
      select id, product_id, name, amount_cents, billing, billing_interval,
             stripe_price_id, payment_link_url, active
      from product_prices
      order by sort_order asc, id asc
    `;
    for (const row of rows) {
      if (!productIds.includes(row.product_id)) continue;
      const list = map.get(row.product_id) ?? [];
      list.push({
        id: row.id,
        name: row.name,
        amountCents: row.amount_cents,
        billing: (row.billing as PriceTier["billing"]) || "subscription",
        billingInterval: row.billing_interval,
        stripePriceId: row.stripe_price_id,
        paymentLinkUrl: row.payment_link_url,
        active: row.active,
      });
      map.set(row.product_id, list);
    }
  } catch {
    /* table not ready */
  }
  return map;
}
