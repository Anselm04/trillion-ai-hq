import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";
import { PublicShell } from "@/components/public-shell";
import { pageSeo } from "@/lib/seo";

type LoginSearch = { next?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): LoginSearch => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  head: () => pageSeo({ title: "Sign in", path: "/login", noindex: true, description: "Sign in to Trillion AI Tech Ltd." }),
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  return (
    <PublicShell>
      <AuthForm kind="signin" next={next} />
    </PublicShell>
  );
}
