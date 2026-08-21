import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { fulfillStripeOrder } from "@/lib/trillion/commerce";

type Search = { order?: string; session_id?: string; payment_intent?: string };

export const Route = createFileRoute("/checkout/complete")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    order: typeof s.order === "string" ? s.order : undefined,
    session_id: typeof s.session_id === "string" ? s.session_id : undefined,
    payment_intent: typeof s.payment_intent === "string" ? s.payment_intent : undefined,
  }),
  component: Complete,
});

function Complete() {
  const { order, session_id, payment_intent } = Route.useSearch();
  const [state, setState] = useState<"working" | "ok" | "err">("working");
  const [detail, setDetail] = useState("Checking Stripe.");

  useEffect(() => {
    const ref = payment_intent || session_id;
    if (!ref) {
      setState("ok");
      setDetail("If you paid, the order is on your account.");
      return;
    }
    const orderId = order ? Number(order) : undefined;
    fulfillStripeOrder({
      data: {
        orderId: orderId && !Number.isNaN(orderId) ? orderId : undefined,
        sessionId: session_id,
        paymentIntent: payment_intent || (ref.startsWith("pi_") ? ref : undefined),
      },
    })
      .then(() => {
        setState("ok");
        setDetail("Payment received. This purchase is on your account.");
      })
      .catch((err: Error) => {
        setState("err");
        setDetail(
          err.message ||
            "If you were charged, write support@trillionaitech.com. The Stripe webhook may still mark it paid.",
        );
      });
  }, [order, session_id, payment_intent]);

  return (
    <PublicShell>
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-xs tracking-[0.22em] text-sage uppercase">Stripe</p>
        <h1 className="mt-3 font-display text-3xl">
          {state === "working" ? "Confirming payment…" : state === "ok" ? "Payment received" : "Could not confirm"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{detail}</p>
        <Button asChild className="mt-8">
          <Link to="/account">Open account</Link>
        </Button>
      </div>
    </PublicShell>
  );
}
