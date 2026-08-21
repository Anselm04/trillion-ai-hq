import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/category-page";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/apps")({
  head: () =>
    pageSeo({
      title: "Apps",
      description: "Apps from Trillion AI Tech Ltd.",
      path: "/apps",
    }),
  component: () => <CategoryPage category="app" />,
});
