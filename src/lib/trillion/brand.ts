import type { Category } from "./types";
import { CATEGORIES } from "./types";

export const CATEGORY_LABEL: Record<Category, string> = {
  app: "Apps",
  game: "Games",
  agent: "Agents",
  tool: "Tools",
  software: "Software",
};

export const CATEGORY_SINGULAR: Record<Category, string> = {
  app: "App",
  game: "Game",
  agent: "Agent",
  tool: "Tool",
  software: "Software",
};

export function categoryLabel(category: string): string {
  if ((CATEGORIES as readonly string[]).includes(category)) {
    return CATEGORY_SINGULAR[category as Category];
  }
  return category;
}

export const CATALOG_LINE = "Apps · Games · Agents · Tools · Software";
