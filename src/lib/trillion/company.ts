export const COMPANY = {
  legalName: "Trillion AI Tech Company Limited",
  shortName: "Trillion AI",
  domain: "trillionaitech.com",
  siteUrl: "https://trillionaitech.com",
} as const;

export const FOUNDER = {
  name: "Anselm Perkins",
  titles: "Founder, Owner & CEO",
  commandEmail: "anselm.perkins@gmail.com",
  companyEmail: "anselm@trillionaitech.com",
} as const;

export const FOUNDER_EMAILS = [
  FOUNDER.commandEmail,
  FOUNDER.companyEmail,
] as const;

export const MAIL = {
  hello: "hello@trillionaitech.com",
  support: "support@trillionaitech.com",
  founder: FOUNDER.companyEmail,
} as const;

function timingSafeEqualAscii(actual: string, expected: string) {
  const n = Math.max(actual.length, expected.length, 1);
  let diff = actual.length ^ expected.length;
  for (let i = 0; i < n; i++) {
    diff |= (actual.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export function isFounderEmail(email: string | null | undefined): boolean {
  const normalized = (email ?? "").trim().toLowerCase();
  if (!normalized) return false;
  let matched = 0;
  for (const allowed of FOUNDER_EMAILS) {
    matched |= timingSafeEqualAscii(normalized, allowed) ? 1 : 0;
  }
  return matched === 1;
}

const ADMIN_PIN = "trillion-open-admin";

export function rememberAdminOpen() {
  try {
    window.sessionStorage.setItem(ADMIN_PIN, "1");
  } catch {
    /* ignore */
  }
}

export function adminOpenRemembered() {
  try {
    return window.sessionStorage.getItem(ADMIN_PIN) === "1";
  } catch {
    return false;
  }
}

export function forgetAdminOpen() {
  try {
    window.sessionStorage.removeItem(ADMIN_PIN);
  } catch {
    /* ignore */
  }
}
