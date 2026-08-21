import type { Billing } from "./types";
import { ROLE_LABEL, type Role } from "./roles";

export function formatPrice(
  cents: number | null | undefined,
  billing: Billing | string,
): string {
  if (billing === "free" || cents === 0) return "Free";
  if (cents == null) return "Contact";
  const dollars = (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  });
  if (billing === "subscription") return `${dollars}/mo`;
  return dollars;
}

export function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function roleLabel(role: string): string {
  return ROLE_LABEL[role as Role] ?? role;
}

export function featureList(raw: string): string[] {
  return raw
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export function initials(name: string | null | undefined): string {
  const n = (name ?? "T").trim();
  const parts = n.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "T";
}
