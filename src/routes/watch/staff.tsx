import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { staffActivity } from "@/lib/trillion/command";
import { formatWhen } from "@/lib/trillion/format";

export const Route = createFileRoute("/watch/staff")({ component: StaffActivity });

function StaffActivity() {
  const q = useQuery({ queryKey: ["staff-activity"], queryFn: () => staffActivity() });
  return (
    <div>
      <h1 className="font-display text-3xl">Staff activity</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Actions in the last seven days.</p>
      <div className="grid gap-3">
        {(q.data ?? []).map((r) => (
          <div
            key={r.actorId ?? r.actorEmail}
            className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]"
          >
            <div>
              <p className="font-medium">{r.actorEmail ?? r.actorId}</p>
              <p className="text-xs text-faint">Last {formatWhen(r.lastAt)}</p>
            </div>
            <p className="font-mono tabular-nums text-sage">{r.actions}</p>
          </div>
        ))}
        {q.isSuccess && (q.data ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">No staff actions recorded yet.</p>
        )}
      </div>
    </div>
  );
}
