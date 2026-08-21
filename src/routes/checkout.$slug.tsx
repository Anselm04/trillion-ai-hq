import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { PublicShell } from "@/components/public-shell";
import { StripePay } from "@/components/stripe-pay";
import { Button } from "@/components/ui/button";
import { getProduct } from "@/lib/trillion/catalog";
import { createElementsIntent } from "@/lib/trillion/commerce";
import { formatPrice } from "@/lib/trillion/format";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/checkout/$slug")({
  validateSearch: (s: Record<string, unknown>): { priceId: number | undefined } => ({
    priceId: typeof s.priceId === "string" ? Number(s.priceId) : typeof s.priceId === "number" ? s.priceId : undefined,
  }),
  head: () => pageSeo({ title: "Checkout", path: "/checkout", noindex: true, description: "Secure checkout." }),
  component: Checkout,
});

function Checkout() {
  const { slug } = Route.useParams();
  const { priceId } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const product = useQuery({ queryKey: ["product", slug], queryFn: () => getProduct({ data: slug }) });
  const [intent, setIntent] = useState<Awaited<ReturnType<typeof createElementsIntent>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const once = useRef(false);
  const p = product.data;
  const next = `/checkout/${slug}${priceId ? `?priceId=${priceId}` : ""}`;

  useEffect(() => {
    if (!user || !p || once.current) return;
    once.current = true;
    let live = true;
    createElementsIntent({ data: { slug, priceId } })
      .then((r) => {
        if (!live) return;
        if (r.kind === "free") {
          navigate({ to: "/account" });
          return;
        }
        setIntent(r);
      })
      .catch((err: Error) => {
        if (live) setError(err.message);
      });
    return () => {
      live = false;
    };
  }, [user, p, slug, priceId, navigate]);

  if (isPending || product.isPending) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-lg px-4 py-16 text-sm text-muted-foreground">Preparing checkout…</div>
      </PublicShell>
    );
  }
  if (!user) return <Navigate to="/login" search={{ next }} />;
  if (!p) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-md px-4 py-16">
          <h1 className="font-display text-3xl">Product not found</h1>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/market">Catalog</Link>
          </Button>
        </div>
      </PublicShell>
    );
  }

  const selected = p.prices.find((t) => t.id === priceId) ?? p.prices[0];
  const amount = intent?.amount ?? selected?.amountCents ?? p.priceCents;
  const billing = intent?.billing ?? selected?.billing ?? p.billing;
  const interval = intent?.interval ?? selected?.billingInterval ?? p.billingInterval;

  return (
    <PublicShell>
      <div className="mx-auto max-w-lg px-4 py-16">
        <p className="text-xs tracking-[0.22em] text-sage uppercase">Secure checkout</p>
        <h1 className="mt-3 font-display text-3xl">{p.name}</h1>
        <p className="mt-2 text-muted-foreground">{intent?.label || selected?.name || p.tagline}</p>
        <p className="mt-6 font-display text-3xl tabular-nums">{formatPrice(amount, billing, interval)}</p>
        <div className="mt-8 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!error && !intent && <p className="text-sm text-muted-foreground">Loading Stripe…</p>}
          {intent?.clientSecret && intent.publishableKey && (
            <StripePay
              clientSecret={intent.clientSecret}
              publishableKey={intent.publishableKey}
              accountId={intent.accountId}
              orderId={intent.orderId}
              slug={slug}
              priceId={priceId}
              onPaid={() => navigate({ to: "/checkout/complete", search: { order: String(intent.orderId) } })}
            />
          )}
        </div>
        <Button asChild variant="ghost" className="mt-4 w-full">
          <Link to="/market/$slug" params={{ slug }}>
            Cancel
          </Link>
        </Button>
      </div>
    </PublicShell>
  );
}
