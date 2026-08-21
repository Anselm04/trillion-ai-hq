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

export const PRODUCT_SEEDS: ProductSeed[] = [
  {
    slug: "trillion-forge",
    name: "Trillion Forge",
    tagline: "The factory that turns a brief into a shippable product.",
    description:
      "Forge is the Product Factory for Trillion AI. Describe the software you want to exist — an agent, a tool, a game, a desk — and Forge drafts architecture, catalog copy, pricing, and a launch checklist. Staff publish from the dashboard. Nothing is hardcoded; every SKU is a living record.",
    category: "agent",
    priceCents: 19900,
    billing: "subscription",
    billingInterval: "month",
    features:
      "Brief-to-spec generation\nCatalog-ready copy\nPricing and packaging drafts\nLaunch checklist\nHands-off until you approve",
    vantaReady: true,
    featured: true,
  },
  {
    slug: "trillion-sentinel",
    name: "Trillion Sentinel",
    tagline: "An AI watch that never looks away from staff and security.",
    description:
      "Sentinel reads every action inside the headquarters. It flags negligence, privilege misuse, and silence after a critical alert. If Watch does not respond, it escalates to Throne. Built as the immune system of the company, not a dashboard toy.",
    category: "software",
    priceCents: 7900,
    billing: "subscription",
    billingInterval: "month",
    features:
      "Live action monitoring\nNegligence and misconduct flags\nAuto-escalation to Throne\nImmutable evidence trail\nReporting suite",
    vantaReady: true,
    featured: true,
  },
  {
    slug: "trillion-shield",
    name: "Trillion Shield",
    tagline: "Compliance controls that are Vanta-ready from day one.",
    description:
      "Shield is the compliance plane for products that must survive enterprise review. Access reviews, audit export, change control, and evidence packs — aligned with the controls Vanta buyers expect, without pretending a badge is the work.",
    category: "software",
    priceCents: 14900,
    billing: "subscription",
    billingInterval: "month",
    features:
      "Access reviews\nEvidence export\nChange-control log\nVendor questionnaire pack\nVanta-aligned control map",
    vantaReady: true,
    featured: true,
  },
  {
    slug: "architect",
    name: "Architect",
    tagline: "Your operator. It asks. You decide. Then it moves.",
    description:
      "Architect is the personal AI agent of the founder. Toggle it on when you leave the building. It watches the empire, drafts the next move, and waits. It cannot execute without an explicit Approve, Reject, or Modify. Permission is the product.",
    category: "agent",
    priceCents: 49900,
    billing: "subscription",
    billingInterval: "month",
    features:
      "On/off operator mode\nApproval-gated actions\nEmail, desk, and mobile queue\nNever acts alone\nFull audit of proposals",
    vantaReady: true,
    featured: true,
  },
  {
    slug: "pulse-desk",
    name: "Pulse Desk",
    tagline: "A call-centre-ready support console for every subscriber.",
    description:
      "Pulse Desk is the Support Lead’s working surface: lookup any customer, read subscription state and usage, and run tickets as a real queue. Built for voice-adjacent teams who need the record in front of them before they pick up.",
    category: "app",
    priceCents: 2900,
    billing: "subscription",
    billingInterval: "month",
    features:
      "Full user lookup\nSubscription and usage history\nTicket queue\nCall-centre layout\nRole-gated fields",
    vantaReady: false,
    featured: false,
  },
  {
    slug: "market-kit",
    name: "Market Kit",
    tagline: "The SDK that lists a product on Trillion Market in one commit.",
    description:
      "Market Kit is the publishing toolkit for internal and partner teams. Push a SKU, price, and demo into the catalog from the dashboard — no deploy, no hardcoded page. One-time license, lifetime updates from Throne.",
    category: "tool",
    priceCents: 4900,
    billing: "one_time",
    billingInterval: null,
    features:
      "Dashboard publishing\nSlug and pricing control\nDemo surface\nNo code deploys\nCatalog webhooks",
    vantaReady: false,
    featured: false,
  },
  {
    slug: "lattice",
    name: "Lattice",
    tagline: "A quiet puzzle about building under constraint.",
    description:
      "Lattice is a structural puzzle game from the Trillion studio. Place load-bearing pieces on a dark grid, keep the span from collapsing, and chase a clean close. A study in restraint — the same visual language as the headquarters, made playable.",
    category: "game",
    priceCents: 1900,
    billing: "one_time",
    billingInterval: null,
    features:
      "60 chambers\nDaily span\nNo timers, no noise\nKeyboard and touch\nCloud-free local save",
    vantaReady: false,
    featured: false,
  },
  {
    slug: "helix-notes",
    name: "Helix Notes",
    tagline: "A private notebook for briefs that should never leak.",
    description:
      "Helix is the internal notebook for product briefs, incident notes, and Architect drafts. Plain text, signed-in only, scoped to you. Free for every Trillion account so the work has a place to live before it becomes a SKU.",
    category: "app",
    priceCents: 0,
    billing: "free",
    billingInterval: null,
    features:
      "Per-user notes\nSigned-in only\nExport to Forge brief\nNo public sharing\nSearch",
    vantaReady: true,
    featured: false,
  },
];
