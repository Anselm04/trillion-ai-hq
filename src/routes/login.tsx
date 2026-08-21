import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { TrillionMark } from "@/components/trillion-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicShell } from "@/components/public-shell";
import { FOUNDER } from "@/lib/trillion/company";

type LoginSearch = { next?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): LoginSearch => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const callbackURL = next || "/account";
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result =
      mode === "up"
        ? await authClient.signUp.email({ email, password, name: name || email.split("@")[0]! })
        : await authClient.signIn.email({ email, password });
    setBusy(false);
    if (result.error) {
      setError(result.error.message ?? "Could not sign in");
      return;
    }
    window.location.href = callbackURL;
  }

  return (
    <PublicShell>
      <div className="mx-auto grid max-w-md gap-8 px-4 py-16 sm:px-6">
        <div className="text-center">
          <div className="flex justify-center">
            <TrillionMark size={36} />
          </div>
          <h1 className="mt-6 font-display text-3xl">Command access</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Throne is reserved for {FOUNDER.name}. Sign in with{" "}
            <span className="text-foreground">{FOUNDER.commandEmail}</span> — Google or email.
            Everyone else enters as a customer until staffed from Throne.
          </p>
        </div>
        {authEnabled ? (
          <div className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
            <div className="grid gap-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="outline"
                  onClick={() => signIn(p.providerId, { callbackURL })}
                >
                  Continue with {p.label}
                </Button>
              ))}
            </div>
            <p className="my-5 text-center text-xs text-faint">or email</p>
            <form className="grid gap-3" onSubmit={onEmail}>
              {mode === "up" && (
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              )}
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={FOUNDER.commandEmail}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={busy}>
                {busy ? "Please wait…" : mode === "up" ? "Create account" : "Sign in"}
              </Button>
            </form>
            <button
              type="button"
              className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setMode(mode === "up" ? "in" : "up")}
            >
              {mode === "up" ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sign-in is disabled.</p>
        )}
        <p className="text-center text-xs text-faint">
          Have a God Code?{" "}
          <Link to="/redeem" className="underline">
            Redeem it
          </Link>
        </p>
      </div>
    </PublicShell>
  );
}
