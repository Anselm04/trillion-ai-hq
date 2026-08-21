import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { empireOverview, runScanner, staffActivity } from "@/lib/trillion/command";
import { formatWhen } from "@/lib/trillion/format";

export const Route = createFileRoute("/watch/reports")({ component: Reports });

function Reports() {
  const empire = useQuery({ queryKey: ["empire"], queryFn: () => empireOverview() });
  const scan = useQuery({ queryKey: ["scan"], queryFn: () => runScanner() });
  const activity = useQuery({ queryKey: ["staff-activity"], queryFn: () => staffActivity() });
  const findings = scan.data?.findings ?? [];
  const passes = findings.filter((f) => f.ok).length;
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Reporting suite</h1>
        <p className="mt-1 text-sm text-muted-foreground">A briefing Watch can send to Throne.</p>
      </div>
      <article className="rounded-2xl bg-card p-6 text-sm leading-relaxed shadow-[var(--shadow-border)]">
        <p className="text-xs tracking-[0.18em] text-faint uppercase">Weekly posture</p>
        <p className="mt-4">
          Headquarters holds {empire.data?.people ?? "—"} identities and {empire.data?.staff ?? "—"} staff
          seats. Sentinel has {empire.data?.openAlerts ?? "—"} open alerts. {empire.data?.openIncidents ?? "—"}{" "}
          incident(s) remain open. Scanner: {passes}/{findings.length} controls passing as of{" "}
          {scan.data ? formatWhen(scan.data.scannedAt) : "—"}.
        </p>
        <p className="mt-3">
          Staff actions this week: {activity.data?.reduce((n, r) => n + r.actions, 0) ?? 0}. Architect is{" "}
          {empire.data?.architectOn ? "armed (approval-gated)" : "stood down"}.
        </p>
      </article>
    </div>
  );
}
