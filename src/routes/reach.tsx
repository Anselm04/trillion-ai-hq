import { createFileRoute } from "@tanstack/react-router";
import { ProductLine } from "@/components/product-line";
import { REACH_PLANS } from "@/lib/trillion/plans";

export const Route = createFileRoute("/reach")({ component: Reach });

function Reach() {
  return (
    <ProductLine
      kicker="Marketing agency"
      title="Trillion Reach"
      lede="Ten agents plan, write, shoot, and publish. Spend stays locked until you approve. Auto-Pilot requires an explicit disclaimer."
      plans={REACH_PLANS}
    >
      <p className="mt-10 max-w-2xl text-sm text-muted-foreground">
        Platforms include Meta, X, LinkedIn, YouTube, TikTok, and more. Video ads: explainer,
        showcase, testimonial, unboxing, comparison, cinematic, animated. Manual approval is the
        default. Three compliance strikes in 30 days lock the account.
      </p>
    </ProductLine>
  );
}
