import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAccess } from "@/components/access-provider";
import { hasPerm } from "@/lib/trillion/roles";
import { adminOpenRemembered, isFounderEmail, rememberAdminOpen } from "@/lib/trillion/company";

export const Route = createFileRoute("/in")({ component: AfterSignIn });

function AfterSignIn() {
  const { user } = useCurrentUserState();
  const { access } = useAccess();

  if (!user) {
    if (adminOpenRemembered()) return <Navigate to="/throne" />;
    return <Navigate to="/login" />;
  }

  const founder = isFounderEmail(user.primaryEmail) || isFounderEmail(access.email);
  if (founder || hasPerm(access.role, "enterThrone")) {
    rememberAdminOpen();
    return <Navigate to="/throne" />;
  }
  if (hasPerm(access.role, "enterWatch")) return <Navigate to="/watch" />;
  if (hasPerm(access.role, "enterDesk")) return <Navigate to="/desk" />;
  return <Navigate to="/account" />;
}
