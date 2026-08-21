import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { ProductArt } from "@/components/product-art";
import { VantaBadge } from "@/components/vanta-badge";
import { Button } from "@/components/ui/button";
import { listProducts } from "@/lib/trillion/catalog";
import { formatPrice } from "@/lib/trillion/format";
import { COMPANY, FOUNDER } from "@/lib/trillion/company";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const products = useQuery({ queryKey: ["products"], queryFn: () => listProducts() });
  const featured = (products.data ?? []).filter((p) => p.featured).slice(0, 4);

  return (
    <PublicShell>
      <section className="relative overflow-hidden">
        <div className="bg-atmosphere pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <p className="rise-in text-xs tracking-[0.26em] text-sage uppercase">
            {COMPANY.legalName}
          </p>
          <h1 className="rise-in rise-in-1 mt-6 max-w-3xl font-display text-5xl font-medium tracking-tight sm:text-7xl">
            Software, built as a house.
          </h1>
          <p className="rise-in rise-in-2 mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            A private studio for apps, games, agents, and tools — with a command floor that only
            the founder can open.
          </p>
          <p className="rise-in rise-in-3 mt-8 text-sm text-foreground/80">
            {FOUNDER.name}
            <span className="text-faint"> · </span>
            {FOUNDER.titles}
          </p>
          <div className="rise-in rise-in-4 mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/market">
                Enter Market <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/login" search={{ next: "/throne" }}>
                Command
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs tracking-[0.22em] text-faint uppercase">The house</p>
          <div className="mt-8 grid gap-10 md:grid-cols-3">
            {[
              {
                title: "Market",
                body: "The public catalog. Products are living records — added, edited, or retired from the desk. No pricing ladders. No subscription theatre.",
              },
              {
                title: "Throne",
                body: `Master command for ${FOUNDER.name}. Staff, catalog, Architect, Sentinel, and an audit that cannot be rewritten.`,
              },
              {
                title: "Watch & Desk",
                body: "Security and the working floor. Seats are assigned from Throne. Architect never moves without a signed yes.",
              },
            ].map((c) => (
              <div key={c.title}>
                <h2 className="font-display text-2xl">{c.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.22em] text-faint uppercase">Trillion Market</p>
            <h2 className="mt-2 font-display text-3xl">From the studio</h2>
          </div>
          <Button asChild variant="ghost">
            <Link to="/market">All products</Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {featured.map((p) => (
            <Link
              key={p.id}
              to="/market/$slug"
              params={{ slug: p.slug }}
              className="group overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-border)]"
            >
              <ProductArt slug={p.slug} category={p.category} className="h-36 w-full" />
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl">{p.name}</h3>
                  {p.vantaReady && <VantaBadge />}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>
                <p className="mt-4 text-sm tabular-nums text-sage">{formatPrice(p.priceCents, p.billing)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
