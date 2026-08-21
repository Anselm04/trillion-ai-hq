import { timingSafeEqual } from "node:crypto";

const HMAC_SHA256_LEN = 32;

/**
 * Constant-time compare of two byte strings.
 * Pads to a shared length so `timingSafeEqual` never throws and never
 * returns on the first mismatched byte. Length is mixed into the result.
 */
export function hmacTimingEqual(actual: Buffer, expected: Buffer, expectedLen = HMAC_SHA256_LEN) {
  const n = Math.max(actual.length, expected.length, expectedLen);
  const left = Buffer.alloc(n);
  const right = Buffer.alloc(n);
  actual.copy(left);
  expected.copy(right);
  const bytesOk = timingSafeEqual(left, right) ? 1 : 0;
  const lenOk = actual.length === expected.length && expected.length === expectedLen ? 1 : 0;
  return (bytesOk & lenOk) === 1;
}

/** Constant-time UTF-8 string equality (emails, tokens, prefixes). */
export function timingSafeEqualString(actual: string, expected: string) {
  const left = Buffer.from(actual, "utf8");
  const right = Buffer.from(expected, "utf8");
  const n = Math.max(left.length, right.length, 1);
  const a = Buffer.alloc(n);
  const b = Buffer.alloc(n);
  left.copy(a);
  right.copy(b);
  const bytesOk = timingSafeEqual(a, b) ? 1 : 0;
  const lenOk = left.length === right.length ? 1 : 0;
  return (bytesOk & lenOk) === 1;
}

/** Compare `candidate` to every item so the match index does not leak. */
export function timingSafeIncludes(candidate: string, list: readonly string[]) {
  let matched = 0;
  for (const item of list) {
    matched |= timingSafeEqualString(candidate, item) ? 1 : 0;
  }
  return matched === 1;
}
