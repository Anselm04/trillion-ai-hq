import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/category-page";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/software")({
  head: () =>
    pageSeo({
      title: "Software",
      description: "Software from Trillion AI Tech Ltd.",
      path: "/software",
    }),
  component: () => <CategoryPage category="software" />,
});
