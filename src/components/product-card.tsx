import { Link } from "@tanstack/react-router";
import { ProductCover } from "@/components/product-art";
import { VantaBadge } from "@/components/vanta-badge";
import { formatPrice } from "@/lib/trillion/format";
import type { Product } from "@/lib/trillion/types";
import { useI18n } from "@/lib/i18n/locale";
import type { MessageKey } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

export function productPriceLabel(
  product: Pick<Product, "priceCents" | "billing" | "billingInterval" | "prices">,
  t: (key: MessageKey) => string,
) {
  if (product.billing === "free" || product.priceCents === 0) return t("price.free");
  if (product.prices?.length) {
    const paid = product.prices.filter((x) => x.amountCents > 0).sort((a, b) => a.amountCents - b.amountCents);
    if (paid.length > 1) {
      return `From ${formatPrice(paid[0]!.amountCents, paid[0]!.billing, paid[0]!.billingInterval)}`;
    }
    if (paid[0]) return formatPrice(paid[0].amountCents, paid[0].billing, paid[0].billingInterval);
  }
  if (product.priceCents == null) return t("price.soon");
  return formatPrice(product.priceCents, product.billing, product.billingInterval);
}

export function ProductCard({
  product,
  featured = false,
}: {
  product: Product;
  featured?: boolean;
}) {
  const { t } = useI18n();
  const catKey = `cat.${product.category.charAt(0).toUpperCase()}${product.category.slice(1)}` as MessageKey;
  return (
    <Link
      to="/market/$slug"
      params={{ slug: product.slug }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl bg-card transition-shadow duration-200",
        "shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
        featured && "sm:col-span-2",
      )}
    >
      <ProductCover
        name={product.name}
        category={product.category}
        imageUrl={product.imageUrl}
        priority={featured}
        className={featured ? "h-56 w-full sm:h-64" : "aspect-[16/10] h-44 w-full"}
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[10px] tracking-[0.22em] text-sage uppercase">{t(catKey)}</p>
          {product.vantaReady && <VantaBadge />}
        </div>
        <h3 className={cn("mt-2 font-display tracking-tight", featured ? "text-3xl" : "text-2xl")}>
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {product.tagline}
        </p>
        <p className="mt-5 text-sm tabular-nums text-foreground/80">{productPriceLabel(product, t)}</p>
      </div>
    </Link>
  );
}
