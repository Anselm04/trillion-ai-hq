import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/category-page";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/games")({
  head: () =>
    pageSeo({
      title: "Games",
      description: "Games from Trillion AI Tech Ltd.",
      path: "/games",
    }),
  component: () => <CategoryPage category="game" />,
});
