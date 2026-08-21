import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck, Eye, Cpu } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { TrillionMark } from "@/components/trillion-mark";
import { ProductArt } from "@/components/product-art";
import { VantaBadge } from "@/components/vanta-badge";
import { Button } from "@/components/ui/button";
import { listProducts } from "@/lib/trillion/catalog";
import { formatPrice } from "@/lib/trillion/format";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const products = useQuery({ queryKey: ["products"], queryFn: () => listProducts() });
  const featured = (products.data ?? []).filter((p) => p.featured).slice(0, 4);

  return (
    <PublicShell>
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="rise-in text-xs tracking-[0.22em] text-sage uppercase">
            Trillion AI Tech Company Limited
          </p>
          <h1 className="rise-in rise-in-1 mt-6 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-6xl">
            The operating system of a software empire.
          </h1>
          <p className="rise-in rise-in-2 mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Market for the world. Throne for the founder. Watch for security. Desk for the company.
            Products are living records — never hardcoded — and Architect never moves without your word.
          </p>
          <div className="rise-in rise-in-3 mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/market">
                Enter Market <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/login" search={{ next: "/throne" }}>
                Command access
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-px bg-border sm:grid-cols-3">
          {[
            {
              icon: Cpu,
              title: "Throne",
              body: "Master command. Empire overview, staff, catalog, God Codes, Architect, and the audit that cannot be rewritten.",
              to: "/throne" as const,
            },
            {
              icon: Eye,
              title: "Watch",
              body: "Security operations. Threats, staff activity, scanner, incidents, and Sentinel escalation if silence follows a critical alert.",
              to: "/watch" as const,
            },
            {
              icon: ShieldCheck,
              title: "Desk",
              body: "The working floor. Role-gated product, support, compliance, and marketing — call-centre ready user lookup for Support Leads.",
              to: "/desk" as const,
            },
          ].map((c) => (
            <Link
              key={c.title}
              to={c.to}
              className="bg-background p-8 hover:bg-card"
            >
              <c.icon className="size-5 text-sage" />
              <h2 className="mt-4 font-display text-2xl">{c.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.22em] text-faint uppercase">Trillion Market</p>
            <h2 className="mt-2 font-display text-3xl">Live catalog</h2>
          </div>
          <Button asChild variant="ghost">
            <Link to="/market">All products</Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {featured.map((p) => (
            <Link
              key={p.id}
              to="/market/$slug"
              params={{ slug: p.slug }}
              className="group overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-border)]"
            >
              <ProductArt slug={p.slug} category={p.category} className="h-36 w-full" />
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl">{p.name}</h3>
                  {p.vantaReady && <VantaBadge />}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>
                <p className="mt-4 text-sm tabular-nums">{formatPrice(p.priceCents, p.billing)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center">
          <div>
            <TrillionMark size={40} />
            <h2 className="mt-6 font-display text-3xl">Architect asks. You decide.</h2>
            <p className="mt-4 text-muted-foreground">
              Toggle Architect on when you leave the building. It watches the empire, drafts the next
              move, and waits on your phone. Approve, reject, or modify — it cannot act alone. That is
              not a setting. It is the contract.
            </p>
            <Button asChild className="mt-8" variant="outline">
              <Link to="/about">Read the operating model</Link>
            </Button>
          </div>
          <div className="rounded-2xl bg-card p-6 shadow-[var(--shadow-border)]">
            <p className="text-xs tracking-[0.18em] text-faint uppercase">Standing rule</p>
            <ol className="mt-4 space-y-4 text-sm">
              <li className="flex gap-3">
                <span className="font-mono text-sage">01</span>
                Manual: you run Throne, Watch, and Desk yourself.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-sage">02</span>
                Automated: Architect is armed. Every action is a request.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-sage">03</span>
                Sentinel watches staff and security. Silence after a critical alert escalates to you.
              </li>
            </ol>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
