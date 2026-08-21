import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { PublicShell } from "@/components/public-shell";
import { useAccess } from "@/components/access-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { myCommerce, openTicket } from "@/lib/trillion/commerce";
import { formatPrice, formatWhen, roleLabel } from "@/lib/trillion/format";
import { hasPerm } from "@/lib/trillion/roles";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({ component: Account });

function Account() {
  const { user, isPending } = useCurrentUserState();
  const { access, loading } = useAccess();
  const qc = useQueryClient();
  const commerce = useQuery({
    queryKey: ["commerce"],
    queryFn: () => myCommerce(),
    enabled: Boolean(user),
  });

  if (isPending || loading) {
    return (
      <PublicShell>
        <div className="p-10 text-sm text-muted-foreground">Loading session…</div>
      </PublicShell>
    );
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <PublicShell>
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <p className="text-xs tracking-[0.22em] text-sage uppercase">Account</p>
        <h1 className="mt-3 font-display text-4xl">{access.displayName || user.displayName || "Signed in"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {access.email || user.primaryEmail} · {roleLabel(access.role)}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {hasPerm(access.role, "enterThrone") && (
            <Button asChild size="sm">
              <Link to="/throne">Throne</Link>
            </Button>
          )}
          {hasPerm(access.role, "enterWatch") && (
            <Button asChild size="sm" variant="outline">
              <Link to="/watch">Watch</Link>
            </Button>
          )}
          {hasPerm(access.role, "enterDesk") && (
            <Button asChild size="sm" variant="outline">
              <Link to="/desk">Desk</Link>
            </Button>
          )}
        </div>

        <h2 className="mt-12 font-display text-2xl">Orders</h2>
        <div className="mt-4 divide-y divide-border rounded-2xl bg-card shadow-[var(--shadow-border)]">
          {(commerce.data?.orders ?? []).length === 0 && (
            <p className="p-5 text-sm text-muted-foreground">No purchases yet.</p>
          )}
          {(commerce.data?.orders ?? []).map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="font-medium">{o.productName}</p>
                <p className="text-xs text-muted-foreground">{formatWhen(o.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm tabular-nums">{formatPrice(o.amountCents, o.billing)}</p>
                <Badge>{o.status}</Badge>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-12 font-display text-2xl">Support</h2>
        <form
          className="mt-4 grid gap-3 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            openTicket({
              data: {
                subject: String(fd.get("subject") ?? ""),
                body: String(fd.get("body") ?? ""),
              },
            })
              .then(() => {
                toast.success("Ticket opened");
                qc.invalidateQueries({ queryKey: ["commerce"] });
                e.currentTarget.reset();
              })
              .catch((err: Error) => toast.error(err.message));
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" name="subject" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="body">Message</Label>
            <Textarea id="body" name="body" required />
          </div>
          <Button type="submit">Open ticket</Button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {(commerce.data?.tickets ?? []).map((t) => (
            <li key={t.id} className="flex justify-between gap-3">
              <span>{t.subject}</span>
              <Badge>{t.status}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </PublicShell>
  );
}
