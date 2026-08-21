import { getSql } from "@/lib/db";
import { GUEST_ACCESS, type Role, hasPerm, type Perm } from "./roles";
import { PRODUCT_SEEDS } from "./seed-data";
import type { Access, Product } from "./types";

type Sql = Awaited<ReturnType<typeof getSql>>;

export function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    name: String(row.name),
    tagline: String(row.tagline ?? ""),
    description: String(row.description ?? ""),
    category: row.category as Product["category"],
    priceCents: row.price_cents == null ? null : Number(row.price_cents),
    billing: (row.billing as Product["billing"]) ?? "one_time",
    billingInterval: row.billing_interval ? String(row.billing_interval) : null,
    demoUrl: row.demo_url ? String(row.demo_url) : null,
    videoUrl: row.video_url ? String(row.video_url) : null,
    features: String(row.features ?? ""),
    vantaReady: Boolean(row.vanta_ready),
    featured: Boolean(row.featured),
    status: (row.status as Product["status"]) ?? "published",
    createdBy: row.created_by ? String(row.created_by) : null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

export async function ensureSeed(sql: Sql): Promise<void> {
  const count = await sql<{ n: number }>`select count(*)::int as n from products`;
  if ((count[0]?.n ?? 0) > 0) return;
  for (const p of PRODUCT_SEEDS) {
    await sql`
      insert into products (
        slug, name, tagline, description, category, price_cents, billing,
        billing_interval, features, vanta_ready, featured, status
      ) values (
        ${p.slug}, ${p.name}, ${p.tagline}, ${p.description}, ${p.category},
        ${p.priceCents}, ${p.billing}, ${p.billingInterval}, ${p.features},
        ${p.vantaReady}, ${p.featured}, ${"published"}
      )
      on conflict (slug) do nothing
    `;
  }
}

export async function writeAudit(
  sql: Sql,
  input: {
    actorId?: string | null;
    actorEmail?: string | null;
    action: string;
    targetType?: string;
    targetId?: string;
    detail?: string;
  },
): Promise<number | null> {
  const rows = await sql<{ id: number }>`
    insert into audit_logs (actor_id, actor_email, action, target_type, target_id, detail)
    values (
      ${input.actorId ?? null}, ${input.actorEmail ?? null}, ${input.action},
      ${input.targetType ?? null}, ${input.targetId ?? null}, ${input.detail ?? null}
    )
    returning id
  `;
  return rows[0]?.id ?? null;
}

export async function raiseSentinel(
  sql: Sql,
  input: {
    severity: "info" | "warning" | "critical";
    title: string;
    detail: string;
    source: string;
    relatedLogId?: number | null;
  },
): Promise<void> {
  await sql`
    insert into sentinel_alerts (severity, title, detail, source, related_log_id)
    values (
      ${input.severity}, ${input.title}, ${input.detail}, ${input.source},
      ${input.relatedLogId ?? null}
    )
  `;
}

export async function escalateStaleAlerts(sql: Sql): Promise<void> {
  const stale = await sql<{ id: number; title: string }>`
    select id, title from sentinel_alerts
    where status = 'open'
      and severity = 'critical'
      and escalated_at is null
      and created_at < now() - interval '15 minutes'
  `;
  for (const row of stale) {
    await sql`
      update sentinel_alerts
      set status = 'escalated', escalated_at = now()
      where id = ${row.id}
    `;
    await writeAudit(sql, {
      action: "sentinel.escalated",
      targetType: "alert",
      targetId: String(row.id),
      detail: `Watch did not acknowledge "${row.title}" within 15 minutes. Escalated to Throne.`,
    });
  }
}

export async function loadAuthUser(
  sql: Sql,
  userId: string,
): Promise<{ email: string | null; name: string | null }> {
  const rows = await sql<{ email: string | null; name: string | null }>`
    select email, name from "user" where id = ${userId} limit 1
  `;
  return { email: rows[0]?.email ?? null, name: rows[0]?.name ?? null };
}

export async function ensureProfile(sql: Sql, userId: string): Promise<Access> {
  const authUser = await loadAuthUser(sql, userId);
  const existing = await sql<{
    user_id: string;
    email: string | null;
    display_name: string | null;
    role: string;
    status: string;
    god_expires_at: string | null;
    department: string | null;
  }>`
    select user_id, email, display_name, role, status, god_expires_at::text as god_expires_at, department
    from profiles where user_id = ${userId} limit 1
  `;

  if (existing.length === 0) {
    await sql`
      insert into profiles (user_id, email, display_name, role, last_seen_at)
      values (${userId}, ${authUser.email}, ${authUser.name}, ${"customer"}, now())
    `;
  } else {
    await sql`
      update profiles
      set last_seen_at = now(),
          email = coalesce(${authUser.email}, email),
          display_name = coalesce(${authUser.name}, display_name)
      where user_id = ${userId}
    `;
  }

  const throne = await sql<{ user_id: string }>`
    select user_id from profiles where role = 'throne' and status = 'active' limit 1
  `;
  const email = (authUser.email ?? existing[0]?.email ?? "").toLowerCase();
  const isFounder = email === "anselm@trillionaitech.com";
  if (isFounder || throne.length === 0) {
    await sql`
      update profiles
      set role = 'throne', department = coalesce(department, 'Command'), status = 'active'
      where user_id = ${userId}
    `;
  }

  const row = await sql<{
    user_id: string;
    email: string | null;
    display_name: string | null;
    role: string;
    status: string;
    god_expires_at: string | null;
    department: string | null;
  }>`
    select user_id, email, display_name, role, status, god_expires_at::text as god_expires_at, department
    from profiles where user_id = ${userId} limit 1
  `;
  const p = row[0];
  if (!p) {
    return { ...GUEST_ACCESS, userId };
  }

  if (
    p.role.startsWith("god_") &&
    p.god_expires_at &&
    new Date(p.god_expires_at).getTime() < Date.now()
  ) {
    await sql`
      update profiles set role = 'customer', god_expires_at = null, god_tier = null
      where user_id = ${userId}
    `;
    await writeAudit(sql, {
      actorId: userId,
      actorEmail: p.email,
      action: "god.expired",
      targetType: "profile",
      targetId: userId,
      detail: "Time-limited God Code access expired.",
    });
    return {
      userId,
      email: p.email,
      displayName: p.display_name,
      role: "customer",
      status: p.status,
      godExpiresAt: null,
      department: p.department,
    };
  }

  return {
    userId,
    email: p.email,
    displayName: p.display_name,
    role: p.role as Role,
    status: p.status,
    godExpiresAt: p.god_expires_at,
    department: p.department,
  };
}

export function assertPerm(access: Access, perm: Perm): void {
  if (access.status !== "active") {
    throw new Error("Account is suspended");
  }
  if (!access.userId || !hasPerm(access.role, perm)) {
    throw new Error("Forbidden");
  }
}

export function assertMutate(access: Access): void {
  if (access.status !== "active") throw new Error("Account is suspended");
  if (access.role === "view_only" || access.role === "god_limited") {
    throw new Error("This pass is view-only");
  }
}

export async function staffAccess(userId: string, perm: Perm): Promise<{ sql: Sql; access: Access }> {
  const sql = await getSql();
  await ensureSeed(sql);
  await escalateStaleAlerts(sql);
  const access = await ensureProfile(sql, userId);
  assertPerm(access, perm);
  return { sql, access };
}
