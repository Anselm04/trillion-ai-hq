export const ROLES = [
  "throne",
  "security",
  "product_manager",
  "compliance_officer",
  "support_lead",
  "marketing_lead",
  "view_only",
  "god_limited",
  "god_medium",
  "god_full",
  "customer",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  throne: "Throne",
  security: "Security",
  product_manager: "Product Manager",
  compliance_officer: "Compliance Officer",
  support_lead: "Support Lead",
  marketing_lead: "Marketing Lead",
  view_only: "View only",
  god_limited: "God · Limited",
  god_medium: "God · Medium",
  god_full: "God · Full",
  customer: "Customer",
};

export const STAFF_ASSIGNABLE: Role[] = [
  "security",
  "product_manager",
  "compliance_officer",
  "support_lead",
  "marketing_lead",
  "view_only",
];

export const PERM = {
  enterThrone: ["throne", "god_full"] as Role[],
  enterWatch: ["throne", "security", "god_full", "god_medium"] as Role[],
  enterDesk: [
    "throne",
    "security",
    "product_manager",
    "compliance_officer",
    "support_lead",
    "marketing_lead",
    "view_only",
    "god_limited",
    "god_medium",
    "god_full",
  ] as Role[],
  manageProducts: ["throne", "product_manager", "god_full"] as Role[],
  manageStaff: ["throne"] as Role[],
  godCodes: ["throne"] as Role[],
  architect: ["throne"] as Role[],
  recovery: ["throne"] as Role[],
  supportLookup: ["throne", "support_lead", "god_full", "god_medium"] as Role[],
  viewAudit: [
    "throne",
    "security",
    "god_full",
    "god_medium",
    "compliance_officer",
  ] as Role[],
  manageIncidents: ["throne", "security", "god_full"] as Role[],
  compliance: [
    "throne",
    "compliance_officer",
    "god_full",
    "god_medium",
  ] as Role[],
  marketing: ["throne", "marketing_lead", "god_full"] as Role[],
  viewAnalytics: [
    "throne",
    "security",
    "god_full",
    "god_medium",
    "view_only",
    "product_manager",
  ] as Role[],
  tickets: ["throne", "support_lead", "god_full", "god_medium"] as Role[],
  manageUsers: ["throne", "god_full"] as Role[],
  sentinelManage: ["throne", "security", "god_full"] as Role[],
};

export type Perm = keyof typeof PERM;

export function hasPerm(role: Role, perm: Perm): boolean {
  return PERM[perm].includes(role);
}

export function canMutate(role: Role): boolean {
  return role !== "view_only" && role !== "god_limited" && role !== "customer";
}

export function isStaff(role: Role): boolean {
  return role !== "customer";
}

export const GUEST_ACCESS = {
  userId: null,
  email: null,
  displayName: null,
  role: "customer" as Role,
  status: "guest",
  godExpiresAt: null,
  department: null,
};
