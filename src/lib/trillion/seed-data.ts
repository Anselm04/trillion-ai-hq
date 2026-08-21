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
      "Forge is the Product Factory for Trillion AI. Describe the software you want to exist — an agent, a tool, a game, a desk — and Forge drafts architecture, catalog copy, and a launch checklist. Staff publish from the dashboard. Nothing is hardcoded; every SKU is a living record.",
    category: "agent",
    priceCents: null,
    billing: "one_time",
    billingInterval: null,
    features:
      "Brief-to-spec generation\nCatalog-ready copy\nPackaging drafts\nLaunch checklist\nHands-off until you approve",
    vantaReady: true,
    featured: true,
  },
  {
    slug: "trillion-sentinel",
    name: "Trillion Sentinel",
    tagline: "An AI watch that never looks away from staff and security.",
    description:
      "Sentinel reads every action inside the headquarters. It flags negligence, privilege misuse, and silence after a critical alert. If Watch does not respond, it escalates to Throne.",
    category: "software",
    priceCents: null,
    billing: "one_time",
    billingInterval: null,
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
      "Shield is the compliance plane for products that must survive enterprise review. Access reviews, audit export, change control, and evidence packs — aligned with the controls Vanta buyers expect.",
    category: "software",
    priceCents: null,
    billing: "one_time",
    billingInterval: null,
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
      "Architect is the personal AI agent of the founder. Toggle it on when you leave the building. It watches the house, drafts the next move, and waits. It cannot execute without an explicit Approve, Reject, or Modify.",
    category: "agent",
    priceCents: null,
    billing: "one_time",
    billingInterval: null,
    features:
      "On/off operator mode\nApproval-gated actions\nDesk queue\nNever acts alone\nFull audit of proposals",
    vantaReady: true,
    featured: true,
  },
  {
    slug: "pulse-desk",
    name: "Pulse Desk",
    tagline: "A call-centre-ready support console for every customer.",
    description:
      "Pulse Desk is the Support Lead’s working surface: lookup any customer, read usage, and run tickets as a real queue.",
    category: "app",
    priceCents: null,
    billing: "one_time",
    billingInterval: null,
    features:
      "Full user lookup\nUsage history\nTicket queue\nCall-centre layout\nRole-gated fields",
    vantaReady: false,
    featured: false,
  },
  {
    slug: "market-kit",
    name: "Market Kit",
    tagline: "The toolkit that lists a product on Trillion Market in one commit.",
    description:
      "Market Kit is the publishing toolkit for internal and partner teams. Push a SKU and demo into the catalog from the dashboard — no deploy, no hardcoded page.",
    category: "tool",
    priceCents: null,
    billing: "one_time",
    billingInterval: null,
    features:
      "Dashboard publishing\nSlug control\nDemo surface\nNo code deploys\nCatalog webhooks",
    vantaReady: false,
    featured: false,
  },
  {
    slug: "lattice",
    name: "Lattice",
    tagline: "A quiet puzzle about building under constraint.",
    description:
      "Lattice is a structural puzzle from the Trillion studio. Place load-bearing pieces on a dark grid, keep the span from collapsing, and chase a clean close.",
    category: "game",
    priceCents: null,
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
      "Helix is the internal notebook for product briefs, incident notes, and Architect drafts. Plain text, signed-in only, scoped to you.",
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
