import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/category-page";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/agents")({
  head: () =>
    pageSeo({
      title: "Agents",
      description: "Agents from Trillion AI Tech Ltd.",
      path: "/agents",
    }),
  component: () => <CategoryPage category="agent" />,
});
