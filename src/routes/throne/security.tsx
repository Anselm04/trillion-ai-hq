import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listAlerts, listIncidents, runScanner } from "@/lib/trillion/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/throne/security")({ component: Security });

function Security() {
  const alerts = useQuery({ queryKey: ["alerts"], queryFn: () => listAlerts() });
  const incidents = useQuery({ queryKey: ["incidents"], queryFn: () => listIncidents() });
  const scan = useQuery({ queryKey: ["scan"], queryFn: () => runScanner() });
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Security oversight</h1>
        <p className="mt-1 text-sm text-muted-foreground">Throne view of Watch. Full work happens on /watch.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {(scan.data?.findings ?? []).slice(0, 3).map((f) => (
          <div key={f.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
            <Badge variant={f.ok ? "sage" : "warn"}>{f.ok ? "Clear" : "Attention"}</Badge>
            <p className="mt-3 font-medium">{f.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{f.detail}</p>
          </div>
        ))}
      </div>
      <Button asChild variant="outline">
        <Link to="/watch">Open Watch</Link>
      </Button>
      <div>
        <h2 className="font-display text-xl">Open alerts</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(alerts.data ?? [])
            .filter((a) => a.status === "open" || a.status === "escalated")
            .slice(0, 8)
            .map((a) => (
              <li key={a.id} className="flex justify-between gap-3">
                <span>{a.title}</span>
                <Badge variant={a.severity === "critical" ? "danger" : "warn"}>{a.severity}</Badge>
              </li>
            ))}
        </ul>
      </div>
      <div>
        <h2 className="font-display text-xl">Incidents</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(incidents.data ?? []).slice(0, 8).map((i) => (
            <li key={i.id} className="flex justify-between gap-3">
              <span>{i.title}</span>
              <Badge>{i.status}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
