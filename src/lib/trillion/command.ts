import { createHash, randomBytes } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  assertMutate,
  ensureProfile,
  raiseSentinel,
  staffAccess,
  writeAudit,
} from "./bootstrap";
import type {
  ArchitectTask,
  AuditLog,
  Campaign,
  GodCode,
  Incident,
  SentinelAlert,
  Ticket,
} from "./types";

function hashCode(raw: string): string {
  return createHash("sha256").update(raw.trim().toUpperCase()).digest("hex");
}

export const empireOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await staffAccess(context.userId, "enterDesk");
    const products = await sql<{ n: number }>`select count(*)::int as n from products`;
    const people = await sql<{ n: number }>`select count(*)::int as n from "user"`;
    const staff = await sql<{ n: number }>`select count(*)::int as n from profiles where role <> 'customer'`;
    const orders = await sql<{ n: number; revenue: number }>`
      select count(*)::int as n, coalesce(sum(amount_cents),0)::int as revenue
      from orders where status = 'paid'
    `;
    const openTickets = await sql<{ n: number }>`select count(*)::int as n from tickets where status in ('open','pending')`;
    const alerts = await sql<{ n: number }>`select count(*)::int as n from sentinel_alerts where status in ('open','escalated')`;
    const architect = await sql<{ enabled: boolean }>`select enabled from architect_state where id = 1`;
    const incidents = await sql<{ n: number }>`select count(*)::int as n from incidents where status = 'open'`;
    const recentAudit = await sql<{
      id: number;
      actor_id: string | null;
      actor_email: string | null;
      action: string;
      target_type: string | null;
      target_id: string | null;
      detail: string | null;
      created_at: string;
    }>`
      select id, actor_id, actor_email, action, target_type, target_id, detail, created_at::text as created_at
      from audit_logs order by id desc limit 8
    `;
    const revenueByDay = await sql<{ day: string; cents: number }>`
      select to_char(created_at, 'YYYY-MM-DD') as day, coalesce(sum(amount_cents),0)::int as cents
      from orders where status = 'paid' and created_at > now() - interval '14 days'
      group by 1 order by 1
    `;
    const views14 = await sql<{ n: number }>`
      select count(*)::int as n from usage_events
      where event_type = 'product_view' and created_at > now() - interval '14 days'
    `;
    const viewsByDay = await sql<{ day: string; views: number }>`
      select to_char(created_at, 'YYYY-MM-DD') as day, count(*)::int as views
      from usage_events
      where event_type = 'product_view' and created_at > now() - interval '14 days'
      group by 1 order by 1
    `;
    const viewsByProduct = await sql<{ name: string; slug: string; views: number }>`
      select p.name, p.slug, count(*)::int as views
      from usage_events u
      join products p on p.id = u.product_id
      where u.event_type = 'product_view' and u.created_at > now() - interval '14 days'
      group by p.id, p.name, p.slug
      order by views desc
      limit 12
    `;
    const recentOrders = await sql<{
      id: number;
      product_name: string;
      amount_cents: number;
      status: string;
      created_at: string;
    }>`
      select o.id, coalesce(p.name, 'Unknown') as product_name, o.amount_cents, o.status,
             o.created_at::text as created_at
      from orders o
      left join products p on p.id = o.product_id
      order by o.id desc
      limit 20
    `;
    return {
      products: products[0]?.n ?? 0,
      people: people[0]?.n ?? 0,
      staff: staff[0]?.n ?? 0,
      orders: orders[0]?.n ?? 0,
      revenueCents: orders[0]?.revenue ?? 0,
      openTickets: openTickets[0]?.n ?? 0,
      openAlerts: alerts[0]?.n ?? 0,
      openIncidents: incidents[0]?.n ?? 0,
      architectOn: Boolean(architect[0]?.enabled),
      recentAudit: recentAudit.map(mapAudit),
      revenueByDay,
      catalogViews14: views14[0]?.n ?? 0,
      viewsByDay,
      viewsByProduct,
      recentOrders: recentOrders.map((r) => ({
        id: r.id,
        productName: r.product_name,
        amountCents: r.amount_cents,
        status: r.status,
        createdAt: r.created_at,
      })),
    };
  });

function mapAudit(r: {
  id: number;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  detail: string | null;
  created_at: string;
}): AuditLog {
  return {
    id: r.id,
    actorId: r.actor_id,
    actorEmail: r.actor_email,
    action: r.action,
    targetType: r.target_type,
    targetId: r.target_id,
    detail: r.detail,
    createdAt: r.created_at,
  };
}

export const listAudit = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AuditLog[]> => {
    const { sql } = await staffAccess(context.userId, "viewAudit");
    const rows = await sql<{
      id: number;
      actor_id: string | null;
      actor_email: string | null;
      action: string;
      target_type: string | null;
      target_id: string | null;
      detail: string | null;
      created_at: string;
    }>`
      select id, actor_id, actor_email, action, target_type, target_id, detail, created_at::text as created_at
      from audit_logs order by id desc limit 300
    `;
    return rows.map(mapAudit);
  });

export const listAlerts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<SentinelAlert[]> => {
    const { sql } = await staffAccess(context.userId, "enterWatch");
    const rows = await sql<{
      id: number;
      severity: string;
      title: string;
      detail: string;
      source: string;
      status: string;
      created_at: string;
      acknowledged_at: string | null;
      escalated_at: string | null;
    }>`
      select id, severity, title, detail, source, status,
             created_at::text as created_at,
             acknowledged_at::text as acknowledged_at,
             escalated_at::text as escalated_at
      from sentinel_alerts order by
        case when status = 'escalated' then 0 when status = 'open' then 1 else 2 end,
        id desc
      limit 200
    `;
    return rows.map((r) => ({
      id: r.id,
      severity: r.severity,
      title: r.title,
      detail: r.detail,
      source: r.source,
      status: r.status,
      createdAt: r.created_at,
      acknowledgedAt: r.acknowledged_at,
      escalatedAt: r.escalated_at,
    }));
  });

export const updateAlert = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; status: "acknowledged" | "resolved" }) => input)
  .handler(async ({ context, data }) => {
    const { sql, access } = await staffAccess(context.userId, "sentinelManage");
    assertMutate(access);
    if (data.status === "acknowledged") {
      await sql`
        update sentinel_alerts
        set status = 'acknowledged', acknowledged_at = now(), acknowledged_by = ${access.userId}
        where id = ${data.id} and status in ('open','escalated')
      `;
    } else {
      await sql`
        update sentinel_alerts set status = 'resolved', resolved_at = now()
        where id = ${data.id}
      `;
    }
    await writeAudit(sql, {
      actorId: access.userId,
      actorEmail: access.email,
      action: `sentinel.${data.status}`,
      targetType: "alert",
      targetId: String(data.id),
    });
  });

export const generateGodCode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      tier: "limited" | "medium" | "full" | "life";
      hours: number | null;
      note: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const { sql, access } = await staffAccess(context.userId, "godCodes");
    const raw = `TRL-${randomBytes(3).toString("hex").toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
    const hash = hashCode(raw);
    const prefix = raw.slice(0, 7);
    const expires =
      data.tier === "life" || data.hours == null
        ? null
        : new Date(Date.now() + data.hours * 3600 * 1000).toISOString();
    await sql`
      insert into god_codes (code_hash, code_prefix, tier, expires_at, created_by, note)
      values (${hash}, ${prefix}, ${data.tier}, ${expires}, ${access.userId}, ${data.note || null})
    `;
    await writeAudit(sql, {
      actorId: access.userId,
      actorEmail: access.email,
      action: "god.create",
      targetType: "god_code",
      targetId: prefix,
      detail: `${data.tier}${expires ? "" : " · life"}`,
    });
    return { code: raw, prefix, tier: data.tier, expiresAt: expires };
  });

export const listGodCodes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<GodCode[]> => {
    const { sql } = await staffAccess(context.userId, "godCodes");
    const rows = await sql<{
      id: number;
      code_prefix: string;
      tier: string;
      expires_at: string | null;
      max_uses: number;
      used_count: number;
      note: string | null;
      created_at: string;
      last_redeemed_by: string | null;
    }>`
      select id, code_prefix, tier, expires_at::text as expires_at, max_uses, used_count,
             note, created_at::text as created_at, last_redeemed_by
      from god_codes order by id desc
    `;
    return rows.map((r) => ({
      id: r.id,
      codePrefix: r.code_prefix,
      tier: r.tier,
      expiresAt: r.expires_at,
      maxUses: r.max_uses,
      usedCount: r.used_count,
      note: r.note,
      createdAt: r.created_at,
      lastRedeemedBy: r.last_redeemed_by,
    }));
  });

export const redeemGodCode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((code: string) => code)
  .handler(async ({ context, data: code }) => {
    const sql = await getSql();
    const access = await ensureProfile(sql, context.userId);
    const hash = hashCode(code);
    const rows = await sql<{
      id: number;
      tier: string;
      expires_at: string | null;
      max_uses: number;
      used_count: number;
    }>`
      select id, tier, expires_at::text as expires_at, max_uses, used_count
      from god_codes where code_hash = ${hash} limit 1
    `;
    const row = rows[0];
    if (!row) throw new Error("That code is not valid");
    if (row.used_count >= row.max_uses) throw new Error("That code has already been used");
    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
      throw new Error("That code has expired");
    }
    const role =
      row.tier === "limited"
        ? "god_limited"
        : row.tier === "medium"
          ? "god_medium"
          : "god_full";
    const godExpires = row.tier === "life" ? null : row.expires_at;
    await sql`
      update god_codes
      set used_count = used_count + 1,
          last_redeemed_by = ${context.userId},
          last_redeemed_at = now()
      where id = ${row.id}
    `;
    await sql`
      update profiles
      set role = ${role}, god_tier = ${row.tier}, god_expires_at = ${godExpires}
      where user_id = ${context.userId} and role <> 'throne'
    `;
    await writeAudit(sql, {
      actorId: context.userId,
      actorEmail: access.email,
      action: "god.redeem",
      targetType: "god_code",
      targetId: String(row.id),
      detail: row.tier,
    });
    return { role, tier: row.tier };
  });

export const architectStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await staffAccess(context.userId, "enterThrone");
    const state = await sql<{ enabled: boolean; updated_at: string; updated_by: string | null }>`
      select enabled, updated_at::text as updated_at, updated_by from architect_state where id = 1
    `;
    const tasks = await sql<{
      id: number;
      title: string;
      description: string;
      proposed_action: string;
      status: string;
      decision_note: string | null;
      created_at: string;
      decided_at: string | null;
      executed_at: string | null;
    }>`
      select id, title, description, proposed_action, status, decision_note,
             created_at::text as created_at, decided_at::text as decided_at, executed_at::text as executed_at
      from architect_tasks order by id desc limit 50
    `;
    const mapped: ArchitectTask[] = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      proposedAction: t.proposed_action,
      status: t.status,
      decisionNote: t.decision_note,
      createdAt: t.created_at,
      decidedAt: t.decided_at,
      executedAt: t.executed_at,
    }));
    return {
      enabled: Boolean(state[0]?.enabled),
      updatedAt: state[0]?.updated_at ?? null,
      tasks: mapped,
    };
  });

export const setArchitect = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((enabled: boolean) => enabled)
  .handler(async ({ context, data: enabled }) => {
    const { sql, access } = await staffAccess(context.userId, "architect");
    await sql`
      update architect_state set enabled = ${enabled}, updated_by = ${access.userId}, updated_at = now()
      where id = 1
    `;
    await writeAudit(sql, {
      actorId: access.userId,
      actorEmail: access.email,
      action: enabled ? "architect.on" : "architect.off",
      targetType: "architect",
      targetId: "1",
    });
    await raiseSentinel(sql, {
      severity: enabled ? "warning" : "info",
      title: enabled ? "Architect armed" : "Architect stood down",
      detail: `${access.email ?? "Throne"} ${enabled ? "enabled" : "disabled"} Architect. It will propose, never execute, until approved.`,
      source: "staff_action",
    });
  });

export const decideArchitectTask = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      id: number;
      decision: "approved" | "rejected" | "modified";
      note: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const { sql, access } = await staffAccess(context.userId, "architect");
    const status = data.decision === "approved" ? "approved" : data.decision === "rejected" ? "rejected" : "modified";
    await sql`
      update architect_tasks
      set status = ${status}, decision_note = ${data.note || null}, decided_at = now()
      where id = ${data.id} and status = 'pending'
    `;
    if (data.decision === "approved") {
      await sql`
        update architect_tasks set status = 'executed', executed_at = now()
        where id = ${data.id}
      `;
    }
    await writeAudit(sql, {
      actorId: access.userId,
      actorEmail: access.email,
      action: `architect.${data.decision}`,
      targetType: "architect_task",
      targetId: String(data.id),
      detail: data.note || data.decision,
    });
  });

export const proposeArchitect = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((prompt: string) => prompt)
  .handler(async ({ context, data: prompt }) => {
    const { sql, access } = await staffAccess(context.userId, "architect");
    const state = await sql<{ enabled: boolean }>`select enabled from architect_state where id = 1`;
    if (!state[0]?.enabled) throw new Error("Architect is stood down. Arm it first.");
    const apiKey = process.env.XAI_API_KEY;
    let title = prompt.trim().slice(0, 80) || "Standing review";
    let description =
      "Architect requests permission to inspect the latest audit trail and open alerts, then file a written brief. No mutations until you approve.";
    let proposedAction =
      JSON.stringify({ type: "brief", scope: "audit+sentinel" }, null, 2);
    if (apiKey && prompt.trim()) {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 500,
          messages: [
            {
              role: "system",
              content:
                "You are Architect, the personal operator for Anselm Perkins, CEO of Trillion AI. You MUST ask permission. Never claim you already acted. Reply as compact JSON {title, description, proposed_action} describing ONE proposed action. No markdown.",
            },
            { role: "user", content: prompt.slice(0, 1200) },
          ],
        }),
      });
      if (res.ok) {
        const body = (await res.json()) as { choices: { message: { content: string } }[] };
        const text = body.choices[0]?.message.content ?? "";
        try {
          const json = JSON.parse(text.replace(/```json|```/g, "").trim()) as {
            title?: string;
            description?: string;
            proposed_action?: string;
          };
          title = json.title ?? title;
          description = json.description ?? description;
          proposedAction =
            typeof json.proposed_action === "string"
              ? json.proposed_action
              : JSON.stringify(json.proposed_action ?? proposedAction);
        } catch {
          description = text.slice(0, 800) || description;
        }
      }
    }
    const rows = await sql<{ id: number }>`
      insert into architect_tasks (title, description, proposed_action, status)
      values (${title}, ${description}, ${proposedAction}, 'pending')
      returning id
    `;
    await writeAudit(sql, {
      actorId: access.userId,
      actorEmail: access.email,
      action: "architect.propose",
      targetType: "architect_task",
      targetId: String(rows[0]!.id),
      detail: title,
    });
    return { id: rows[0]!.id };
  });

export const analyzeAlert = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => id)
  .handler(async ({ context, data: id }) => {
    const { sql } = await staffAccess(context.userId, "sentinelManage");
    const alert = await sql<{ title: string; detail: string; severity: string; source: string }>`
      select title, detail, severity, source from sentinel_alerts where id = ${id} limit 1
    `;
    const a = alert[0];
    if (!a) throw new Error("Alert not found");
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return {
        text: "Sentinel analysis is unavailable in this environment. Treat the alert as written and acknowledge or escalate.",
      };
    }
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content:
              "You are Trillion Sentinel. Assess staff/security conduct. Be specific, calm, and operational. 3 short paragraphs max.",
          },
          {
            role: "user",
            content: `Severity ${a.severity}. Source ${a.source}. ${a.title}. ${a.detail}`,
          },
        ],
      }),
    });
    if (!res.ok) return { text: `Sentinel could not reach the model (${res.status}).` };
    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    return { text: body.choices[0]?.message.content ?? "" };
  });

export const listIncidents = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Incident[]> => {
    const { sql } = await staffAccess(context.userId, "enterWatch");
    const rows = await sql<{
      id: number;
      title: string;
      severity: string;
      status: string;
      summary: string;
      created_by: string | null;
      created_at: string;
      resolved_at: string | null;
    }>`
      select id, title, severity, status, summary, created_by,
             created_at::text as created_at, resolved_at::text as resolved_at
      from incidents order by id desc
    `;
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      severity: r.severity,
      status: r.status,
      summary: r.summary,
      createdBy: r.created_by,
      createdAt: r.created_at,
      resolvedAt: r.resolved_at,
    }));
  });

export const saveIncident = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title: string; severity: string; summary: string }) => input)
  .handler(async ({ context, data }) => {
    const { sql, access } = await staffAccess(context.userId, "manageIncidents");
    assertMutate(access);
    const title = data.title.trim();
    if (!title) throw new Error("Title is required");
    await sql`
      insert into incidents (title, severity, summary, created_by)
      values (${title}, ${data.severity}, ${data.summary}, ${access.userId})
    `;
    await writeAudit(sql, {
      actorId: access.userId,
      actorEmail: access.email,
      action: "incident.open",
      targetType: "incident",
      detail: title,
    });
  });

export const resolveIncident = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => id)
  .handler(async ({ context, data: id }) => {
    const { sql, access } = await staffAccess(context.userId, "manageIncidents");
    await sql`update incidents set status = 'resolved', resolved_at = now() where id = ${id}`;
    await writeAudit(sql, {
      actorId: access.userId,
      actorEmail: access.email,
      action: "incident.resolve",
      targetType: "incident",
      targetId: String(id),
    });
  });

export const listTickets = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Ticket[]> => {
    const { sql } = await staffAccess(context.userId, "tickets");
    const rows = await sql<{
      id: number;
      user_id: string;
      subject: string;
      body: string;
      status: string;
      priority: string;
      assigned_to: string | null;
      created_at: string;
      updated_at: string;
      email: string | null;
    }>`
      select t.id, t.user_id, t.subject, t.body, t.status, t.priority, t.assigned_to,
             t.created_at::text as created_at, t.updated_at::text as updated_at, p.email
      from tickets t
      left join profiles p on p.user_id = t.user_id
      order by
        case t.status when 'open' then 0 when 'pending' then 1 else 2 end,
        t.id desc
    `;
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      subject: r.subject,
      body: r.body,
      status: r.status,
      priority: r.priority,
      assignedTo: r.assigned_to,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      requesterEmail: r.email,
    }));
  });

export const setTicketStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; status: string }) => input)
  .handler(async ({ context, data }) => {
    const { sql, access } = await staffAccess(context.userId, "tickets");
    assertMutate(access);
    await sql`
      update tickets set status = ${data.status}, updated_at = now(), assigned_to = ${access.userId}
      where id = ${data.id}
    `;
  });

export const runScanner = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await staffAccess(context.userId, "enterWatch");
    const critical = await sql<{ n: number }>`
      select count(*)::int as n from sentinel_alerts where status in ('open','escalated') and severity = 'critical'
    `;
    const staleInc = await sql<{ n: number }>`
      select count(*)::int as n from incidents where status = 'open'
    `;
    const drafts = await sql<{ n: number }>`select count(*)::int as n from products where status = 'draft'`;
    const securityStaff = await sql<{ n: number }>`
      select count(*)::int as n from profiles where role = 'security' and status = 'active'
    `;
    const architect = await sql<{ enabled: boolean }>`select enabled from architect_state where id = 1`;
    const pendingTasks = await sql<{ n: number }>`
      select count(*)::int as n from architect_tasks where status = 'pending'
    `;
    const unread = await sql<{ n: number }>`
      select count(*)::int as n from contact_messages where read_at is null
    `;
    const findings = [
      {
        id: "critical-alerts",
        ok: (critical[0]?.n ?? 0) === 0,
        title: "Critical Sentinel alerts",
        detail:
          (critical[0]?.n ?? 0) === 0
            ? "No open critical alerts."
            : `${critical[0]!.n} critical alert(s) still open or escalated.`,
      },
      {
        id: "incidents",
        ok: (staleInc[0]?.n ?? 0) === 0,
        title: "Open incidents",
        detail:
          (staleInc[0]?.n ?? 0) === 0
            ? "Incident queue is clear."
            : `${staleInc[0]!.n} incident(s) remain open.`,
      },
      {
        id: "watch-staff",
        ok: (securityStaff[0]?.n ?? 0) > 0,
        title: "Watch coverage",
        detail:
          (securityStaff[0]?.n ?? 0) > 0
            ? `${securityStaff[0]!.n} active security officer(s).`
            : "No active Security seat. Throne is covering Watch.",
      },
      {
        id: "architect",
        ok: !architect[0]?.enabled || (pendingTasks[0]?.n ?? 0) === 0,
        title: "Architect queue",
        detail: architect[0]?.enabled
          ? `${pendingTasks[0]?.n ?? 0} pending approval(s). Architect cannot act until Throne decides.`
          : "Architect is stood down.",
      },
      {
        id: "drafts",
        ok: true,
        title: "Catalog drafts",
        detail: `${drafts[0]?.n ?? 0} draft product(s) unpublished.`,
      },
      {
        id: "inbox",
        ok: (unread[0]?.n ?? 0) < 20,
        title: "Public inbox",
        detail: `${unread[0]?.n ?? 0} unread contact message(s).`,
      },
    ];
    return { findings, scannedAt: new Date().toISOString() };
  });

export const exportSnapshot = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, access } = await staffAccess(context.userId, "recovery");
    const products = await sql<{
      slug: string;
      name: string;
      tagline: string;
      description: string;
      category: string;
      price_cents: number | null;
      billing: string;
      features: string;
      vanta_ready: boolean;
      featured: boolean;
      status: string;
    }>`select slug, name, tagline, description, category, price_cents, billing, features, vanta_ready, featured, status from products`;
    const staff = await sql<{
      user_id: string;
      email: string | null;
      role: string;
      department: string | null;
      status: string;
    }>`select user_id, email, role, department, status from profiles where role <> 'customer'`;
    const architect = await sql<{ enabled: boolean }>`select enabled from architect_state where id = 1`;
    await writeAudit(sql, {
      actorId: access.userId,
      actorEmail: access.email,
      action: "recovery.export",
      targetType: "snapshot",
    });
    return {
      exportedAt: new Date().toISOString(),
      payload: JSON.stringify(
        {
          products,
          staff,
          architectOn: Boolean(architect[0]?.enabled),
        },
        null,
        2,
      ),
    };
  });

export const listCampaigns = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Campaign[]> => {
    const { sql } = await staffAccess(context.userId, "marketing");
    const rows = await sql<{
      id: number;
      title: string;
      channel: string;
      status: string;
      body: string;
      created_at: string;
    }>`
      select id, title, channel, status, body, created_at::text as created_at
      from campaigns order by id desc
    `;
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      channel: r.channel,
      status: r.status,
      body: r.body,
      createdAt: r.created_at,
    }));
  });

export const saveCampaign = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title: string; channel: string; body: string; status: string }) => input)
  .handler(async ({ context, data }) => {
    const { sql, access } = await staffAccess(context.userId, "marketing");
    assertMutate(access);
    const title = data.title.trim();
    if (!title) throw new Error("Title is required");
    await sql`
      insert into campaigns (title, channel, body, status, created_by)
      values (${title}, ${data.channel}, ${data.body}, ${data.status}, ${access.userId})
    `;
  });

export const listContact = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await staffAccess(context.userId, "compliance");
    const rows = await sql<{
      id: number;
      name: string;
      email: string;
      topic: string;
      message: string;
      created_at: string;
      read_at: string | null;
    }>`
      select id, name, email, topic, message, created_at::text as created_at, read_at::text as read_at
      from contact_messages order by id desc limit 100
    `;
    return rows;
  });

export const staffActivity = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql } = await staffAccess(context.userId, "enterWatch");
    const rows = await sql<{
      actor_id: string | null;
      actor_email: string | null;
      n: number;
      last_at: string;
    }>`
      select actor_id, actor_email, count(*)::int as n, max(created_at)::text as last_at
      from audit_logs
      where actor_id is not null and created_at > now() - interval '7 days'
      group by actor_id, actor_email
      order by n desc
    `;
    return rows.map((r) => ({
      actorId: r.actor_id,
      actorEmail: r.actor_email,
      actions: r.n,
      lastAt: r.last_at,
    }));
  });
