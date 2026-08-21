import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";
import { PublicShell } from "@/components/public-shell";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/signup")({
  head: () => pageSeo({ title: "Create account", path: "/signup", noindex: true, description: "Create an account with Trillion AI Tech Ltd." }),
  component: Signup,
});

function Signup() {
  return (
    <PublicShell>
      <AuthForm kind="signup" />
    </PublicShell>
  );
}
