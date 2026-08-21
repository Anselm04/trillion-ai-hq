import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
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
import { isFounderEmail } from "@/lib/trillion/company";
import { hasPerm } from "@/lib/trillion/roles";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/locale";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/account")({
  head: () => pageSeo({ title: "Account", path: "/account", noindex: true, description: "Your account." }),
  component: Account,
});

function Account() {
  const { t } = useI18n();
  const { user, isPending } = useCurrentUserState();
  const { access } = useAccess();
  const qc = useQueryClient();
  const commerce = useQuery({
    queryKey: ["commerce"],
    queryFn: () => myCommerce(),
    enabled: Boolean(user),
  });

  if (isPending) {
    return (
      <PublicShell>
        <div className="p-10 text-sm text-muted-foreground">{t("common.loading")}</div>
      </PublicShell>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (isFounderEmail(user.primaryEmail) || hasPerm(access.role, "enterThrone")) {
    return <Navigate to="/throne" />;
  }

  return (
    <PublicShell>
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <p className="text-xs tracking-[0.22em] text-sage uppercase">{t("account.kicker")}</p>
        <h1 className="mt-3 font-display text-4xl">{access.displayName || user.displayName || t("nav.signIn")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {access.email || user.primaryEmail} · {roleLabel(access.role)}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {hasPerm(access.role, "enterThrone") && (
            <Button asChild size="sm">
              <Link to="/throne">{t("nav.admin")}</Link>
            </Button>
          )}
        </div>

        <h2 className="mt-12 font-display text-2xl">{t("account.orders")}</h2>
        <div className="mt-4 divide-y divide-border rounded-2xl bg-card shadow-[var(--shadow-border)]">
          {(commerce.data?.orders ?? []).length === 0 && (
            <p className="p-5 text-sm text-muted-foreground">{t("account.none")}</p>
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

        <h2 className="mt-12 font-display text-2xl">{t("account.support")}</h2>
        <form
          className="mt-4 grid gap-3 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            openTicket({
              data: {
                subject: String(fd.get("subject") ?? ""),
                body: String(fd.get("body") ?? ""),
              },
            })
              .then(() => {
                toast.success(t("contact.received"));
                qc.invalidateQueries({ queryKey: ["commerce"] });
                form.reset();
              })
              .catch((err: Error) => toast.error(err.message));
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="subject">{t("account.subject")}</Label>
            <Input id="subject" name="subject" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="body">{t("account.message")}</Label>
            <Textarea id="body" name="body" required />
          </div>
          <Button type="submit">{t("account.ticket")}</Button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {(commerce.data?.tickets ?? []).map((tk) => (
            <li key={tk.id} className="flex justify-between gap-3">
              <span>{tk.subject}</span>
              <Badge>{tk.status}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </PublicShell>
  );
}
