import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/public-shell";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-xs tracking-[0.22em] text-sage uppercase">About</p>
        <h1 className="mt-3 font-display text-4xl">A company that runs like software.</h1>
        <p className="mt-6 text-muted-foreground">
          Trillion AI Tech Company Limited is the digital headquarters of Anselm Perkins. The public
          face is Trillion Market — a catalog of apps, games, agents, tools, and software. Behind it
          sits an operating system with four tiers of access, an immutable audit, and an operator that
          is forbidden from acting alone.
        </p>
        <h2 className="mt-12 font-display text-2xl">The two states</h2>
        <p className="mt-4 text-muted-foreground">
          State one is manual: the founder runs Throne, security runs Watch, staff run Desk. State two
          is Architect armed. The agent monitors, drafts, and requests permission over the desk, email,
          and the phone. Approve, reject, or modify. Never unsupervised execution.
        </p>
        <h2 className="mt-12 font-display text-2xl">Shield</h2>
        <p className="mt-4 text-muted-foreground">
          Trillion Shield is the compliance plane. Products that carry the Vanta-Ready mark ship with
          access reviews, evidence export, and change control that enterprise buyers already know how
          to read. The badge is a promise about the work, not a substitute for it.
        </p>
        <h2 className="mt-12 font-display text-2xl">Sentinel</h2>
        <p className="mt-4 text-muted-foreground">
          Every staff and security action is logged. Sentinel flags negligence, privilege misuse, and
          silence. If Watch does not acknowledge a critical alert, the matter escalates to Throne.
        </p>
      </article>
    </PublicShell>
  );
}
