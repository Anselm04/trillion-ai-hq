import { createHmac } from "node:crypto";
import { hmacTimingEqual } from "../crypto-timing.ts";

export { hmacTimingEqual } from "../crypto-timing.ts";

const MAX_AGE_SECONDS = 300;
const DUMMY_V1 = "0".repeat(64);

function parseStripeSignature(header: string) {
  const timestamps: string[] = [];
  const v1: string[] = [];
  for (const part of header.split(",")) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key === "t") timestamps.push(value);
    if (key === "v1") v1.push(value);
  }
  return { timestamp: timestamps[0], signatures: v1 };
}

function decodeHex(hex: string) {
  if (!hex || hex.length % 2 !== 0 || /[^0-9a-fA-F]/.test(hex)) return Buffer.alloc(0);
  return Buffer.from(hex, "hex");
}

function hmacSha256(secret: string, payload: string) {
  return createHmac("sha256", secret).update(payload).digest();
}

/**
 * Always runs HMAC before classifying the failure so missing / malformed /
 * stale / mismatch take the same crypto path (no early return around the MAC).
 */
export function verifyStripeSignature(raw: string, header: string, secret: string, now = Date.now()) {
  const key = secret || "whsec_unconfigured";
  const body = raw || "";
  const { timestamp, signatures } = parseStripeSignature(header || "");
  const ts = timestamp && Number.isFinite(Number(timestamp)) ? timestamp : "0";
  const expected = hmacSha256(key, `${ts}.${body}`);
  const list = signatures.length > 0 ? signatures : [DUMMY_V1];
  let matched = 0;
  for (const sig of list) {
    matched |= hmacTimingEqual(decodeHex(sig), expected) ? 1 : 0;
  }
  if (!secret || !header || !raw) return { ok: false as const, reason: "missing" };
  if (!timestamp || signatures.length === 0) return { ok: false as const, reason: "malformed" };
  const age = Math.abs(now / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > MAX_AGE_SECONDS) return { ok: false as const, reason: "stale" };
  if (matched !== 1) return { ok: false as const, reason: "mismatch" };
  return { ok: true as const };
}
