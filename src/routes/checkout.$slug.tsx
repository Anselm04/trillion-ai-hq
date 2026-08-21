import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { getProduct } from "@/lib/trillion/catalog";
import { confirmLedgerCheckout, startCheckout } from "@/lib/trillion/commerce";
import { formatPrice } from "@/lib/trillion/format";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout/$slug")({ component: Checkout });

function Checkout() {
  const { slug } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const product = useQuery({ queryKey: ["product", slug], queryFn: () => getProduct({ data: slug }) });
  const [busy, setBusy] = useState(false);
  const p = product.data;

  if (isPending) {
    return (
      <PublicShell>
        <div className="p-10 text-sm text-muted-foreground">Loading…</div>
      </PublicShell>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (!p) {
    return (
      <PublicShell>
        <div className="p-10">Product not found.</div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div className="mx-auto max-w-lg px-4 py-16">
        <p className="text-xs tracking-[0.22em] text-sage uppercase">Checkout</p>
        <h1 className="mt-3 font-display text-3xl">{p.name}</h1>
        <p className="mt-2 text-muted-foreground">{p.tagline}</p>
        <p className="mt-6 font-display text-3xl tabular-nums">
          {formatPrice(p.priceCents, p.billing)}
        </p>
        <p className="mt-2 text-xs text-faint">
          Stripe Checkout is used when a live secret is configured. Otherwise the headquarters ledger
          records the purchase for this signed-in account.
        </p>
        <Button
          className="mt-8 w-full"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            startCheckout({ data: slug })
              .then(async (r) => {
                if (r.kind === "stripe" && r.url) {
                  window.location.href = r.url;
                  return;
                }
                if (r.kind === "free") {
                  toast.success("Added to your account");
                  navigate({ to: "/account" });
                  return;
                }
                await confirmLedgerCheckout({ data: r.orderId });
                navigate({
                  to: "/checkout/complete",
                  search: { order: String(r.orderId) },
                });
              })
              .catch((err: Error) => toast.error(err.message))
              .finally(() => setBusy(false));
          }}
        >
          {busy ? "Processing…" : p.billing === "free" ? "Confirm" : "Pay"}
        </Button>
        <Button asChild variant="ghost" className="mt-2 w-full">
          <Link to="/market/$slug" params={{ slug }}>
            Cancel
          </Link>
        </Button>
      </div>
    </PublicShell>
  );
}
