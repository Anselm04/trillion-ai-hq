import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyAccess } from "@/lib/trillion/identity";
import { GUEST_ACCESS } from "@/lib/trillion/roles";
import type { Access } from "@/lib/trillion/types";

type Ctx = { access: Access; loading: boolean; refresh: () => void };

const AccessContext = createContext<Ctx>({
  access: GUEST_ACCESS,
  loading: true,
  refresh: () => undefined,
});

export function AccessProvider({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const [access, setAccess] = useState<Access>(GUEST_ACCESS);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      setAccess(GUEST_ACCESS);
      setLoading(false);
      return;
    }
    let live = true;
    setLoading(true);
    getMyAccess()
      .then((a) => {
        if (live) setAccess(a);
      })
      .catch(() => {
        if (live) setAccess(GUEST_ACCESS);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [user, isPending, tick]);

  return (
    <AccessContext.Provider
      value={{ access, loading: isPending || loading, refresh: () => setTick((n) => n + 1) }}
    >
      {children}
    </AccessContext.Provider>
  );
}

export function useAccess() {
  return useContext(AccessContext);
}
