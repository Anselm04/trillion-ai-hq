import type { Billing, Category } from "./types";

export type ProductSeed = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  priceCents: number | null;
  billing: Billing;
  billingInterval: string | null;
  features: string;
  vantaReady: boolean;
  featured: boolean;
};

/** Never auto-publish sample products. The catalog is filled from Admin only. */
export const PRODUCT_SEEDS: ProductSeed[] = [];

export const DEMO_PRODUCT_SLUGS = [
  "trillion-forge",
  "trillion-sentinel",
  "trillion-shield",
  "architect",
  "pulse-desk",
  "market-kit",
  "lattice",
  "helix-notes",
] as const;
