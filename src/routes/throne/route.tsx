import { createFileRoute } from "@tanstack/react-router";
import { DashGate, DashShell } from "@/components/dash-shell";

export const Route = createFileRoute("/throne")({
  component: () => (
    <DashGate perm="enterThrone">
      <DashShell
        area="Master Command"
        title="Throne"
        items={[
          { to: "/throne", label: "Empire" },
          { to: "/throne/users", label: "Users" },
          { to: "/throne/products", label: "Products" },
          { to: "/throne/staff", label: "Staff" },
          { to: "/throne/security", label: "Security" },
          { to: "/throne/shield", label: "Shield" },
          { to: "/throne/analytics", label: "Analytics" },
          { to: "/throne/god-codes", label: "God Codes", perm: "godCodes" },
          { to: "/throne/recovery", label: "Recovery", perm: "recovery" },
          { to: "/throne/audit", label: "Audit" },
          { to: "/throne/architect", label: "Architect", perm: "architect" },
          { to: "/throne/sentinel", label: "Sentinel" },
        ]}
      />
    </DashGate>
  ),
});
