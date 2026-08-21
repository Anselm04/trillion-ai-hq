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
  founder: FOUNDER.commandEmail,
} as const;

export function isFounderEmail(email: string | null | undefined): boolean {
  const normalized = (email ?? "").trim().toLowerCase();
  return (FOUNDER_EMAILS as readonly string[]).includes(normalized);
}
