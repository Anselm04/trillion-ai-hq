import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { TrillionWordmark } from "@/components/trillion-mark";
import { AuthSlot } from "@/components/auth-slot";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { COMPANY, FOUNDER, MAIL } from "@/lib/trillion/company";
import type { ReactNode } from "react";

const LINKS = [
  { to: "/market" as const, label: "Market" },
  { to: "/about" as const, label: "About" },
  { to: "/team" as const, label: "Team" },
  { to: "/contact" as const, label: "Contact" },
];

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="shrink-0">
            <TrillionWordmark />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-muted-foreground hover:text-foreground"
                activeProps={{ className: "text-sm text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <AuthSlot />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-6">
                <TrillionWordmark />
                <nav className="mt-8 flex flex-col gap-4">
                  {LINKS.map((l) => (
                    <Link key={l.to} to={l.to} className="text-lg text-foreground">
                      {l.label}
                    </Link>
                  ))}
                  <Link to="/login" className="text-lg text-foreground">
                    Sign in
                  </Link>
                </nav>
                <div className="mt-8">
                  <AuthSlot compact />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
          <div>
            <TrillionWordmark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {COMPANY.legalName}. Founded by {FOUNDER.name}, {FOUNDER.titles}.
            </p>
          </div>
          <div className="text-sm">
            <p className="text-xs tracking-[0.18em] text-faint uppercase">House</p>
            <div className="mt-3 flex flex-col gap-2 text-muted-foreground">
              <Link to="/market">Market</Link>
              <Link to="/throne">Throne</Link>
              <Link to="/watch">Watch</Link>
              <Link to="/desk">Desk</Link>
            </div>
          </div>
          <div className="text-sm">
            <p className="text-xs tracking-[0.18em] text-faint uppercase">Contact</p>
            <div className="mt-3 flex flex-col gap-2 text-muted-foreground">
              <a href={`mailto:${MAIL.hello}`}>{MAIL.hello}</a>
              <a href={`mailto:${MAIL.support}`}>{MAIL.support}</a>
              <a href={`mailto:${MAIL.founder}`}>{MAIL.founder}</a>
              <p>{COMPANY.domain}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
