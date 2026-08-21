import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/category-page";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/tools")({
  head: () =>
    pageSeo({
      title: "Tools",
      description: "Tools from Trillion AI Tech Ltd.",
      path: "/tools",
    }),
  component: () => <CategoryPage category="tool" />,
});
