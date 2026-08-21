import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { analyzeAlert, listAlerts, updateAlert } from "@/lib/trillion/command";
import { formatWhen } from "@/lib/trillion/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hasPerm } from "@/lib/trillion/roles";
import { useAccess } from "@/components/access-provider";

export const Route = createFileRoute("/throne/sentinel")({ component: SentinelPage });

export function AlertList({ manage }: { manage: boolean }) {
  const { access } = useAccess();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["alerts"], queryFn: () => listAlerts() });
  const [analysis, setAnalysis] = useState<Record<number, string>>({});
  const can = manage && hasPerm(access.role, "sentinelManage");

  return (
    <div className="grid gap-3">
      {(q.data ?? []).map((a) => (
        <div key={a.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                a.severity === "critical" ? "danger" : a.severity === "warning" ? "warn" : "default"
              }
            >
              {a.severity}
            </Badge>
            <Badge variant={a.status === "escalated" ? "danger" : "outline"}>{a.status}</Badge>
            <h2 className="font-medium">{a.title}</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{a.detail}</p>
          <p className="mt-1 text-xs text-faint">
            {a.source} · {formatWhen(a.createdAt)}
          </p>
          {analysis[a.id] && <p className="mt-3 text-sm">{analysis[a.id]}</p>}
          {can && a.status !== "resolved" && (
            <div className="mt-3 flex flex-wrap gap-2">
              {a.status !== "acknowledged" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateAlert({ data: { id: a.id, status: "acknowledged" } }).then(() =>
                      qc.invalidateQueries({ queryKey: ["alerts"] }),
                    )
                  }
                >
                  Acknowledge
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  updateAlert({ data: { id: a.id, status: "resolved" } }).then(() =>
                    qc.invalidateQueries({ queryKey: ["alerts"] }),
                  )
                }
              >
                Resolve
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  analyzeAlert({ data: a.id })
                    .then((r) => setAnalysis((s) => ({ ...s, [a.id]: r.text })))
                    .catch((err: Error) => toast.error(err.message))
                }
              >
                Analyze
              </Button>
            </div>
          )}
        </div>
      ))}
      {q.isSuccess && (q.data ?? []).length === 0 && (
        <p className="text-sm text-muted-foreground">No alerts. Sentinel is quiet.</p>
      )}
    </div>
  );
}

function SentinelPage() {
  return (
    <div>
      <h1 className="font-display text-3xl">Sentinel</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Watches staff and security. Critical silence escalates here.
      </p>
      <AlertList manage />
    </div>
  );
}
