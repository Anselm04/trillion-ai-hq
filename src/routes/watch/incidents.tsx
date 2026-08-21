import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listIncidents, resolveIncident, saveIncident } from "@/lib/trillion/command";
import { formatWhen } from "@/lib/trillion/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { canMutate, hasPerm } from "@/lib/trillion/roles";
import { useAccess } from "@/components/access-provider";

export const Route = createFileRoute("/watch/incidents")({ component: Incidents });

function Incidents() {
  const { access } = useAccess();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["incidents"], queryFn: () => listIncidents() });
  const allow = hasPerm(access.role, "manageIncidents") && canMutate(access.role);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Incident response</h1>
        <p className="mt-1 text-sm text-muted-foreground">Open, work, resolve. Audited.</p>
      </div>
      {allow && (
        <form
          className="grid gap-3 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            saveIncident({
              data: {
                title: String(fd.get("title") ?? ""),
                severity: String(fd.get("severity") ?? "medium"),
                summary: String(fd.get("summary") ?? ""),
              },
            })
              .then(() => {
                toast.success("Incident opened");
                qc.invalidateQueries({ queryKey: ["incidents"] });
                e.currentTarget.reset();
              })
              .catch((err: Error) => toast.error(err.message));
          }}
        >
          <Input name="title" placeholder="Title" required />
          <select
            name="severity"
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <Textarea name="summary" placeholder="Summary" />
          <Button type="submit">Open incident</Button>
        </form>
      )}
      <div className="grid gap-3">
        {(q.data ?? []).map((i) => (
          <div key={i.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-medium">{i.title}</h2>
              <div className="flex gap-2">
                <Badge variant={i.severity === "critical" ? "danger" : "outline"}>{i.severity}</Badge>
                <Badge>{i.status}</Badge>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{i.summary}</p>
            <p className="mt-1 text-xs text-faint">{formatWhen(i.createdAt)}</p>
            {allow && i.status !== "resolved" && (
              <Button
                size="sm"
                className="mt-3"
                variant="outline"
                onClick={() =>
                  resolveIncident({ data: i.id }).then(() =>
                    qc.invalidateQueries({ queryKey: ["incidents"] }),
                  )
                }
              >
                Resolve
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
