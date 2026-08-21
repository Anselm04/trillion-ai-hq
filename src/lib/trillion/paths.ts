import type { Category } from "./types";

export const CATEGORY_PATH = {
  app: "/apps",
  game: "/games",
  agent: "/agents",
  tool: "/tools",
  software: "/software",
} as const satisfies Record<Category, string>;

export type CategoryPath = (typeof CATEGORY_PATH)[Category];
