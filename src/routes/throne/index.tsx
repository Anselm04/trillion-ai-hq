import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { empireOverview } from "@/lib/trillion/command";
import { formatPrice, formatWhen } from "@/lib/trillion/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/throne/")({ component: Empire });

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader>
        <p className="text-xs tracking-[0.16em] text-faint uppercase">{label}</p>
        <CardTitle className="tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function Empire() {
  const q = useQuery({ queryKey: ["empire"], queryFn: () => empireOverview() });
  const d = q.data;
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Empire overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">The live state of Trillion AI.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="People" value={d?.people ?? "—"} />
        <Metric label="Staff seats" value={d?.staff ?? "—"} />
        <Metric label="Products" value={d?.products ?? "—"} />
        <Metric label="Revenue" value={formatPrice(d?.revenueCents ?? 0, "one_time")} />
        <Metric label="Open tickets" value={d?.openTickets ?? "—"} />
        <Metric label="Sentinel" value={d?.openAlerts ?? "—"} />
        <Metric label="Incidents" value={d?.openIncidents ?? "—"} />
        <Metric label="Architect" value={d?.architectOn ? "Armed" : "Stood down"} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Fourteen-day ledger</CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={d?.revenueByDay ?? []}>
              <XAxis dataKey="day" hide />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                }}
              />
              <Area
                type="monotone"
                dataKey="cents"
                stroke="var(--color-sage)"
                fill="var(--color-sage)"
                fillOpacity={0.18}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent audit</CardTitle>
          <Link to="/throne/audit" className="text-xs text-muted-foreground">
            Full log
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {(d?.recentAudit ?? []).map((a) => (
            <div key={a.id} className="flex justify-between gap-3 text-sm">
              <span>
                <span className="font-mono text-sage">{a.action}</span>
                <span className="text-muted-foreground"> · {a.actorEmail ?? "system"}</span>
              </span>
              <span className="text-xs text-faint">{formatWhen(a.createdAt)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
