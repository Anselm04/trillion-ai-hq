import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { empireOverview } from "@/lib/trillion/command";
import { formatPrice } from "@/lib/trillion/format";
import { FOUNDER } from "@/lib/trillion/company";

export const Route = createFileRoute("/throne/")({ component: Empire });

const ROOMS = [
  { to: "/throne/analytics" as const, label: "Analytics", detail: "Views, orders, and revenue" },
  { to: "/throne/god-codes" as const, label: "God Codes", detail: "Issue Limited, Medium, Full, or Life" },
  { to: "/throne/products" as const, label: "Catalog", detail: "Add and remove products" },
  { to: "/throne/users" as const, label: "Users", detail: "Everyone who has signed in" },
  { to: "/throne/staff" as const, label: "Staff", detail: "Assign seats and roles" },
  { to: "/throne/security" as const, label: "Security", detail: "Alerts and Watch" },
  { to: "/throne/shield" as const, label: "Compliance", detail: "Trillion Shield" },
  { to: "/throne/audit" as const, label: "Audit", detail: "Immutable log" },
  { to: "/throne/architect" as const, label: "Architect", detail: "Approve AI requests" },
  { to: "/throne/sentinel" as const, label: "Sentinel", detail: "Staff-action alerts" },
  { to: "/throne/recovery" as const, label: "Recovery", detail: "Restore and rollback" },
];

function Empire() {
  const q = useQuery({
    queryKey: ["empire"],
    queryFn: () => empireOverview(),
    refetchInterval: 15_000,
  });
  const d = q.data;

  return (
    <div className="mx-auto max-w-4xl space-y-14">
      <div>
        <p className="text-[10px] tracking-[0.24em] text-sage uppercase">Admin</p>
        <h1 className="mt-3 font-display text-4xl">Overview</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {FOUNDER.name} · {FOUNDER.titles}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Stat label="Products" value={d?.products ?? "—"} />
        <Stat label="Views · 14 days" value={d?.catalogViews14 ?? "—"} />
        <Stat label="Orders" value={d?.orders ?? "—"} />
        <Stat label="Revenue" value={formatPrice(d?.revenueCents ?? 0, "one_time")} />
        <Stat label="People" value={d?.people ?? "—"} />
        <Stat label="Staff" value={d?.staff ?? "—"} />
      </div>

      <div>
        <h2 className="font-display text-2xl">Open a screen</h2>
        <p className="mt-2 text-sm text-muted-foreground">Each tool has its own page.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {ROOMS.map((r) => (
            <a
              key={r.to}
              href={r.to}
              className="block rounded-2xl bg-card px-6 py-7 shadow-[var(--shadow-border)] hover:bg-muted"
            >
              <p className="text-lg">{r.label}</p>
              <p className="mt-2 text-sm text-muted-foreground">{r.detail}</p>
            </a>
          ))}
        </div>
      </div>
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
