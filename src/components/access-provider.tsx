import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useCurrentUserState, type AppUser } from "@/lib/auth/use-current-user";
import { getMyAccess } from "@/lib/trillion/identity";
import { GUEST_ACCESS } from "@/lib/trillion/roles";
import { isFounderEmail } from "@/lib/trillion/company";
import { saveLastId } from "@/lib/auth/last-id";
import type { Access } from "@/lib/trillion/types";

type Ctx = { access: Access; loading: boolean; refresh: () => void };

const AccessContext = createContext<Ctx>({
  access: GUEST_ACCESS,
  loading: false,
  refresh: () => undefined,
});

function fromUser(user: AppUser, base: Access = GUEST_ACCESS): Access {
  if (isFounderEmail(user.primaryEmail)) {
    return {
      userId: user.id,
      email: user.primaryEmail,
      displayName: base.displayName || user.displayName || "Anselm Perkins",
      role: "throne",
      status: "active",
      godExpiresAt: null,
      department: "Command",
    };
  }
  return {
    ...base,
    userId: base.userId ?? user.id,
    email: base.email ?? user.primaryEmail,
    displayName: base.displayName ?? user.displayName,
  };
}

export function AccessProvider({ children }: { children: ReactNode }) {
  const { user } = useCurrentUserState();
  const [fetched, setFetched] = useState<Access>(GUEST_ACCESS);
  const [tick, setTick] = useState(0);
  const readyFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    saveLastId({
      name: user.displayName,
      email: user.primaryEmail,
      image: user.profileImageUrl,
      providerId: null,
    });
  }, [user?.id, user?.displayName, user?.primaryEmail, user?.profileImageUrl]);

  useEffect(() => {
    if (!user) {
      readyFor.current = null;
      setFetched((cur) => (cur === GUEST_ACCESS ? cur : GUEST_ACCESS));
      return;
    }
    if (isFounderEmail(user.primaryEmail)) {
      readyFor.current = user.id;
    }
    let live = true;
    getMyAccess()
      .then((a) => {
        if (!live) return;
        setFetched(fromUser(user, a));
        readyFor.current = user.id;
      })
      .catch(() => {
        if (!live) return;
        setFetched(fromUser(user));
        readyFor.current = user.id;
      });
    return () => {
      live = false;
    };
  }, [user?.id, tick]);

  const access = useMemo(() => {
    if (!user) return GUEST_ACCESS;
    if (isFounderEmail(user.primaryEmail)) return fromUser(user, fetched);
    return fetched.userId === user.id ? fetched : fromUser(user, fetched);
  }, [user, fetched]);

  const value = useMemo<Ctx>(
    () => ({ access, loading: false, refresh: () => setTick((n) => n + 1) }),
    [access],
  );

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess() {
  return useContext(AccessContext);
}
