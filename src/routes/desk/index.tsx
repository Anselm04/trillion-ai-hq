import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccess } from "@/components/access-provider";
import { hasPerm } from "@/lib/trillion/roles";
import { roleLabel } from "@/lib/trillion/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/desk/")({ component: DeskHome });

function DeskHome() {
  const { access } = useAccess();
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Desk</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as {roleLabel(access.role)}
          {access.department ? ` · ${access.department}` : ""}. Tools appear by seat.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {hasPerm(access.role, "manageProducts") && (
          <div className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-xl">Catalog</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Publish and retire products without a deploy.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/desk/products">Products</Link>
            </Button>
          </div>
        )}
        {hasPerm(access.role, "tickets") && (
          <div className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-xl">Tickets</h2>
            <p className="mt-2 text-sm text-muted-foreground">Call-centre queue. Work every open thread.</p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/desk/tickets">Tickets</Link>
            </Button>
          </div>
        )}
        {hasPerm(access.role, "supportLookup") && (
          <div className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-xl">Lookup</h2>
            <p className="mt-2 text-sm text-muted-foreground">Subscriber, orders, usage, tickets.</p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/desk/users">Lookup</Link>
            </Button>
          </div>
        )}
        {hasPerm(access.role, "compliance") && (
          <div className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-xl">Shield</h2>
            <p className="mt-2 text-sm text-muted-foreground">Inbox and Vanta-aligned control map.</p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/desk/compliance">Compliance</Link>
            </Button>
          </div>
        )}
        {hasPerm(access.role, "marketing") && (
          <div className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-xl">Campaigns</h2>
            <p className="mt-2 text-sm text-muted-foreground">Draft and ship market notes.</p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/desk/campaigns">Campaigns</Link>
            </Button>
          </div>
        )}
        {!hasPerm(access.role, "manageProducts") &&
          !hasPerm(access.role, "tickets") &&
          !hasPerm(access.role, "supportLookup") && (
            <p className="text-sm text-muted-foreground">
              This pass is view-only. Use the public Market, or ask Throne for a higher God Code.
            </p>
          )}
      </div>
    </div>
  );
}
