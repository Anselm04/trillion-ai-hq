import { COMPANY, FOUNDER, MAIL } from "@/lib/trillion/company";
import type { Product } from "@/lib/trillion/types";

export const SITE_NAME = "Trillion AI Tech Ltd™";
export const DEFAULT_DESCRIPTION =
  "Apps, games, agents, tools, and software from Trillion AI Tech Company Limited. Founded by Anselm Perkins.";
export const DEFAULT_KEYWORDS = [
  "Trillion AI",
  "Trillion AI Tech",
  "Trillion AI Tech Ltd",
  "Trillion AI Tech Company Limited",
  "Anselm Perkins",
  "apps",
  "games",
  "agents",
  "tools",
  "software",
  "AI software",
  "trillionaitech",
].join(", ");
export const OG_IMAGE = `${COMPANY.siteUrl}/og.jpg`;

type PageSeo = {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  noindex?: boolean;
  type?: "website" | "article" | "product";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  keywords?: string;
};

export function absUrl(path: string) {
  const origin = COMPANY.siteUrl.replace(/\/+$/, "");
  if (!path || path === "/") return origin;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageTitle(title?: string) {
  if (!title || title === SITE_NAME) return SITE_NAME;
  return `${title} · ${SITE_NAME}`;
}

export function pageSeo(input: PageSeo) {
  const title = pageTitle(input.title);
  const description = input.description?.trim() || DEFAULT_DESCRIPTION;
  const url = absUrl(input.path);
  const image = input.image || OG_IMAGE;
  const jsonLd = input.jsonLd;
  const keywords = input.keywords?.trim() || DEFAULT_KEYWORDS;
  const robots = input.noindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  const year = new Date().getFullYear();
  const imageType = image.endsWith(".svg") ? "image/svg+xml" : image.endsWith(".png") ? "image/png" : "image/jpeg";
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "keywords", content: keywords },
      { name: "robots", content: robots },
      { name: "googlebot", content: robots },
      { name: "author", content: `${FOUNDER.name}, ${COMPANY.legalName}` },
      { name: "publisher", content: COMPANY.legalName },
      { name: "copyright", content: `© ${year} ${COMPANY.legalName}` },
      { name: "application-name", content: SITE_NAME },
      { name: "apple-mobile-web-app-title", content: "Trillion AI" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "format-detection", content: "telephone=no" },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { name: "language", content: "en" },
      { name: "geo.region", content: "NZ" },
      { name: "geo.placename", content: "New Zealand" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:type", content: input.type ?? "website" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:alt", content: title },
      { property: "og:image:type", content: imageType },
      { property: "og:locale", content: "en_NZ" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: title },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: jsonLd
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify(jsonLd),
          },
        ]
      : [],
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.legalName,
    legalName: COMPANY.legalName,
    url: COMPANY.siteUrl,
    logo: absUrl("/favicon.svg"),
    email: MAIL.hello,
    founder: {
      "@type": "Person",
      name: FOUNDER.name,
      jobTitle: FOUNDER.titles,
      email: FOUNDER.companyEmail,
    },
    contactPoint: [
      { "@type": "ContactPoint", email: MAIL.hello, contactType: "sales" },
      { "@type": "ContactPoint", email: MAIL.support, contactType: "customer support" },
    ],
    sameAs: [],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: COMPANY.siteUrl,
    publisher: { "@type": "Organization", name: COMPANY.legalName },
    inLanguage: "en",
  };
}

export function productJsonLd(product: Product) {
  const url = absUrl(`/market/${product.slug}`);
  const amount = product.prices[0]?.amountCents ?? product.priceCents;
  const offers =
    amount == null
      ? undefined
      : {
          "@type": "Offer",
          url,
          priceCurrency: "USD",
          price: (amount / 100).toFixed(2),
          availability: "https://schema.org/InStock",
        };
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.tagline || product.description?.slice(0, 240),
    applicationCategory: product.category,
    url,
    image: product.imageUrl || OG_IMAGE,
    brand: { "@type": "Brand", name: COMPANY.legalName },
    offers,
  };
}

export const PRIVATE_SEO = pageSeo({
  title: "Account",
  path: "/",
  noindex: true,
  description: "Private area.",
});
