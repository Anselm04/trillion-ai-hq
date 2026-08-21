import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicShell } from "@/components/public-shell";
import { ProductCard } from "@/components/product-card";
import { TrillionEmblem } from "@/components/trillion-mark";
import { listProducts } from "@/lib/trillion/catalog";
import { CATEGORY_PATH } from "@/lib/trillion/paths";
import { CATEGORIES } from "@/lib/trillion/types";
import { FOUNDER } from "@/lib/trillion/company";
import { useI18n } from "@/lib/i18n/locale";
import type { MessageKey } from "@/lib/i18n/messages";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    pageSeo({
      title: "Trillion AI Tech Ltd™",
      description:
        "Apps, games, agents, tools, and software from Trillion AI Tech Company Limited. Founded by Anselm Perkins.",
      path: "/",
    }),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  const products = useQuery({
    queryKey: ["products"],
    queryFn: () => listProducts(),
    staleTime: 30_000,
  });
  const items = products.data ?? [];

  return (
    <PublicShell>
      <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
        <TrillionEmblem className="h-20 w-20" />
        <h1 className="mt-8 font-display text-5xl tracking-tight sm:text-6xl">
          Trillion AI Tech Ltd
          <sup className="ml-1 align-super font-sans text-[0.28em] text-sage">™</sup>
        </h1>
        <p className="mt-5 max-w-md text-lg text-muted-foreground">{t("hero.line")}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          {FOUNDER.name} · {FOUNDER.titles}
        </p>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-5xl sm:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link key={c} to={CATEGORY_PATH[c]} className="px-5 py-10 text-center hover:bg-muted">
              <span className="font-display text-2xl">{t(`cat.${c}` as MessageKey)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20">
        {items.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="max-w-md text-muted-foreground">{t("home.empty")}</p>
        )}
      </section>
    </PublicShell>
  );
}
