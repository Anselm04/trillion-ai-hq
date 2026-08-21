import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContact } from "@/lib/trillion/catalog";
import { FOUNDER, MAIL } from "@/lib/trillion/company";
import { useI18n } from "@/lib/i18n/locale";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageSeo({
      title: "Contact",
      description: "Write hello@trillionaitech.com, support@trillionaitech.com, or anselm@trillionaitech.com.",
      path: "/contact",
    }),
  component: Contact,
});

function Contact() {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <PublicShell>
      <div className="mx-auto grid max-w-5xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-[10px] tracking-[0.28em] text-sage uppercase">{t("contact.kicker")}</p>
          <h1 className="mt-4 font-display text-5xl">{t("contact.title")}</h1>
          <p className="mt-4 text-muted-foreground">{t("contact.sub", { name: FOUNDER.name })}</p>
          <ul className="mt-10 space-y-3 text-sm">
            <li>
              <span className="text-faint">{t("contact.hello")} · </span>
              <a href={`mailto:${MAIL.hello}`}>{MAIL.hello}</a>
            </li>
            <li>
              <span className="text-faint">{t("contact.support")} · </span>
              <a href={`mailto:${MAIL.support}`}>{MAIL.support}</a>
            </li>
            <li>
              <span className="text-faint">{t("contact.founder")} · </span>
              <a href={`mailto:${MAIL.founder}`}>{MAIL.founder}</a>
            </li>
          </ul>
        </div>
        {sent ? (
          <div className="rounded-2xl bg-card p-8 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-3xl">{t("contact.received")}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{t("contact.thanks")}</p>
          </div>
        ) : (
          <form
            className="grid gap-4 rounded-2xl bg-card p-6 shadow-[var(--shadow-border)] sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setBusy(true);
              submitContact({
                data: {
                  name: String(fd.get("name") ?? ""),
                  email: String(fd.get("email") ?? ""),
                  topic: String(fd.get("topic") ?? "general"),
                  message: String(fd.get("message") ?? ""),
                },
              })
                .then(() => setSent(true))
                .catch((err: Error) => toast.error(err.message))
                .finally(() => setBusy(false));
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="name">{t("contact.name")}</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">{t("contact.email")}</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="topic">{t("contact.topic")}</Label>
              <select
                id="topic"
                name="topic"
                className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="sales">{t("contact.sales")}</option>
                <option value="support">{t("contact.support")}</option>
                <option value="press">{t("contact.press")}</option>
                <option value="general">{t("contact.general")}</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="message">{t("contact.message")}</Label>
              <Textarea id="message" name="message" required />
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? t("contact.sending") : t("contact.send")}
            </Button>
          </form>
        )}
      </div>
    </PublicShell>
  );
}
