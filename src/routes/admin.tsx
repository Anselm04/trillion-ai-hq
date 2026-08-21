import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";
import { PublicShell } from "@/components/public-shell";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAccess } from "@/components/access-provider";
import { hasPerm } from "@/lib/trillion/roles";
import { isFounderEmail } from "@/lib/trillion/company";
import { Button } from "@/components/ui/button";
import { pageSeo } from "@/lib/seo";

type AdminSearch = { next?: string };

export const Route = createFileRoute("/admin")({
  validateSearch: (s: Record<string, unknown>): AdminSearch => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  head: () => pageSeo({ title: "Sign in", path: "/admin", noindex: true, description: "Private." }),
  component: AdminGate,
});

function AdminGate() {
  const { next } = Route.useSearch();
  const { user } = useCurrentUserState();
  const { access, loading } = useAccess();
  const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/in";

  if (user && (isFounderEmail(user.primaryEmail) || hasPerm(access.role, "enterThrone"))) {
    return <Navigate to="/throne" />;
  }
  if (user && hasPerm(access.role, "enterWatch")) return <Navigate to="/watch" />;
  if (user && hasPerm(access.role, "enterDesk")) return <Navigate to="/desk" />;

  if (user && !loading) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="font-display text-3xl">Sign in</h1>
          <p className="mt-4 text-sm text-muted-foreground">This account cannot open that page.</p>
          <Button asChild className="mt-8">
            <Link to="/account">Account</Link>
          </Button>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <AuthForm kind="admin" next={dest} />
    </PublicShell>
  );
}
