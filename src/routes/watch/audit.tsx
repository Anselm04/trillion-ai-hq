import { createFileRoute } from "@tanstack/react-router";
import { AuditLogTable } from "@/routes/throne/audit";

export const Route = createFileRoute("/watch/audit")({ component: WatchAudit });

function WatchAudit() {
  return (
    <div>
      <h1 className="font-display text-3xl">Audit viewer</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Read-only view of the immutable log.</p>
      <AuditLogTable />
    </div>
  );
}
