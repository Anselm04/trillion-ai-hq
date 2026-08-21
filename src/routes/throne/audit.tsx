import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listAudit } from "@/lib/trillion/command";
import { formatWhen } from "@/lib/trillion/format";

export const Route = createFileRoute("/throne/audit")({ component: Audit });

export function AuditLogTable() {
  const q = useQuery({ queryKey: ["audit"], queryFn: () => listAudit() });
  return (
    <div className="overflow-x-auto rounded-2xl bg-card shadow-[var(--shadow-border)]">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="text-xs text-faint">
          <tr>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Actor</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Detail</th>
          </tr>
        </thead>
        <tbody>
          {(q.data ?? []).map((a) => (
            <tr key={a.id} className="border-t border-border">
              <td className="px-4 py-3 text-xs text-faint whitespace-nowrap">{formatWhen(a.createdAt)}</td>
              <td className="px-4 py-3 text-muted-foreground">{a.actorEmail ?? "system"}</td>
              <td className="px-4 py-3 font-mono text-sage">{a.action}</td>
              <td className="px-4 py-3 text-muted-foreground">{a.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Audit() {
  return (
    <div>
      <h1 className="font-display text-3xl">Immutable audit</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Append-only. There is no edit or delete in the application.
      </p>
      <AuditLogTable />
    </div>
  );
}
