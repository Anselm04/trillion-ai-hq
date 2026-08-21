import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { empireOverview } from "@/lib/trillion/command";
import { formatPrice, formatWhen } from "@/lib/trillion/format";

export const Route = createFileRoute("/throne/analytics")({ component: Analytics });

function Analytics() {
  const q = useQuery({
    queryKey: ["empire"],
    queryFn: () => empireOverview(),
    refetchInterval: 12_000,
  });
  const d = q.data;
  const views = d?.catalogViews14 ?? 0;
  const orders = d?.orders ?? 0;
  const conversion = views > 0 ? ((orders / views) * 100).toFixed(1) : "0.0";
  const byDay = d?.viewsByDay ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <div>
        <p className="text-[10px] tracking-[0.24em] text-sage uppercase">Admin</p>
        <h1 className="mt-3 font-display text-4xl">Analytics</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Catalog views, orders, and revenue. Updates while this page is open.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Stat label="Views · 14 days" value={d?.catalogViews14 ?? "—"} />
        <Stat label="Orders" value={d?.orders ?? "—"} />
        <Stat label="Revenue" value={formatPrice(d?.revenueCents ?? 0, "one_time")} />
        <Stat label="Conversion" value={`${conversion}%`} />
      </div>

      <section>
        <h2 className="font-display text-2xl">Views by day</h2>
        <div className="mt-6 h-72 rounded-2xl bg-card p-6 shadow-[var(--shadow-border)]">
          {byDay.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDay}>
                <XAxis dataKey="day" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                  }}
                />
                <Bar dataKey="views" fill="var(--color-gold)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="pt-16 text-sm text-muted-foreground">No views yet. This stays at zero until people open product pages.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl">Top products</h2>
        <div className="mt-6 space-y-4 rounded-2xl bg-card p-6 shadow-[var(--shadow-border)]">
          {(d?.viewsByProduct ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No product traffic yet.</p>
          )}
          {(d?.viewsByProduct ?? []).map((p) => (
            <div key={p.slug} className="flex justify-between gap-4 text-sm">
              <span>{p.name}</span>
              <span className="tabular-nums text-muted-foreground">{p.views}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl">Recent orders</h2>
        <div className="mt-6 space-y-4 rounded-2xl bg-card p-6 shadow-[var(--shadow-border)]">
          {(d?.recentOrders ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
          {(d?.recentOrders ?? []).map((o) => (
            <div key={o.id} className="flex justify-between gap-4 text-sm">
              <span>
                {o.productName}
                <span className="text-muted-foreground"> · {o.status}</span>
              </span>
              <span className="text-xs text-faint">{formatWhen(o.createdAt)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-card px-6 py-8 shadow-[var(--shadow-border)]">
      <p className="text-xs tracking-[0.16em] text-faint uppercase">{label}</p>
      <p className="mt-4 font-display text-4xl tabular-nums">{value}</p>
    </div>
  );
}
