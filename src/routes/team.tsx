import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/public-shell";
import { FOUNDER, MAIL } from "@/lib/trillion/company";

export const Route = createFileRoute("/team")({ component: Team });

function Team() {
  return (
    <PublicShell>
      <div className="relative overflow-hidden">
        <div className="bg-atmosphere pointer-events-none absolute inset-0 opacity-80" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <p className="text-xs tracking-[0.26em] text-sage uppercase">Team</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">One founder. A house around him.</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Seats are assigned from Throne. The public record names the person who owns the company.
          </p>

          <div className="mt-14 overflow-hidden rounded-3xl bg-card p-8 shadow-[var(--shadow-border)] sm:p-10">
            <p className="text-xs tracking-[0.2em] text-sage uppercase">{FOUNDER.titles}</p>
            <h2 className="mt-4 font-display text-4xl">{FOUNDER.name}</h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Founder, owner, and chief executive of Trillion AI Tech Company Limited. Holds Throne.
              Architect reports only to this seat.
            </p>
            <div className="mt-8 flex flex-col gap-2 text-sm">
              <a href={`mailto:${FOUNDER.commandEmail}`} className="text-foreground">
                {FOUNDER.commandEmail}
              </a>
              <a href={`mailto:${FOUNDER.companyEmail}`} className="text-muted-foreground">
                {FOUNDER.companyEmail}
              </a>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { title: "Watch", body: "Security. Staffed from Throne.", mail: MAIL.hello },
              { title: "Desk", body: "Product, support, compliance, marketing.", mail: MAIL.hello },
              { title: "Support", body: "Customer lookup and tickets.", mail: MAIL.support },
              { title: "Hello", body: "The public desk.", mail: MAIL.hello },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl bg-card/70 p-6 shadow-[var(--shadow-border)]">
                <p className="font-display text-xl">{s.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                <a href={`mailto:${s.mail}`} className="mt-4 inline-block text-sm text-sage">
                  {s.mail}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
