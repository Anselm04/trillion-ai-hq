import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { lookupUser } from "@/lib/trillion/identity";
import { formatPrice, formatWhen, roleLabel } from "@/lib/trillion/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/desk/users")({ component: Lookup });

type Result = Awaited<ReturnType<typeof lookupUser>>[number];

function Lookup() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Result[] | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <h1 className="font-display text-3xl">User lookup</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Support Lead console. Search by name or email.
      </p>
      <form
        className="mt-6 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          lookupUser({ data: q })
            .then(setRows)
            .finally(() => setBusy(false));
        }}
      >
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="email or name"
          className="sm:flex-1"
        />
        <Button type="submit" disabled={busy}>
          {busy ? "Searching…" : "Lookup"}
        </Button>
      </form>
      <div className="mt-6 grid gap-4">
        {(rows ?? []).map((r) => (
          <div key={r.userId} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl">{r.name || r.email}</h2>
              <Badge>{roleLabel(r.role)}</Badge>
              <Badge variant="outline">{r.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{r.email}</p>
            <h3 className="mt-4 text-xs tracking-[0.16em] text-faint uppercase">Orders</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {r.orders.length === 0 && <li className="text-muted-foreground">None</li>}
              {r.orders.map((o) => (
                <li key={o.id} className="flex justify-between gap-3">
                  <span>{o.productName}</span>
                  <span className="tabular-nums">
                    {formatPrice(o.amountCents, "one_time")} · {o.status}
                  </span>
                </li>
              ))}
            </ul>
            <h3 className="mt-4 text-xs tracking-[0.16em] text-faint uppercase">Subscriptions</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {r.subscriptions.length === 0 && <li className="text-muted-foreground">None</li>}
              {r.subscriptions.map((s) => (
                <li key={s.id}>
                  {s.productName} · {s.status}
                  {s.currentPeriodEnd ? ` · through ${formatWhen(s.currentPeriodEnd)}` : ""}
                </li>
              ))}
            </ul>
            <h3 className="mt-4 text-xs tracking-[0.16em] text-faint uppercase">Usage</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {r.usage.length === 0
                ? "No events"
                : r.usage.map((u) => `${u.eventType} ${u.count}`).join(" · ")}
            </p>
            <h3 className="mt-4 text-xs tracking-[0.16em] text-faint uppercase">Tickets</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {r.tickets.map((t) => (
                <li key={t.id}>
                  {t.subject} · {t.status}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
