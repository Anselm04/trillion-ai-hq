import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/public-shell";
import { useI18n } from "@/lib/i18n/locale";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageSeo({
      title: "Privacy",
      description: "Privacy policy for Trillion AI Tech Company Limited.",
      path: "/privacy",
    }),
  component: Privacy,
});

function Privacy() {
  const { t } = useI18n();
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="text-[10px] tracking-[0.28em] text-sage uppercase">{t("footer.legal")}</p>
        <h1 className="mt-4 font-display text-5xl">{t("privacy.title")}</h1>
        <p className="mt-8 text-base leading-relaxed text-muted-foreground">{t("privacy.body")}</p>
      </article>
    </PublicShell>
  );
}
