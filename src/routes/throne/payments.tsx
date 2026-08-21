import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPaymentStatus, savePaymentSettings } from "@/lib/trillion/payments";

export const Route = createFileRoute("/throne/payments")({ component: Payments });

function Payments() {
  const qc = useQueryClient();
  const status = useQuery({ queryKey: ["payment-status"], queryFn: () => getPaymentStatus() });
  const s = status.data;
  const [secret, setSecret] = useState("");
  const [publishable, setPublishable] = useState("");
  const [account, setAccount] = useState("");
  const [webhook, setWebhook] = useState("");
  const [alipay, setAlipay] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <p className="text-[11px] tracking-[0.18em] text-faint uppercase">Payments</p>
        <h1 className="mt-2 font-display text-4xl">Stripe & Alipay</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Connect the Stripe account that should receive money. Plans you save on a product are created
          in that account as live payment links. Alipay is offered on checkout when it is turned on.
        </p>
      </div>
      <div className="rounded-2xl border border-border p-5">
        <p className="text-sm">
          Status:{" "}
          <span className="text-sage">
            {s?.connected ? `${s.mode === "live" ? "Live" : "Test"} · ${s.secretHint}` : "Not connected"}
          </span>
        </p>
        {s?.stripeAccountId && (
          <p className="mt-1 text-xs text-muted-foreground">Connect account {s.stripeAccountId}</p>
        )}
        {s?.lastError && <p className="mt-2 text-sm text-destructive">{s.lastError}</p>}
        {s?.lastSyncAt && (
          <p className="mt-1 text-xs text-muted-foreground">Last sync {s.lastSyncAt}</p>
        )}
      </div>
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          savePaymentSettings({
            data: {
              secretKey: secret || undefined,
              publishableKey: publishable || s?.publishableKey || undefined,
              stripeAccountId: account || s?.stripeAccountId || undefined,
              webhookSecret: webhook || undefined,
              alipayEnabled: alipay ?? s?.alipayEnabled,
            },
          })
            .then(() => {
              toast.success("Payment account connected");
              setSecret("");
              void qc.invalidateQueries({ queryKey: ["payment-status"] });
            })
            .catch((err: Error) => toast.error(err.message))
            .finally(() => setBusy(false));
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="sk">Stripe secret key</Label>
          <Input
            id="sk"
            type="password"
            autoComplete="off"
            placeholder={s?.secretHint || "sk_live_… or sk_test_…"}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          />
          <p className="text-xs text-faint">From Stripe Dashboard → Developers → API keys. Live keys take real payments.</p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pk">Publishable key</Label>
          <Input
            id="pk"
            placeholder="pk_live_… or pk_test_…"
            defaultValue={s?.publishableKey ?? ""}
            onChange={(e) => setPublishable(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="acct">Stripe Connect account (optional)</Label>
          <Input
            id="acct"
            placeholder="acct_…"
            defaultValue={s?.stripeAccountId ?? ""}
            onChange={(e) => setAccount(e.target.value)}
          />
          <p className="text-xs text-faint">
            If you use Stripe Connect, paste the connected account id. Prices and links are created on
            that account.
          </p>
        </div>
        <div className="grid gap-1.5">
          <Label>Webhook endpoint</Label>
          <div className="flex gap-2">
            <Input readOnly value={s?.webhookUrl ?? "https://trillionaitech.com/api/stripe/webhook"} />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void navigator.clipboard.writeText(s?.webhookUrl ?? "https://trillionaitech.com/api/stripe/webhook");
                toast.success("Copied");
              }}
            >
              Copy
            </Button>
          </div>
          <p className="text-xs text-faint">
            Stripe Dashboard → Developers → Webhooks → Add endpoint. Events: checkout.session.completed,
            checkout.session.async_payment_succeeded, payment_intent.succeeded. Paste the signing secret
            (`whsec_…`). Unsigned webhook calls are rejected. To test from a computer with Stripe CLI:
            `stripe listen --forward-to` this URL, paste the CLI `whsec_`, then
            `stripe trigger checkout.session.completed`.
          </p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="whsec">Webhook signing secret</Label>
          <Input
            id="whsec"
            type="password"
            autoComplete="off"
            placeholder={s?.webhookHint || "whsec_…"}
            value={webhook}
            onChange={(e) => setWebhook(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={alipay ?? s?.alipayEnabled ?? false}
            onChange={(e) => setAlipay(e.target.checked)}
          />
          Enable Alipay on checkout and payment links
        </label>
        <Button type="submit" disabled={busy}>
          {busy ? "Connecting…" : "Save & verify"}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">
        After this is connected, open Catalog, add plans on a product, and save. Each plan syncs into
        Stripe as a subscription price and a live payment link.
      </p>
    </div>
  );
}
