import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { ensureSeed, mapProduct, staffAccess, writeAudit } from "./bootstrap";
import { slugify } from "./format";
import type { Product } from "./types";

export const listProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<Product[]> => {
    const sql = await getSql();
    await ensureSeed(sql);
    const rows = await sql`
      select id, slug, name, tagline, description, category, price_cents, billing,
             billing_interval, demo_url, video_url, features, vanta_ready, featured,
             status, created_by, created_at::text as created_at, updated_at::text as updated_at
      from products
      where status = 'published'
      order by featured desc, name asc
    `;
    return rows.map(mapProduct);
  },
);

export const getProduct = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<Product | null> => {
    const sql = await getSql();
    await ensureSeed(sql);
    const rows = await sql`
      select id, slug, name, tagline, description, category, price_cents, billing,
             billing_interval, demo_url, video_url, features, vanta_ready, featured,
             status, created_by, created_at::text as created_at, updated_at::text as updated_at
      from products where slug = ${slug} limit 1
    `;
    const product = rows[0] ? mapProduct(rows[0]) : null;
    if (product && product.status === "published") {
      await sql`
        insert into usage_events (event_type, product_id)
        values ('product_view', ${product.id})
      `;
    }
    return product && product.status !== "archived" ? product : null;
  });

export const listAllProducts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Product[]> => {
    const { sql } = await staffAccess(context.userId, "enterDesk");
    const rows = await sql`
      select id, slug, name, tagline, description, category, price_cents, billing,
             billing_interval, demo_url, video_url, features, vanta_ready, featured,
             status, created_by, created_at::text as created_at, updated_at::text as updated_at
      from products
      order by updated_at desc
    `;
    return rows.map(mapProduct);
  });

export type ProductInput = {
  id?: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  priceCents: number | null;
  billing: string;
  features: string;
  vantaReady: boolean;
  featured: boolean;
  status: string;
  demoUrl?: string | null;
  videoUrl?: string | null;
};

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: ProductInput) => input)
  .handler(async ({ context, data }) => {
    const { sql, access } = await staffAccess(context.userId, "manageProducts");
    const slug = slugify(data.slug || data.name);
    if (!data.name.trim() || !slug) throw new Error("Name is required");
    const billing = data.billing === "free" ? "free" : "one_time";
    const priceCents = billing === "free" ? 0 : data.priceCents;
    if (data.id) {
      await sql`
        update products set
          slug = ${slug},
          name = ${data.name.trim()},
          tagline = ${data.tagline},
          description = ${data.description},
          category = ${data.category},
          price_cents = ${priceCents},
          billing = ${billing},
          features = ${data.features},
          vanta_ready = ${data.vantaReady},
          featured = ${data.featured},
          status = ${data.status},
          demo_url = ${data.demoUrl ?? null},
          video_url = ${data.videoUrl ?? null},
          updated_at = now()
        where id = ${data.id}
      `;
      await writeAudit(sql, {
        actorId: access.userId,
        actorEmail: access.email,
        action: "product.update",
        targetType: "product",
        targetId: String(data.id),
        detail: data.name,
      });
      return { id: data.id, slug };
    }
    const inserted = await sql<{ id: number }>`
      insert into products (
        slug, name, tagline, description, category, price_cents, billing,
        features, vanta_ready, featured, status, demo_url, video_url, created_by
      ) values (
        ${slug}, ${data.name.trim()}, ${data.tagline}, ${data.description},
        ${data.category}, ${priceCents}, ${billing}, ${data.features},
        ${data.vantaReady}, ${data.featured}, ${data.status},
        ${data.demoUrl ?? null}, ${data.videoUrl ?? null}, ${access.userId}
      )
      returning id
    `;
    const id = inserted[0]!.id;
    await writeAudit(sql, {
      actorId: access.userId,
      actorEmail: access.email,
      action: "product.create",
      targetType: "product",
      targetId: String(id),
      detail: data.name,
    });
    return { id, slug };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => id)
  .handler(async ({ context, data: id }) => {
    const { sql, access } = await staffAccess(context.userId, "manageProducts");
    const existing = await sql<{ name: string }>`select name from products where id = ${id}`;
    await sql`delete from products where id = ${id}`;
    const logId = await writeAudit(sql, {
      actorId: access.userId,
      actorEmail: access.email,
      action: "product.delete",
      targetType: "product",
      targetId: String(id),
      detail: existing[0]?.name ?? String(id),
    });
    const recent = await sql<{ n: number }>`
      select count(*)::int as n from audit_logs
      where action = 'product.delete'
        and actor_id = ${access.userId}
        and created_at > now() - interval '10 minutes'
    `;
    if ((recent[0]?.n ?? 0) >= 3) {
      const { raiseSentinel } = await import("./bootstrap");
      await raiseSentinel(sql, {
        severity: "warning",
        title: "Rapid product deletion",
        detail: `${access.email ?? "Staff"} removed ${recent[0]!.n} catalog items in 10 minutes.`,
        source: "staff_action",
        relatedLogId: logId,
      });
    }
  });

export const submitContact = createServerFn({ method: "POST" })
  .validator((input: { name: string; email: string; topic: string; message: string }) => input)
  .handler(async ({ data }) => {
    const name = data.name.trim();
    const email = data.email.trim();
    const message = data.message.trim();
    if (!name || !email || !message) throw new Error("Please complete every field");
    const sql = await getSql();
    await sql`
      insert into contact_messages (name, email, topic, message)
      values (${name}, ${email}, ${data.topic || "general"}, ${message})
    `;
    return { ok: true as const };
  });
