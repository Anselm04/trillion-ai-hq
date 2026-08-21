import { createFileRoute } from "@tanstack/react-router";
import { ProductLine } from "@/components/product-line";
import { FORGE_COSTS, FORGE_PLANS } from "@/lib/trillion/plans";

export const Route = createFileRoute("/forge")({ component: Forge });

function Forge() {
  return (
    <ProductLine
      kicker="Product factory"
      title="Trillion Forge"
      lede="Nine agents turn a brief into apps, games, agents, tools, software, and websites. Credits pause the build at zero. Nothing ships until you approve it."
      plans={FORGE_PLANS}
    >
      <h2 className="mt-16 font-display text-3xl">Credit costs</h2>
      <ul className="mt-6 divide-y divide-border rounded-2xl bg-card shadow-[var(--shadow-border)]">
        {FORGE_COSTS.map(([name, cost]) => (
          <li key={name} className="flex justify-between gap-4 px-5 py-3 text-sm">
            <span>{name}</span>
            <span className="tabular-nums text-muted-foreground">{cost}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted-foreground">
        Revisions: minor 25%, medium 50%, major 100% of the base cost. Top-ups: Mini $10 / 100 cr,
        Standard $39 / 500 cr, Pro $79 / 1,000 cr, Max $199 / 3,000 cr.
      </p>
    </ProductLine>
  );
}
