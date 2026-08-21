import { Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Plan } from "@/lib/trillion/plans";
import { MAIL } from "@/lib/trillion/company";
import type { FormEvent, ReactNode } from "react";

export function ProductLine({
  kicker,
  title,
  lede,
  plans,
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  plans: Plan[];
  children?: ReactNode;
}) {
  function onCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get("code") ?? "").trim();
    window.location.href = code ? `/redeem?code=${encodeURIComponent(code)}` : "/redeem";
  }

  return (
    <PublicShell>
      <article className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <p className="text-[10px] tracking-[0.28em] text-sage uppercase">{kicker}</p>
        <h1 className="mt-4 font-display text-5xl sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{lede}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/signup">Create account</Link>
          </Button>
          <Button asChild variant="outline">
            <a href={`mailto:${MAIL.hello}`}>Talk to sales</a>
          </Button>
        </div>

        <form
          className="mt-12 max-w-md rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]"
          onSubmit={onCode}
        >
          <Label htmlFor="code">Access Code</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            God Codes from Admin unlock a seat. Invalid or expired codes are rejected.
          </p>
          <div className="mt-3 flex gap-2">
            <Input id="code" name="code" placeholder="Enter code" autoComplete="off" />
            <Button type="submit">Redeem</Button>
          </div>
        </form>

        <h2 className="mt-16 font-display text-3xl">Plans</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
              <p className="text-xs tracking-[0.18em] text-sage uppercase">{p.name}</p>
              <p className="mt-3 font-display text-3xl">{p.price}</p>
              <p className="mt-2 text-sm text-muted-foreground">{p.detail}</p>
            </div>
          ))}
        </div>
        {children}
      </article>
    </PublicShell>
  );
}
