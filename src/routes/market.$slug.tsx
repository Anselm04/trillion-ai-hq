import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { ProductCover } from "@/components/product-art";
import { VantaBadge } from "@/components/vanta-badge";
import { Button } from "@/components/ui/button";
import { ProductCard, productPriceLabel } from "@/components/product-card";
import { getProduct, listProducts } from "@/lib/trillion/catalog";
import { featureList, formatPrice } from "@/lib/trillion/format";
import { pageSeo, productJsonLd } from "@/lib/seo";
import { useI18n } from "@/lib/i18n/locale";
import type { MessageKey } from "@/lib/i18n/messages";

export const Route = createFileRoute("/market/$slug")({
  loader: async ({ params }) => {
    const products = await listProducts();
    return products.find((p) => p.slug === params.slug) ?? null;
  },
  head: ({ loaderData }) => {
    const p = loaderData;
    if (!p) {
      return pageSeo({
        title: "Product",
        path: "/market",
        description: "Product from Trillion AI Tech Ltd.",
      });
    }
    return pageSeo({
      title: p.name,
      description: p.tagline || p.description?.slice(0, 160) || `${p.name} from Trillion AI Tech Ltd.`,
      path: `/market/${p.slug}`,
      image: p.imageUrl,
      type: "product",
      jsonLd: productJsonLd(p),
      keywords: `${p.name}, ${p.category}, Trillion AI, Trillion AI Tech Ltd, Anselm Perkins, ${p.tagline || "software"}`,
    });
  },
  component: ProductPage,
});

function ProductPage() {
  const { t } = useI18n();
  const { slug } = Route.useParams();
  const q = useQuery({ queryKey: ["product", slug], queryFn: () => getProduct({ data: slug }) });
  const all = useQuery({ queryKey: ["products"], queryFn: () => listProducts() });
  const p = q.data;
  const related = (all.data ?? []).filter((x) => x.slug !== slug && x.category === p?.category).slice(0, 3);

  if (q.isPending) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-6xl px-4 py-20 text-sm text-muted-foreground">{t("common.loading")}</div>
      </PublicShell>
    );
  }
  if (!p) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="font-display text-3xl">{t("market.notFound")}</h1>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/market">{t("market.back")}</Link>
          </Button>
        </div>
      </PublicShell>
    );
  }

  const catKey = `cat.${p.category}` as MessageKey;

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <Link
          to="/market"
          search={{ category: p.category }}
          className="text-[10px] tracking-[0.24em] text-sage uppercase"
        >
          {t(catKey)}
        </Link>
        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <ProductCover
            name={p.name}
            category={p.category}
            imageUrl={p.imageUrl}
            priority
            className="min-h-72 rounded-2xl lg:min-h-[28rem]"
          />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-5xl">{p.name}</h1>
              {p.vantaReady && <VantaBadge />}
            </div>
            <p className="mt-5 text-lg text-muted-foreground">{p.tagline}</p>
            <p className="mt-6 text-sm leading-relaxed text-foreground/90">{p.description}</p>
            <ul className="mt-8 space-y-2.5">
              {featureList(p.features).map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 text-sage" />
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-10 font-display text-4xl tabular-nums">{productPriceLabel(p, t)}</p>
            <div className="mt-6 grid gap-3">
              {p.prices.length > 1
                ? p.prices.map((tier) => (
                    <Button key={tier.id ?? tier.name} asChild variant="outline" className="h-auto justify-between py-3">
                      <Link to="/checkout/$slug" params={{ slug: p.slug }} search={{ priceId: tier.id }}>
                        <span>{tier.name || "Plan"}</span>
                        <span>{formatPrice(tier.amountCents, tier.billing, tier.billingInterval)}</span>
                      </Link>
                    </Button>
                  ))
                : p.billing === "free" || p.priceCents === 0 ? (
                    <Button asChild>
                      <Link to="/checkout/$slug" params={{ slug: p.slug }} search={{ priceId: undefined }}>
                        {t("product.get")}
                      </Link>
                    </Button>
                  ) : p.priceCents != null || p.prices[0] ? (
                    <Button asChild>
                      <Link
                        to="/checkout/$slug"
                        params={{ slug: p.slug }}
                        search={{ priceId: p.prices[0]?.id }}
                      >
                        {p.billing === "subscription" ? "Subscribe" : t("product.buy")}
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link to="/contact">{t("product.request")}</Link>
                    </Button>
                  )}
              <Button asChild variant="outline">
                <Link to="/contact">{t("product.talk")}</Link>
              </Button>
            </div>
            {p.videoUrl && (
              <a
                href={p.videoUrl}
                className="mt-6 inline-block text-sm text-sage"
                target="_blank"
                rel="noreferrer"
              >
                {t("product.demo")}
              </a>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-24">
            <p className="text-[10px] tracking-[0.24em] text-sage uppercase">{t("market.more")}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicShell>
  );
}
