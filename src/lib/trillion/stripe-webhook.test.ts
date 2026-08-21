import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";
import { hmacTimingEqual, verifyStripeSignature } from "./stripe-webhook.ts";

const secret = "whsec_test_secret";
const payload = '{"id":"evt_1","type":"payment_intent.succeeded"}';

function header(raw: string, at: number, extraV1?: string) {
  const t = Math.floor(at / 1000);
  const v1 = createHmac("sha256", secret).update(`${t}.${raw}`).digest("hex");
  const v0 = createHmac("sha256", "whsec_old").update(`${t}.${raw}`).digest("hex");
  if (extraV1) return `t=${t},v1=${extraV1},v1=${v1},v0=${v0}`;
  return `t=${t},v1=${v1},v0=${v0}`;
}

describe("hmacTimingEqual", () => {
  it("accepts identical 32-byte digests", () => {
    const mac = createHmac("sha256", secret).update("body").digest();
    assert.equal(hmacTimingEqual(Buffer.from(mac), Buffer.from(mac)), true);
  });

  it("rejects a one-byte difference without throwing", () => {
    const mac = createHmac("sha256", secret).update("body").digest();
    const other = Buffer.from(mac);
    other[0] ^= 0xff;
    assert.equal(hmacTimingEqual(other, mac), false);
  });

  it("rejects a shorter buffer in constant-size compare", () => {
    const mac = createHmac("sha256", secret).update("body").digest();
    assert.equal(hmacTimingEqual(mac.subarray(0, 16), mac), false);
  });
});

describe("verifyStripeSignature", () => {
  it("accepts a current signed payload", () => {
    const now = Date.now();
    assert.equal(verifyStripeSignature(payload, header(payload, now), secret, now).ok, true);
  });

  it("accepts a rolled signature when any v1 matches", () => {
    const now = Date.now();
    assert.equal(verifyStripeSignature(payload, header(payload, now, "aa".repeat(32)), secret, now).ok, true);
  });

  it("rejects a forged signature", () => {
    const now = Date.now();
    const t = Math.floor(now / 1000);
    const result = verifyStripeSignature(payload, `t=${t},v1=${"ab".repeat(32)}`, secret, now);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "mismatch");
  });

  it("rejects a stale timestamp", () => {
    const now = Date.now();
    const old = now - 10 * 60 * 1000;
    const result = verifyStripeSignature(payload, header(payload, old), secret, now);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "stale");
  });

  it("accepts a Stripe CLI style header with v1 and v0", () => {
    const now = Date.now();
    const raw = '{"id":"evt_cli","object":"event","type":"checkout.session.completed"}';
    assert.equal(verifyStripeSignature(raw, header(raw, now), secret, now).ok, true);
  });
});
