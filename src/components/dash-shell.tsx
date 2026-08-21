import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { TrillionWordmark } from "@/components/trillion-mark";
import { AuthSlot } from "@/components/auth-slot";
import { SiteControls } from "@/components/site-controls";
import { useAccess } from "@/components/access-provider";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { hasPerm, type Perm } from "@/lib/trillion/roles";
import { roleLabel } from "@/lib/trillion/format";
import { FOUNDER, adminOpenRemembered, forgetAdminOpen, isFounderEmail } from "@/lib/trillion/company";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

export type NavItem = { to: string; label: string; perm?: Perm };

export function DashGate({
  perm,
  children,
}: {
  perm: Perm;
  children: ReactNode;
}) {
  const { user } = useCurrentUserState();
  const { access } = useAccess();
  const allowed =
    isFounderEmail(user?.primaryEmail) || hasPerm(access.role, perm) || (!user && adminOpenRemembered());

  if (allowed) return <>{children}</>;
  if (user) {
    forgetAdminOpen();
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-3xl">Access denied</h1>
        <p className="text-sm text-muted-foreground">You do not have access to this page.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/">Home</Link>
          </Button>
        </div>
      </div>
    );
  }
  return <RedirectToSignIn to="/login" />;
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
          <a
            key={item.to}
            href={item.to}
            onClick={onNavigate}
            className={cn(
              "rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
              on && "bg-muted text-foreground",
            )}
          >
            {item.label}
          </a>
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
  const [open, setOpen] = useState(false);
  const side = (
    <>
      <Link to="/" className="mb-6 block px-1">
        <TrillionWordmark />
      </Link>
      <p className="mb-3 px-3 text-[11px] tracking-[0.18em] text-faint uppercase">{area}</p>
      <SideNav items={items} onNavigate={() => setOpen(false)} />
      <div className="mt-8 px-1">
        <SiteControls compact />
      </div>
    </>
  );
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border p-6 md:block">{side}</aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-border px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="grid size-11 shrink-0 place-items-center rounded-md hover:bg-muted md:hidden"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-medium">
                {title}
                {area === "Admin" && (
                  <span className="rounded-full bg-sage/15 px-2 py-0.5 text-[10px] tracking-[0.18em] text-sage uppercase">
                    Admin
                  </span>
                )}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {access.role === "throne"
                  ? `${FOUNDER.name} · ${FOUNDER.titles}`
                  : roleLabel(access.role)}
              </p>
            </div>
          </div>
          <AuthSlot compact />
        </header>
        {open && <div className="border-b border-border p-4 md:hidden">{side}</div>}
        <div className="flex-1 overflow-x-hidden p-6 sm:p-10 lg:p-14">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
