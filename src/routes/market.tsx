import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PublicShell } from "@/components/public-shell";
import { ProductArt } from "@/components/product-art";
import { VantaBadge } from "@/components/vanta-badge";
import { listProducts } from "@/lib/trillion/catalog";
import { formatPrice } from "@/lib/trillion/format";
import { CATEGORIES } from "@/lib/trillion/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/market")({ component: Market });

function Market() {
  const products = useQuery({ queryKey: ["products"], queryFn: () => listProducts() });
  const [cat, setCat] = useState<string>("all");
  const items = (products.data ?? []).filter((p) => cat === "all" || p.category === cat);

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-xs tracking-[0.22em] text-sage uppercase">Trillion Market</p>
        <h1 className="mt-3 font-display text-4xl">From the studio</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Apps, games, agents, tools, and software. No subscription tiers. Request access until a
          product is listed for sale.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {["all", ...CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={cn(
                "h-10 rounded-full border px-4 text-sm",
                cat === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Link
              key={p.id}
              to="/market/$slug"
              params={{ slug: p.slug }}
              className="overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-border)]"
            >
              <ProductArt slug={p.slug} category={p.category} className="h-32 w-full" />
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl">{p.name}</h2>
                  {p.vantaReady && <VantaBadge />}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.tagline}</p>
                <p className="mt-4 text-sm tabular-nums">{formatPrice(p.priceCents, p.billing)}</p>
              </div>
            </Link>
          ))}
        </div>
        {products.isSuccess && items.length === 0 && (
          <p className="mt-12 text-sm text-muted-foreground">No products in this category yet.</p>
        )}
      </div>
    </PublicShell>
  );
}
