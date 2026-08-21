import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { empireOverview } from "@/lib/trillion/command";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/trillion/format";

export const Route = createFileRoute("/throne/analytics")({ component: Analytics });

function Analytics() {
  const q = useQuery({ queryKey: ["empire"], queryFn: () => empireOverview() });
  const d = q.data;
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ledger, catalog, and people — live, not sampled.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <p className="text-xs text-faint">Paid orders</p>
            <CardTitle className="tabular-nums">{d?.orders ?? "—"}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-xs text-faint">Revenue</p>
            <CardTitle className="tabular-nums">{formatPrice(d?.revenueCents ?? 0, "one_time")}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-xs text-faint">Identities</p>
            <CardTitle className="tabular-nums">{d?.people ?? "—"}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Revenue by day</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d?.revenueByDay ?? []}>
              <XAxis dataKey="day" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                }}
              />
              <Bar dataKey="cents" fill="var(--color-paper)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
