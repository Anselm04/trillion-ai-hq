import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/public-shell";
import { COMPANY, FOUNDER } from "@/lib/trillion/company";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <PublicShell>
      <article className="relative overflow-hidden">
        <div className="bg-atmosphere pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <p className="text-xs tracking-[0.26em] text-sage uppercase">About</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">A house, not a hospital.</h1>
          <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
            {COMPANY.legalName} is the studio and digital headquarters of{" "}
            <span className="text-foreground">{FOUNDER.name}</span> — {FOUNDER.titles}. The public
            face is Trillion Market. Behind it is a command floor that only the founder can open.
          </p>
          <h2 className="mt-14 font-display text-2xl">Ownership</h2>
          <p className="mt-4 text-muted-foreground">
            {FOUNDER.name} is founder, owner, and chief executive. Throne is his seat. Staff and
            security seats are granted from that seat, never assumed.
          </p>
          <h2 className="mt-14 font-display text-2xl">How the house runs</h2>
          <p className="mt-4 text-muted-foreground">
            Manual, until Architect is armed. Then every proposed move waits for a yes, a no, or a
            rewrite. Sentinel watches staff. Silence after a critical alert escalates to Throne.
          </p>
          <h2 className="mt-14 font-display text-2xl">The catalog</h2>
          <p className="mt-4 text-muted-foreground">
            Products are living records — added, edited, or retired from the dashboard. This site is
            not a subscription ladder. When an app is ready to sell, it is listed and Stripe takes
            the payment. Until then, the work is shown, not packaged into tiers.
          </p>
        </div>
      </article>
    </PublicShell>
  );
}
