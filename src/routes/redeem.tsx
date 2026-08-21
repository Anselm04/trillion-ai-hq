import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { PublicShell } from "@/components/public-shell";
import { useAccess } from "@/components/access-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redeemGodCode } from "@/lib/trillion/command";
import { toast } from "sonner";

type RedeemSearch = { code?: string };

export const Route = createFileRoute("/redeem")({
  validateSearch: (s: Record<string, unknown>): RedeemSearch => ({
    code: typeof s.code === "string" ? s.code : undefined,
  }),
  component: Redeem,
});

function Redeem() {
  const { code: initial } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const { refresh } = useAccess();
  const navigate = useNavigate();
  const [code, setCode] = useState(initial ?? "");
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return (
      <PublicShell>
        <div className="p-10 text-sm text-muted-foreground">Loading…</div>
      </PublicShell>
    );
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <PublicShell>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-display text-3xl">Redeem a God Code</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          One-time, time-limited, or a life pass. Issued only from Admin.
        </p>
        <form
          className="mt-8 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setBusy(true);
            redeemGodCode({ data: code.trim() })
              .then(() => {
                toast.success("Code redeemed");
                refresh();
                navigate({ to: "/account" });
              })
              .catch((err: Error) => toast.error(err.message))
              .finally(() => setBusy(false));
          }}
        >
          <Label htmlFor="code">Access Code</Label>
          <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required />
          <Button type="submit" disabled={busy}>
            {busy ? "Checking…" : "Redeem"}
          </Button>
        </form>
      </div>
    </PublicShell>
  );
}
