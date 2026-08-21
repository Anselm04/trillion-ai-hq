import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { COMPANY } from "@/lib/trillion/company";

const STATIC = [
  "/",
  "/market",
  "/apps",
  "/games",
  "/agents",
  "/tools",
  "/software",
  "/about",
  "/team",
  "/contact",
  "/pricing",
  "/privacy",
  "/terms",
];

function xmlEscape(value: string) {
  return value.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const origin = COMPANY.siteUrl.replace(/\/+$/, "");
        let productRows: { slug: string; updated_at: string }[] = [];
        try {
          const sql = await getSql();
          productRows = await sql<{ slug: string; updated_at: string }>`
            select slug, updated_at::text as updated_at
            from products where status = 'published'
            order by updated_at desc
          `;
        } catch {
          productRows = [];
        }
        const urls = [
          ...STATIC.map((path) => ({ loc: `${origin}${path === "/" ? "" : path}`, lastmod: null as string | null })),
          ...productRows.map((p) => ({
            loc: `${origin}/market/${p.slug}`,
            lastmod: p.updated_at?.slice(0, 10) ?? null,
          })),
        ];
        const body =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          urls
            .map((u) => {
              const last = u.lastmod ? `<lastmod>${xmlEscape(u.lastmod)}</lastmod>` : "";
              return `<url><loc>${xmlEscape(u.loc)}</loc>${last}</url>`;
            })
            .join("\n") +
          `\n</urlset>\n`;
        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
