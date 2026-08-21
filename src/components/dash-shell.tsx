import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import { TrillionWordmark } from "@/components/trillion-mark";
import { AuthSlot } from "@/components/auth-slot";
import { useAccess } from "@/components/access-provider";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { hasPerm, type Perm } from "@/lib/trillion/roles";
import { roleLabel } from "@/lib/trillion/format";
import { FOUNDER } from "@/lib/trillion/company";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type NavItem = { to: string; label: string; perm?: Perm };

export function DashGate({
  perm,
  children,
}: {
  perm: Perm;
  children: ReactNode;
}) {
  const { access, loading } = useAccess();
  if (loading) {
    return (
      <div className="flex min-h-screen bg-background p-6">
        <Skeleton className="h-full min-h-96 w-56 rounded-2xl" />
        <Skeleton className="ml-6 h-40 flex-1 rounded-2xl" />
      </div>
    );
  }
  if (!access.userId) return <RedirectToSignIn />;
  if (!hasPerm(access.role, perm)) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-3xl">Access denied</h1>
        <p className="text-sm text-muted-foreground">
          This surface is reserved. Sign in with a seat that holds {perm}, or redeem a God Code.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/redeem">Redeem code</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/">Home</Link>
          </Button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

function SideNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { access } = useAccess();
  const visible = items.filter((i) => !i.perm || hasPerm(access.role, i.perm));
  return (
    <nav className="flex flex-col gap-1">
      {visible.map((item) => {
        const isIndex = item.to.split("/").filter(Boolean).length === 1;
        const on = isIndex ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/");
        return (
          <Link
            key={item.to}
            to={item.to as "/"}
            onClick={onNavigate}
            className={cn(
              "rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
              on && "bg-muted text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashShell({
  area,
  title,
  items,
}: {
  area: string;
  title: string;
  items: NavItem[];
}) {
  const { access } = useAccess();
  const side = (
    <>
      <Link to="/" className="mb-6 block px-1">
        <TrillionWordmark />
      </Link>
      <p className="mb-3 px-3 text-[11px] tracking-[0.18em] text-faint uppercase">
        {area}
      </p>
      <SideNav items={items} />
    </>
  );
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-56 shrink-0 border-r border-border p-5 md:block">{side}</aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-border px-4">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-5">
                <SideNav items={items} />
              </SheetContent>
            </Sheet>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-[11px] text-muted-foreground">
                {access.role === "throne"
                  ? `${FOUNDER.name} · ${FOUNDER.titles}`
                  : roleLabel(access.role)}
              </p>
            </div>
          </div>
          <AuthSlot compact />
        </header>
        <div className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
