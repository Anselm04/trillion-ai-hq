import { createFileRoute } from "@tanstack/react-router";
import { DashGate, DashShell } from "@/components/dash-shell";

export const Route = createFileRoute("/desk")({
  component: () => (
    <DashGate perm="enterDesk">
      <DashShell
        area="Staff"
        title="Desk"
        items={[
          { to: "/desk", label: "Home" },
          { to: "/desk/products", label: "Products", perm: "manageProducts" },
          { to: "/desk/tickets", label: "Tickets", perm: "tickets" },
          { to: "/desk/users", label: "User lookup", perm: "supportLookup" },
          { to: "/desk/compliance", label: "Compliance", perm: "compliance" },
          { to: "/desk/campaigns", label: "Campaigns", perm: "marketing" },
        ]}
      />
    </DashGate>
  ),
});
