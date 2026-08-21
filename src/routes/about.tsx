import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { COMPANY, FOUNDER } from "@/lib/trillion/company";
import { useI18n } from "@/lib/i18n/locale";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    pageSeo({
      title: "About",
      description: `About Trillion AI Tech Company Limited. Founded, owned, and led by ${FOUNDER.name}, ${FOUNDER.titles}.`,
      path: "/about",
    }),
  component: About,
});

function About() {
  const { t } = useI18n();
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="text-[10px] tracking-[0.28em] text-sage uppercase">{t("about.kicker")}</p>
        <h1 className="mt-4 font-display text-5xl sm:text-6xl">{t("about.title")}</h1>
        <p className="mt-8 text-lg leading-relaxed text-muted-foreground">{t("about.p1")}</p>
        <div className="hairline my-12" />
        <h2 className="font-display text-3xl">{t("about.own")}</h2>
        <p className="mt-4 text-muted-foreground">
          {t("about.ownBody", { name: FOUNDER.name, titles: FOUNDER.titles })}
        </p>
        <h2 className="mt-14 font-display text-3xl">{t("about.sell")}</h2>
        <p className="mt-4 text-muted-foreground">{t("about.sellBody")}</p>
        <h2 className="mt-14 font-display text-3xl">{t("about.where")}</h2>
        <p className="mt-4 text-muted-foreground">
          {COMPANY.domain}. {t("contact.hello")}: {COMPANY.legalName}.
        </p>
        <Button asChild className="mt-12">
          <Link to="/market">{t("about.open")}</Link>
        </Button>
      </article>
    </PublicShell>
  );
}
