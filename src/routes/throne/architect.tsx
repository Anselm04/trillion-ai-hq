import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  architectStatus,
  decideArchitectTask,
  proposeArchitect,
  setArchitect,
} from "@/lib/trillion/command";
import { formatWhen } from "@/lib/trillion/format";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { hasPerm } from "@/lib/trillion/roles";
import { FOUNDER } from "@/lib/trillion/company";
import { useAccess } from "@/components/access-provider";

export const Route = createFileRoute("/throne/architect")({ component: Architect });

function Architect() {
  const { access } = useAccess();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["architect"], queryFn: () => architectStatus() });
  const [prompt, setPrompt] = useState("");
  const allow = hasPerm(access.role, "architect");
  const enabled = Boolean(q.data?.enabled);

  function refresh() {
    qc.invalidateQueries({ queryKey: ["architect"] });
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Architect</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Your operator while you are away. It proposes. You approve, reject, or modify. It has no
            independent execution path.
          </p>
        </div>
        {allow && (
          <label className="flex items-center gap-3 text-sm">
            <span>{enabled ? "Armed" : "Stood down"}</span>
            <Switch
              checked={enabled}
              onCheckedChange={(on) => {
                setArchitect({ data: on })
                  .then(refresh)
                  .catch((err: Error) => toast.error(err.message));
              }}
            />
          </label>
        )}
      </div>
      <div className="rounded-2xl bg-card p-5 text-sm text-muted-foreground shadow-[var(--shadow-border)]">
        Channels: this queue and {FOUNDER.commandEmail}. Approve, reject, or modify. Architect cannot
        act alone.
      </div>
      {allow && enabled && (
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            proposeArchitect({ data: prompt || "Review the empire and propose the next safe action." })
              .then(() => {
                toast.success("Architect filed a request");
                setPrompt("");
                refresh();
              })
              .catch((err: Error) => toast.error(err.message));
          }}
        >
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Tell Architect what to consider. It will ask first."
          />
          <Button type="submit">Request a proposal</Button>
        </form>
      )}
      <div className="grid gap-3">
        {(q.data?.tasks ?? []).map((t) => (
          <div key={t.id} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-medium">{t.title}</h2>
              <Badge>{t.status}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
            <pre className="mt-3 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs">
              {t.proposedAction}
            </pre>
            <p className="mt-2 text-xs text-faint">{formatWhen(t.createdAt)}</p>
            {allow && t.status === "pending" && (
              <div className="mt-4 flex flex-wrap gap-2">
                {(["approved", "rejected", "modified"] as const).map((d) => (
                  <Button
                    key={d}
                    size="sm"
                    variant={d === "approved" ? "sage" : "outline"}
                    onClick={() => {
                      const note = d === "modified" ? prompt || "Modified from Throne" : "";
                      decideArchitectTask({ data: { id: t.id, decision: d, note } })
                        .then(() => {
                          toast.success(d);
                          refresh();
                        })
                        .catch((err: Error) => toast.error(err.message));
                    }}
                  >
                    {d === "approved" ? "Approve" : d === "rejected" ? "Reject" : "Modify"}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
