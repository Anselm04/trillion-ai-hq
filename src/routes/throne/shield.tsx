import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listAllProducts } from "@/lib/trillion/catalog";
import { listContact } from "@/lib/trillion/command";
import { VantaBadge } from "@/components/vanta-badge";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/throne/shield")({ component: Shield });

const CONTROLS = [
  { id: "ACC-1", name: "Access reviews", detail: "Staff seats assigned from Throne. God Codes expire or life-pass." },
  { id: "LOG-1", name: "Immutable audit", detail: "Insert-only action log. No update or delete path in the application." },
  { id: "CHG-1", name: "Change control", detail: "Catalog mutations are audited. Rapid deletion raises Sentinel." },
  { id: "INC-1", name: "Incident response", detail: "Watch owns incidents. Unacknowledged criticals escalate." },
  { id: "AI-1", name: "Human-in-the-loop", detail: "Architect cannot execute without Approve / Reject / Modify." },
];

export function Shield() {
  const products = useQuery({ queryKey: ["all-products"], queryFn: () => listAllProducts() });
  const inbox = useQuery({ queryKey: ["contact"], queryFn: () => listContact() });
  const ready = (products.data ?? []).filter((p) => p.vantaReady);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Trillion Shield</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vanta-aligned controls. The badge on a SKU means this map applies.
        </p>
      </div>
      <div className="grid gap-3">
        {CONTROLS.map((c) => (
          <div key={c.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
            <p className="font-mono text-xs text-sage">{c.id}</p>
            <p className="mt-1 font-medium">{c.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.detail}</p>
          </div>
        ))}
      </div>
      <div>
        <h2 className="font-display text-xl">Vanta-Ready catalog</h2>
        <ul className="mt-3 space-y-2">
          {ready.map((p) => (
            <li key={p.id} className="flex items-center gap-2 text-sm">
              {p.name} <VantaBadge />
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-display text-xl">Public inbox</h2>
        <ul className="mt-3 space-y-3">
          {(inbox.data ?? []).slice(0, 8).map((m) => (
            <li key={m.id} className="rounded-xl bg-card p-4 text-sm shadow-[var(--shadow-border)]">
              <div className="flex justify-between gap-2">
                <span className="font-medium">{m.name}</span>
                <Badge>{m.topic}</Badge>
              </div>
              <p className="mt-1 text-muted-foreground">{m.message}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
