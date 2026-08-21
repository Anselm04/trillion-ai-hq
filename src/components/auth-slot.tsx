import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAccess } from "@/components/access-provider";
import { hasPerm } from "@/lib/trillion/roles";
import { useI18n } from "@/lib/i18n/locale";

export function AuthSlot({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const { user, isPending } = useCurrentUserState();
  const { access } = useAccess();
  const [out, setOut] = useState(false);

  if (isPending) {
    return (
      <Link to="/login" className="inline-flex h-10 min-w-[5.5rem] shrink-0 items-center justify-end text-sm text-foreground">
        {t("nav.signIn")}
      </Link>
    );
  }
  if (!user) {
    return (
      <Link to="/login" className="inline-flex h-10 min-w-[5.5rem] shrink-0 items-center justify-end text-sm text-foreground">
        {t("nav.signIn")}
      </Link>
    );
  }
  return (
    <div className="flex shrink-0 items-center gap-5 text-sm">
      {hasPerm(access.role, "enterThrone") ? (
        <Link to="/throne" className="text-sage">
          {t("nav.admin")}
        </Link>
      ) : (
        <Link to="/account" className="text-muted-foreground">
          {t("nav.account")}
        </Link>
      )}
      <button
        type="button"
        disabled={out}
        className="text-muted-foreground hover:text-foreground"
        onClick={() => {
          setOut(true);
          void signOut("/").catch(() => setOut(false));
        }}
      >
        {out ? "…" : compact ? t("nav.account") : "Sign out"}
      </button>
    </div>
  );
}
