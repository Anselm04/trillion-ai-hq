#!/usr/bin/env node
/**
 * Mimics `stripe listen` / `stripe trigger` signature format against this app.
 * Stripe CLI is not required. To test the real CLI on your machine:
 *
 *   stripe listen --forward-to https://trillionaitech.com/api/stripe/webhook
 *   # paste the printed whsec_ into Master Control → Payments
 *   stripe trigger payment_intent.succeeded
 *   stripe trigger checkout.session.completed
 */
import { createHmac } from "node:crypto";

const secret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_cli_test_secret";
const now = Math.floor(Date.now() / 1000);
const payload = JSON.stringify({
  id: "evt_cli_test",
  object: "event",
  type: "payment_intent.succeeded",
  data: { object: { id: "pi_cli_test", metadata: { order_id: "0" } } },
});
const v1 = createHmac("sha256", secret).update(`${now}.${payload}`).digest("hex");
const header = `t=${now},v1=${v1}`;

const { verifyStripeSignature } = await import("../src/lib/trillion/stripe-webhook.ts");
const local = verifyStripeSignature(payload, header, secret, now * 1000);
if (!local.ok) {
  console.error("local HMAC failed", local);
  process.exit(1);
}
console.log("Stripe CLI signature format: ok");

const target = process.env.STRIPE_WEBHOOK_URL;
if (!target) {
  console.log("Set STRIPE_WEBHOOK_URL to POST this signed event at a running server.");
  process.exit(0);
}

const res = await fetch(target, {
  method: "POST",
  headers: { "content-type": "application/json", "stripe-signature": header },
  body: payload,
});
const text = await res.text();
console.log(`POST ${target} → ${res.status} ${text}`);
if (res.status !== 200 && res.status !== 503) process.exit(1);
