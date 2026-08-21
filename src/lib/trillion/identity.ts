import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  ensureProfile,
  ensureSeed,
  raiseSentinel,
  staffAccess,
  writeAudit,
} from "./bootstrap";
import { GUEST_ACCESS, STAFF_ASSIGNABLE, type Role } from "./roles";
import type { Access, StaffProfile } from "./types";

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Access> => {
    const sql = await getSql();
    await ensureSeed(sql);
    return ensureProfile(sql, context.userId);
  });

export const listStaff = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<StaffProfile[]> => {
    const { sql } = await staffAccess(context.userId, "enterDesk");
    const rows = await sql<{
      user_id: string;
      email: string | null;
      display_name: string | null;
      role: string;
      department: string | null;
      status: string;
      created_at: string;
      last_seen_at: string | null;
    }>`
      select user_id, email, display_name, role, department, status,
             created_at::text as created_at, last_seen_at::text as last_seen_at
      from profiles
      where role <> 'customer'
      order by role, display_name
    `;
    return rows.map((r) => ({
      userId: r.user_id,
      email: r.email,
      displayName: r.display_name,
      role: r.role as Role,
      department: r.department,
      status: r.status,
      createdAt: r.created_at,
      lastSeenAt: r.last_seen_at,
    }));
  });

export const listPeople = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await staffAccess(context.userId, "manageUsers");
    const rows = await sql<{
      id: string;
      name: string | null;
      email: string | null;
      created_at: string;
      role: string | null;
      status: string | null;
    }>`
      select u.id, u.name, u.email, u.created_at::text as created_at,
             p.role, p.status
      from "user" u
      left join profiles p on p.user_id = u.id
      order by u.created_at desc
      limit 200
    `;
    return rows.map((r) => ({
      userId: r.id,
      name: r.name,
      email: r.email,
      createdAt: r.created_at,
      role: (r.role as Role) ?? "customer",
      status: r.status ?? "active",
    }));
  });

export const setStaffRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { userId: string; role: Role; department?: string; status?: string }) => input)
  .handler(async ({ context, data }) => {
    const { sql, access } = await staffAccess(context.userId, "manageStaff");
    if (data.role === "throne" && data.userId !== access.userId) {
      throw new Error("Throne cannot be assigned from Staff Management");
    }
    if (data.userId === access.userId && data.role !== "throne") {
      throw new Error("You cannot demote your own Throne seat");
    }
    const authUser = await sql<{ email: string | null; name: string | null }>`
      select email, name from "user" where id = ${data.userId} limit 1
    `;
    await sql`
      insert into profiles (user_id, email, display_name, role, department, status, last_seen_at)
      values (
        ${data.userId}, ${authUser[0]?.email ?? null}, ${authUser[0]?.name ?? null},
        ${data.role}, ${data.department ?? null}, ${data.status ?? "active"}, now()
      )
      on conflict (user_id) do update set
        role = excluded.role,
        department = excluded.department,
        status = excluded.status
    `;
    const logId = await writeAudit(sql, {
      actorId: access.userId,
      actorEmail: access.email,
      action: "staff.role",
      targetType: "profile",
      targetId: data.userId,
      detail: `${data.role} / ${data.status ?? "active"}`,
    });
    await raiseSentinel(sql, {
      severity: data.role === "security" ? "info" : "warning",
      title: "Staff role changed",
      detail: `${access.email ?? "Throne"} set ${authUser[0]?.email ?? data.userId} to ${data.role}.`,
      source: "staff_action",
      relatedLogId: logId,
    });
  });

export const lookupUser = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((query: string) => query.trim())
  .handler(async ({ context, data: query }) => {
    const { sql } = await staffAccess(context.userId, "supportLookup");
    if (!query) return [];
    const like = `%${query.toLowerCase()}%`;
    const people = await sql<{
      id: string;
      name: string | null;
      email: string | null;
      role: string | null;
      status: string | null;
    }>`
      select u.id, u.name, u.email, p.role, p.status
      from "user" u
      left join profiles p on p.user_id = u.id
      where lower(coalesce(u.email, '')) like ${like}
         or lower(coalesce(u.name, '')) like ${like}
      limit 20
    `;
    const results = [];
    for (const person of people) {
      const orders = await sql<{
        id: number;
        amount_cents: number;
        status: string;
        created_at: string;
        name: string;
      }>`
        select o.id, o.amount_cents, o.status, o.created_at::text as created_at, p.name
        from orders o join products p on p.id = o.product_id
        where o.user_id = ${person.id}
        order by o.created_at desc
        limit 20
      `;
      const subs = await sql<{
        id: number;
        status: string;
        current_period_end: string | null;
        name: string;
      }>`
        select s.id, s.status, s.current_period_end::text as current_period_end, p.name
        from subscriptions s join products p on p.id = s.product_id
        where s.user_id = ${person.id}
        order by s.created_at desc
      `;
      const usage = await sql<{ event_type: string; n: number }>`
        select event_type, count(*)::int as n
        from usage_events where user_id = ${person.id}
        group by event_type
      `;
      const tickets = await sql<{ id: number; subject: string; status: string; created_at: string }>`
        select id, subject, status, created_at::text as created_at
        from tickets where user_id = ${person.id}
        order by created_at desc limit 20
      `;
      results.push({
        userId: person.id,
        name: person.name,
        email: person.email,
        role: person.role ?? "customer",
        status: person.status ?? "active",
        orders: orders.map((o) => ({
          id: o.id,
          amountCents: o.amount_cents,
          status: o.status,
          createdAt: o.created_at,
          productName: o.name,
        })),
        subscriptions: subs.map((s) => ({
          id: s.id,
          status: s.status,
          currentPeriodEnd: s.current_period_end,
          productName: s.name,
        })),
        usage: usage.map((u) => ({ eventType: u.event_type, count: u.n })),
        tickets: tickets.map((t) => ({
          id: t.id,
          subject: t.subject,
          status: t.status,
          createdAt: t.created_at,
        })),
      });
    }
    return results;
  });

export { GUEST_ACCESS, STAFF_ASSIGNABLE };
