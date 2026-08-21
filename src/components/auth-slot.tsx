import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAccess } from "@/components/access-provider";
import { hasPerm, isStaff } from "@/lib/trillion/roles";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthSlot({ compact = false }: { compact?: boolean }) {
  const { user, isPending } = useCurrentUserState();
  const { access, loading } = useAccess();
  if (isPending || (user && loading)) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }
  if (!user) {
    return (
      <Button asChild size={compact ? "sm" : "default"} variant="outline">
        <Link to="/login">Sign in</Link>
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-3">
      {isStaff(access.role) && !compact && (
        <div className="hidden items-center gap-2 sm:flex">
          {hasPerm(access.role, "enterThrone") && (
            <Link to="/throne" className="text-xs text-muted-foreground hover:text-foreground">
              Throne
            </Link>
          )}
          {hasPerm(access.role, "enterWatch") && (
            <Link to="/watch" className="text-xs text-muted-foreground hover:text-foreground">
              Watch
            </Link>
          )}
          {hasPerm(access.role, "enterDesk") && (
            <Link to="/desk" className="text-xs text-muted-foreground hover:text-foreground">
              Desk
            </Link>
          )}
        </div>
      )}
      <Link to="/account" className="text-xs text-muted-foreground hover:text-foreground">
        Account
      </Link>
      <UserButton />
    </div>
  );
}
