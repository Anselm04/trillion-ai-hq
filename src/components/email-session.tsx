import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EmailSession({ next }: { next: string }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result =
      mode === "up"
        ? await authClient.signUp.email({
            email: email.trim(),
            password,
            name: name.trim() || email.split("@")[0]!,
          })
        : await authClient.signIn.email({ email: email.trim(), password });
    if (result.error) {
      setBusy(false);
      setError(result.error.message ?? "Could not sign in");
      return;
    }
    for (let i = 0; i < 8; i += 1) {
      const session = await authClient.getSession();
      if (session.data?.user) break;
      await new Promise((r) => window.setTimeout(r, 80));
    }
    window.location.replace(next);
  }

  return (
    <form className="mt-6 grid max-w-md gap-3" onSubmit={onSubmit}>
      {mode === "up" && (
        <div className="grid gap-1.5">
          <Label htmlFor="session-name">Name</Label>
          <Input id="session-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
      )}
      <div className="grid gap-1.5">
        <Label htmlFor="session-email">Email</Label>
        <Input
          id="session-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="session-password">Password</Label>
        <Input
          id="session-password"
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={mode === "up" ? "new-password" : "current-password"}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={busy}>
        {busy ? "Please wait…" : mode === "up" ? "Create account" : "Sign in"}
      </Button>
      <button
        type="button"
        className="text-left text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setMode(mode === "up" ? "in" : "up")}
      >
        {mode === "up" ? "Already have an account? Sign in" : "Need an account? Create one"}
      </button>
    </form>
  );
}
