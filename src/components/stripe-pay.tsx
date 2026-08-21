import { useEffect, useMemo, useState, type FormEvent } from "react";
import { loadStripe, type Stripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { fulfillStripeOrder, startCheckout } from "@/lib/trillion/commerce";
import { toast } from "sonner";

function appearance(): StripeElementsOptions["appearance"] {
  const light = typeof document !== "undefined" && document.documentElement.classList.contains("light");
  return {
    theme: light ? "stripe" : "night",
    variables: {
      colorPrimary: light ? "#8f6b32" : "#c4a574",
      colorBackground: light ? "#fffcf6" : "#141210",
      colorText: light ? "#1c1812" : "#f3ead8",
      colorDanger: light ? "#b14332" : "#c45c4a",
      fontFamily: 'ui-sans-serif, system-ui, "Segoe UI", Helvetica, Arial, sans-serif',
      borderRadius: "12px",
      spacingUnit: "4px",
    },
  };
}

function PayForm({
  orderId,
  onPaid,
}: {
  orderId: number;
  onPaid: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);
    const origin = window.location.origin;
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${origin}/checkout/complete?order=${orderId}`,
      },
      redirect: "if_required",
    });
    if (result.error) {
      setError(result.error.message || "Payment failed.");
      setBusy(false);
      return;
    }
    const intent = result.paymentIntent;
    if (intent?.status === "succeeded" || intent?.status === "processing") {
      try {
        await fulfillStripeOrder({
          data: { orderId, paymentIntent: intent.id, sessionId: intent.id },
        });
      } catch {
        /* webhook may still settle */
      }
      onPaid();
      return;
    }
    setBusy(false);
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      <PaymentElement options={{ layout: "tabs" }} />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={!stripe || busy}>
        {busy ? "Paying…" : "Pay now"}
      </Button>
    </form>
  );
}

export function StripePay({
  clientSecret,
  publishableKey,
  accountId,
  orderId,
  onPaid,
  slug,
  priceId,
}: {
  clientSecret: string;
  publishableKey: string;
  accountId: string | null;
  orderId: number;
  onPaid: () => void;
  slug: string;
  priceId?: number;
}) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [hostedBusy, setHostedBusy] = useState(false);

  useEffect(() => {
    let live = true;
    loadStripe(publishableKey, accountId ? { stripeAccount: accountId } : undefined).then((s) => {
      if (live) setStripe(s);
    });
    return () => {
      live = false;
    };
  }, [publishableKey, accountId]);

  const options = useMemo<StripeElementsOptions>(
    () => ({ clientSecret, appearance: appearance() }),
    [clientSecret],
  );

  if (!stripe) {
    return <p className="text-sm text-muted-foreground">Loading secure card form…</p>;
  }

  return (
    <div className="grid gap-4">
      <Elements stripe={stripe} options={options}>
        <PayForm orderId={orderId} onPaid={onPaid} />
      </Elements>
      <button
        type="button"
        className="text-xs text-muted-foreground underline"
        disabled={hostedBusy}
        onClick={() => {
          setHostedBusy(true);
          startCheckout({ data: { slug, priceId } })
            .then((r) => {
              if (r.url) window.location.assign(r.url);
              else toast.error("Could not open Stripe Checkout.");
            })
            .catch((err: Error) => toast.error(err.message))
            .finally(() => setHostedBusy(false));
        }}
      >
        {hostedBusy ? "Opening…" : "Use Stripe’s full checkout page instead"}
      </button>
    </div>
  );
}
