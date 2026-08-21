export const CATEGORIES = ["app", "game", "agent", "tool", "software"] as const;
export type Category = (typeof CATEGORIES)[number];

export const BILLING = ["one_time", "subscription", "free"] as const;
export type Billing = (typeof BILLING)[number];

export const BILLING_INTERVALS = ["week", "month", "quarter", "year"] as const;
export type BillingInterval = (typeof BILLING_INTERVALS)[number];

export const PRODUCT_STATUSES = ["draft", "published", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export type PriceTier = {
  id?: number;
  name: string;
  amountCents: number;
  billing: Billing;
  billingInterval: BillingInterval | string | null;
  stripePriceId?: string | null;
  paymentLinkUrl?: string | null;
  active?: boolean;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  priceCents: number | null;
  billing: Billing;
  billingInterval: BillingInterval | string | null;
  demoUrl: string | null;
  videoUrl: string | null;
  imageUrl: string | null;
  features: string;
  vantaReady: boolean;
  featured: boolean;
  status: ProductStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  prices: PriceTier[];
};

export type Access = {
  userId: string | null;
  email: string | null;
  displayName: string | null;
  role: import("./roles").Role;
  status: string;
  godExpiresAt: string | null;
  department: string | null;
};

export type Order = {
  id: number;
  userId: string;
  productId: number;
  productName: string;
  amountCents: number;
  billing: string;
  status: string;
  createdAt: string;
};

export type Ticket = {
  id: number;
  userId: string;
  subject: string;
  body: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  requesterEmail?: string | null;
};

export type AuditLog = {
  id: number;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  detail: string | null;
  createdAt: string;
};

export type SentinelAlert = {
  id: number;
  severity: string;
  title: string;
  detail: string;
  source: string;
  status: string;
  createdAt: string;
  acknowledgedAt: string | null;
  escalatedAt: string | null;
};

export type ArchitectTask = {
  id: number;
  title: string;
  description: string;
  proposedAction: string;
  status: string;
  decisionNote: string | null;
  createdAt: string;
  decidedAt: string | null;
  executedAt: string | null;
};

export type Incident = {
  id: number;
  title: string;
  severity: string;
  status: string;
  summary: string;
  createdBy: string | null;
  createdAt: string;
  resolvedAt: string | null;
};

export type StaffProfile = {
  userId: string;
  email: string | null;
  displayName: string | null;
  role: import("./roles").Role;
  department: string | null;
  status: string;
  createdAt: string;
  lastSeenAt: string | null;
};

export type GodCode = {
  id: number;
  codePrefix: string;
  tier: string;
  expiresAt: string | null;
  maxUses: number;
  usedCount: number;
  note: string | null;
  createdAt: string;
  lastRedeemedBy: string | null;
};

export type Campaign = {
  id: number;
  title: string;
  channel: string;
  status: string;
  body: string;
  createdAt: string;
};
