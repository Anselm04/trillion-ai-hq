import { createFileRoute } from "@tanstack/react-router";
import { DashGate, DashShell } from "@/components/dash-shell";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/watch")({
  head: () => pageSeo({ title: "Security", path: "/watch", noindex: true, description: "Private." }),
  component: () => (
    <DashGate perm="enterWatch">
      <DashShell
        area="Security"
        title="Watch"
        items={[
          { to: "/watch", label: "Threats" },
          { to: "/watch/staff", label: "Staff activity" },
          { to: "/watch/scanner", label: "Scanner" },
          { to: "/watch/incidents", label: "Incidents" },
          { to: "/watch/audit", label: "Audit" },
          { to: "/watch/reports", label: "Reports" },
        ]}
      />
    </DashGate>
  ),
});
