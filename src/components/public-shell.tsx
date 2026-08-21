import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { TrillionWordmark } from "@/components/trillion-mark";
import { AuthSlot } from "@/components/auth-slot";
import { SiteControls } from "@/components/site-controls";
import { COMPANY, FOUNDER, MAIL } from "@/lib/trillion/company";
import { useI18n } from "@/lib/i18n/locale";
import type { MessageKey } from "@/lib/i18n/messages";

export function PublicShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const nav = [
    { to: "/apps" as const, key: "cat.app" as MessageKey },
    { to: "/games" as const, key: "cat.game" as MessageKey },
    { to: "/agents" as const, key: "cat.agent" as MessageKey },
    { to: "/tools" as const, key: "cat.tool" as MessageKey },
    { to: "/software" as const, key: "cat.software" as MessageKey },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-5">
          <Link to="/" className="min-w-0" aria-label="Trillion AI Tech Ltd™">
            <TrillionWordmark />
          </Link>
          <AuthSlot />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-14 sm:flex-row sm:justify-between">
          <div>
            <TrillionWordmark />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {t("footer.blurb", { legal: COMPANY.legalName })}
            </p>
            <p className="mt-2 text-sm">
              {FOUNDER.name} · {FOUNDER.titles}
            </p>
            <div className="mt-8">
              <SiteControls />
            </div>
          </div>
          <div className="grid gap-8 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              {nav.map((l) => (
                <Link key={l.to} to={l.to}>
                  {t(l.key)}
                </Link>
              ))}
              <Link to="/about">{t("nav.about")}</Link>
              <Link to="/contact">{t("nav.contact")}</Link>
            </div>
            <div className="flex flex-col gap-2">
              <a href={`mailto:${MAIL.hello}`}>{MAIL.hello}</a>
              <a href={`mailto:${MAIL.support}`}>{MAIL.support}</a>
              <a href={`mailto:${MAIL.founder}`}>{MAIL.founder}</a>
              <Link to="/privacy">{t("nav.privacy")}</Link>
              <Link to="/terms">{t("nav.terms")}</Link>
            </div>
          </div>
        </div>
        <p className="mx-auto max-w-5xl px-5 pb-8 text-[11px] text-faint">
          © {new Date().getFullYear()} {COMPANY.legalName}™
        </p>
      </footer>
    </div>
  );
}
