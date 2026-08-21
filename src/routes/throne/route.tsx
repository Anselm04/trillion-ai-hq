import { createFileRoute } from "@tanstack/react-router";
import { DashGate, DashShell } from "@/components/dash-shell";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/throne")({
  head: () => pageSeo({ title: "Admin", path: "/throne", noindex: true, description: "Private." }),
  component: () => (
    <DashGate perm="enterThrone">
      <DashShell
        area="Admin"
        title="Master Control"
        items={[
          { to: "/throne", label: "Overview" },
          { to: "/throne/products", label: "Catalog" },
          { to: "/throne/payments", label: "Payments" },
          { to: "/throne/analytics", label: "Analytics" },
          { to: "/throne/users", label: "Users" },
          { to: "/throne/staff", label: "Staff" },
          { to: "/throne/security", label: "Security" },
          { to: "/throne/shield", label: "Compliance" },
          { to: "/throne/god-codes", label: "God Codes" },
          { to: "/throne/recovery", label: "Recovery", perm: "recovery" },
          { to: "/throne/audit", label: "Audit" },
          { to: "/throne/architect", label: "Architect", perm: "architect" },
          { to: "/throne/sentinel", label: "Sentinel" },
        ]}
      />
    </DashGate>
  ),
});
