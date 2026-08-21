import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { ProductArt } from "@/components/product-art";
import { VantaBadge } from "@/components/vanta-badge";
import { Button } from "@/components/ui/button";
import { getProduct } from "@/lib/trillion/catalog";
import { featureList, formatPrice } from "@/lib/trillion/format";

export const Route = createFileRoute("/market/$slug")({ component: ProductPage });

function ProductPage() {
  const { slug } = Route.useParams();
  const q = useQuery({ queryKey: ["product", slug], queryFn: () => getProduct({ data: slug }) });
  const p = q.data;

  if (q.isPending) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-6xl px-4 py-20 text-sm text-muted-foreground">Loading…</div>
      </PublicShell>
    );
  }
  if (!p) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="font-display text-3xl">Not in the catalog</h1>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/market">Back to Market</Link>
          </Button>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <div>
          <ProductArt slug={p.slug} category={p.category} className="h-64 w-full rounded-2xl" />
          <div className="mt-4 overflow-hidden rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
            <p className="text-xs tracking-[0.18em] text-faint uppercase">Live demo</p>
            <p className="mt-2 text-sm text-muted-foreground">
              A motion sketch of the product surface. Staff can attach a hosted video URL from the
              dashboard when a recording exists.
            </p>
            <ProductArt slug={p.slug + "-demo"} category={p.category} className="mt-4 h-40 rounded-xl" />
          </div>
        </div>
        <div>
          <p className="text-xs tracking-[0.22em] text-sage uppercase">{p.category}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl">{p.name}</h1>
            {p.vantaReady && <VantaBadge />}
          </div>
          <p className="mt-4 text-lg text-muted-foreground">{p.tagline}</p>
          <p className="mt-6 text-sm leading-relaxed text-foreground/90">{p.description}</p>
          <ul className="mt-6 space-y-2">
            {featureList(p.features).map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 text-sage" />
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-8 font-display text-3xl tabular-nums text-sage">
            {formatPrice(p.priceCents, p.billing)}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {p.billing === "free" || p.priceCents === 0 ? (
              <Button asChild>
                <Link to="/checkout/$slug" params={{ slug: p.slug }}>
                  Get
                </Link>
              </Button>
            ) : p.priceCents != null ? (
              <Button asChild>
                <Link to="/checkout/$slug" params={{ slug: p.slug }}>
                  Purchase
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/contact">Request access</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to="/contact">Talk to us</Link>
            </Button>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
