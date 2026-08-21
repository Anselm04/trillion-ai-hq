import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { confirmLedgerCheckout, fulfillStripeOrder } from "@/lib/trillion/commerce";

type Search = { order?: string; session_id?: string };

export const Route = createFileRoute("/checkout/complete")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    order: typeof s.order === "string" ? s.order : undefined,
    session_id: typeof s.session_id === "string" ? s.session_id : undefined,
  }),
  component: Complete,
});

function Complete() {
  const { order, session_id } = Route.useSearch();
  const [state, setState] = useState<"working" | "ok" | "err">("working");

  useEffect(() => {
    const id = Number(order);
    if (!id) {
      setState("ok");
      return;
    }
    const run = session_id
      ? fulfillStripeOrder({ data: { orderId: id, sessionId: session_id } })
      : confirmLedgerCheckout({ data: id });
    run.then(() => setState("ok")).catch(() => setState("err"));
  }, [order, session_id]);

  return (
    <PublicShell>
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl">
          {state === "working" ? "Settling…" : state === "ok" ? "You're in." : "Could not confirm"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {state === "ok"
            ? "The purchase is on your account. Support can see the same record."
            : state === "err"
              ? "If you were charged, write support@trillionaitech.com with the time of purchase."
              : "Writing the ledger."}
        </p>
        <Button asChild className="mt-8">
          <Link to="/account">Open account</Link>
        </Button>
      </div>
    </PublicShell>
  );
}
