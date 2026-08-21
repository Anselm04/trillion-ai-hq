import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/public-shell";

export const Route = createFileRoute("/team")({ component: Team });

const PEOPLE = [
  {
    name: "Anselm Perkins",
    role: "Founder & CEO",
    email: "anselm@trillionaitech.com",
    bio: "Holds Throne. Architect reports only to this seat.",
  },
  {
    name: "Watch",
    role: "Security",
    email: "hello@trillionaitech.com",
    bio: "Threat desk, incident response, Sentinel acknowledgement. Staffed from Throne.",
  },
  {
    name: "Product",
    role: "Product Manager",
    email: "hello@trillionaitech.com",
    bio: "Owns the live catalog. Adds, edits, and retires SKUs without a deploy.",
  },
  {
    name: "Shield",
    role: "Compliance Officer",
    email: "hello@trillionaitech.com",
    bio: "Evidence, access reviews, and the Vanta-aligned control map.",
  },
  {
    name: "Pulse",
    role: "Support Lead",
    email: "support@trillionaitech.com",
    bio: "Call-centre ready. Full subscriber lookup, tickets, usage history.",
  },
  {
    name: "Market",
    role: "Marketing Lead",
    email: "hello@trillionaitech.com",
    bio: "Campaigns that publish into the same catalog the factory fills.",
  },
];

function Team() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs tracking-[0.22em] text-sage uppercase">Team</p>
        <h1 className="mt-3 font-display text-4xl">Command structure</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Seats are assigned from Throne. The public page names the function; the people are the
          signed-in staff behind it.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PEOPLE.map((p) => (
            <div key={p.role} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
              <p className="text-xs tracking-[0.16em] text-sage uppercase">{p.role}</p>
              <h2 className="mt-3 font-display text-2xl">{p.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.bio}</p>
              <a href={`mailto:${p.email}`} className="mt-4 inline-block text-sm text-foreground">
                {p.email}
              </a>
            </div>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
