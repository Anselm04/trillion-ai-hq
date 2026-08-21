import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicShell } from "@/components/public-shell";
import { ProductCard } from "@/components/product-card";
import { TrillionEmblem } from "@/components/trillion-mark";
import { listProducts } from "@/lib/trillion/catalog";
import { CATEGORIES } from "@/lib/trillion/types";
import { CATEGORY_PATH } from "@/lib/trillion/paths";
import { useI18n } from "@/lib/i18n/locale";
import type { MessageKey } from "@/lib/i18n/messages";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/market")({
  head: () =>
    pageSeo({
      title: "Catalog",
      description: "Trillion Market — apps, games, agents, tools, and software. Only products uploaded by Trillion AI Tech Ltd.",
      path: "/market",
    }),
  component: Market,
});

function Market() {
  const { t } = useI18n();
  const products = useQuery({ queryKey: ["products"], queryFn: () => listProducts() });
  const items = products.data ?? [];

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-[10px] tracking-[0.28em] text-sage uppercase">{t("market.kicker")}</p>
        <h1 className="mt-4 font-display text-5xl sm:text-6xl">{t("market.title")}</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">{t("market.sub")}</p>

        <div className="mt-12 grid gap-3 sm:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to={CATEGORY_PATH[c]}
              className="rounded-2xl bg-card px-4 py-8 text-center shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
            >
              <TrillionEmblem className="mx-auto h-10 w-10" />
              <p className="mt-4 font-display text-2xl">{t(`cat.${c}` as MessageKey)}</p>
            </Link>
          ))}
        </div>

        {items.length > 0 && (
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        {products.isSuccess && items.length === 0 && (
          <p className="mt-16 text-sm text-muted-foreground">{t("home.empty")}</p>
        )}
      </div>
    </PublicShell>
  );
}
