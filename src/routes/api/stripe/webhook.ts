import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { stripeConfig } from "@/lib/trillion/payments";
import { markOrderPaid } from "@/lib/trillion/commerce";
import { verifyStripeSignature } from "@/lib/trillion/stripe-webhook";

function reject() {
  return new Response("invalid signature", { status: 400 });
}

async function handleStripeWebhook(request: Request) {
  const raw = await request.text();
  const sql = await getSql();
  const cfg = await stripeConfig(sql);
  const header = request.headers.get("stripe-signature") ?? "";
  const verified = verifyStripeSignature(raw, header, cfg.webhook);
  if (!cfg.webhook) {
    return new Response("webhook secret not configured", { status: 503 });
  }
  if (!verified.ok) return reject();
  let event: { type?: string; id?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(raw) as typeof event;
  } catch {
    return reject();
  }
  const type = event.type ?? "";
  if (type === "checkout.session.completed" || type === "checkout.session.async_payment_succeeded") {
    const session = event.data?.object ?? {};
    const meta = (session.metadata ?? {}) as { order_id?: string };
    const orderId = Number(session.client_reference_id ?? meta.order_id);
    const sessionId = typeof session.id === "string" ? session.id : null;
    const paid =
      session.payment_status === "paid" ||
      session.status === "complete" ||
      type === "checkout.session.completed";
    if (orderId && paid) await markOrderPaid(sql, orderId, sessionId);
  }
  if (type === "payment_intent.succeeded") {
    const intent = event.data?.object ?? {};
    const meta = (intent.metadata ?? {}) as { order_id?: string };
    const orderId = Number(meta.order_id);
    if (orderId) await markOrderPaid(sql, orderId, typeof intent.id === "string" ? intent.id : null);
  }
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      GET: async () => new Response("method not allowed", { status: 405, headers: { allow: "POST" } }),
      POST: async ({ request }) => handleStripeWebhook(request),
    },
  },
});
