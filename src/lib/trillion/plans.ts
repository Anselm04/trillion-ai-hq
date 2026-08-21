export type Plan = {
  name: string;
  price: string;
  detail: string;
  credits?: string;
};

export const FORGE_PLANS: Plan[] = [
  { name: "Starter", price: "$49/mo", detail: "500 credits", credits: "500" },
  { name: "Builder", price: "$149/mo", detail: "2,000 credits", credits: "2,000" },
  { name: "Studio", price: "$399/mo", detail: "6,000 credits", credits: "6,000" },
  { name: "Enterprise", price: "$1,499/mo", detail: "25,000 credits", credits: "25,000" },
  { name: "Custom", price: "Talk to us", detail: "Volume and dedicated capacity" },
];

export const REACH_PLANS: Plan[] = [
  { name: "Free", price: "7-day trial", detail: "Evaluate Reach with spend locked" },
  { name: "Starter", price: "$49/mo", detail: "Campaigns with manual approval" },
  { name: "Professional", price: "$199/mo", detail: "Video ads and more channels" },
  { name: "Business", price: "$499/mo", detail: "Localization and budget controls" },
  { name: "Enterprise", price: "$1,499+/mo", detail: "Dedicated orchestrator capacity" },
];

export const SHIELD_PLANS: Plan[] = [
  { name: "Essentials", price: "$18k–$22k/yr", detail: "Core evidence and monitoring" },
  { name: "Plus", price: "$28k–$45k/yr", detail: "More frameworks and vendors" },
  { name: "Professional", price: "$55k–$85k/yr", detail: "Questionnaires and Trust Center add-ons" },
  { name: "Enterprise", price: "$95k–$250k+/yr", detail: "Full mapping, SSO, auditor portal" },
];

export const FORGE_COSTS = [
  ["Simple tool", "25 cr"],
  ["Basic website", "50 cr"],
  ["Basic app", "150 cr"],
  ["Complex app", "400 cr"],
  ["AI agent", "500 cr"],
  ["2D game", "350 cr"],
  ["Full-stack SaaS", "600 cr"],
  ["3D game", "800 cr"],
  ["Enterprise", "1,000+ cr"],
] as const;
