import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listTickets, setTicketStatus } from "@/lib/trillion/command";
import { formatWhen } from "@/lib/trillion/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { canMutate } from "@/lib/trillion/roles";
import { useAccess } from "@/components/access-provider";

export const Route = createFileRoute("/desk/tickets")({ component: Tickets });

function Tickets() {
  const { access } = useAccess();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["tickets"], queryFn: () => listTickets() });
  const allow = canMutate(access.role);
  return (
    <div>
      <h1 className="font-display text-3xl">Support queue</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Call-centre ready. Newest open first.</p>
      <div className="grid gap-3">
        {(q.data ?? []).map((t) => (
          <div key={t.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-medium">{t.subject}</h2>
              <div className="flex gap-2">
                <Badge>{t.priority}</Badge>
                <Badge variant="outline">{t.status}</Badge>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
            <p className="mt-1 text-xs text-faint">
              {t.requesterEmail ?? t.userId} · {formatWhen(t.createdAt)}
            </p>
            {allow && (
              <div className="mt-3 flex flex-wrap gap-2">
                {["pending", "resolved", "closed"].map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setTicketStatus({ data: { id: t.id, status: s } }).then(() =>
                        qc.invalidateQueries({ queryKey: ["tickets"] }),
                      )
                    }
                  >
                    {s}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
        {q.isSuccess && (q.data ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">Queue is clear.</p>
        )}
      </div>
    </div>
  );
}
