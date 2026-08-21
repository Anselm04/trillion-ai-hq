import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/public-shell";
import { FORGE_PLANS, REACH_PLANS, SHIELD_PLANS, type Plan } from "@/lib/trillion/plans";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/pricing")({
  head: () =>
    pageSeo({
      title: "Pricing",
      description: "Plans for products from Trillion AI Tech Ltd.",
      path: "/pricing",
    }),
  component: Pricing,
});

function Block({ title, to, plans }: { title: string; to: "/forge" | "/reach" | "/shield"; plans: Plan[] }) {
  return (
    <section className="mt-16">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-display text-3xl">{title}</h2>
        <Link to={to} className="text-sm text-sage">
          Product page
        </Link>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <div key={p.name} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
            <p className="text-xs tracking-[0.18em] text-sage uppercase">{p.name}</p>
            <p className="mt-3 font-display text-3xl">{p.price}</p>
            <p className="mt-2 text-sm text-muted-foreground">{p.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <p className="text-[10px] tracking-[0.28em] text-sage uppercase">Pricing</p>
        <h1 className="mt-4 font-display text-5xl sm:text-6xl">Plans</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Subscription tiers for Forge, Reach, and Shield. The catalog of apps, games, agents,
          tools, and software is separate — those listings are uploaded from Admin and start empty.
        </p>
        <Block title="Trillion Forge" to="/forge" plans={FORGE_PLANS} />
        <Block title="Trillion Reach" to="/reach" plans={REACH_PLANS} />
        <Block title="Trillion Shield" to="/shield" plans={SHIELD_PLANS} />
      </div>
    </PublicShell>
  );
}
