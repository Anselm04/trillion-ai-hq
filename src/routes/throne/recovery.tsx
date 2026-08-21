import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { exportSnapshot } from "@/lib/trillion/command";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/throne/recovery")({ component: Recovery });

function Recovery() {
  const [json, setJson] = useState<string | null>(null);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Disaster recovery</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Export the catalog, staff seats, and Architect state. Restore is a future Product Factory
          step — this seat never silently drops the database.
        </p>
      </div>
      <Button
        onClick={() => {
          exportSnapshot()
            .then((snap) => {
              setJson(snap.payload);
              toast.success("Snapshot taken and audited");
            })
            .catch((err: Error) => toast.error(err.message));
        }}
      >
        Export snapshot
      </Button>
      {json && (
        <pre className="max-h-96 overflow-auto rounded-2xl bg-card p-4 font-mono text-xs shadow-[var(--shadow-border)]">
          {json}
        </pre>
      )}
    </div>
  );
}
