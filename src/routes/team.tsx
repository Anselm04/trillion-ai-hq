import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/public-shell";
import { FOUNDER, MAIL } from "@/lib/trillion/company";
import { useI18n } from "@/lib/i18n/locale";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/team")({
  head: () =>
    pageSeo({
      title: "Team",
      description: `${FOUNDER.name} — ${FOUNDER.titles} of Trillion AI Tech Company Limited.`,
      path: "/team",
    }),
  component: Team,
});

function Team() {
  const { t } = useI18n();
  return (
    <PublicShell>
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <p className="text-[10px] tracking-[0.28em] text-sage uppercase">{t("team.kicker")}</p>
        <h1 className="mt-4 font-display text-5xl sm:text-6xl">{t("team.title")}</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">{t("team.sub")}</p>

        <div className="mt-14 rounded-2xl bg-card p-8 shadow-[var(--shadow-border)] sm:p-12">
          <p className="text-[10px] tracking-[0.24em] text-sage uppercase">{FOUNDER.titles}</p>
          <h2 className="mt-5 font-display text-5xl">{FOUNDER.name}</h2>
          <p className="mt-5 max-w-xl text-muted-foreground">{t("team.body")}</p>
          <div className="mt-8 flex flex-col gap-2 text-sm">
            <a href={`mailto:${FOUNDER.companyEmail}`} className="text-foreground">
              {FOUNDER.companyEmail}
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-card p-6 shadow-[var(--shadow-border)]">
            <p className="font-display text-2xl">{t("team.sales")}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t("team.salesBody")}</p>
            <a href={`mailto:${MAIL.hello}`} className="mt-4 inline-block text-sm text-sage">
              {MAIL.hello}
            </a>
          </div>
          <div className="rounded-2xl bg-card p-6 shadow-[var(--shadow-border)]">
            <p className="font-display text-2xl">{t("team.support")}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t("team.supportBody")}</p>
            <a href={`mailto:${MAIL.support}`} className="mt-4 inline-block text-sm text-sage">
              {MAIL.support}
            </a>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
