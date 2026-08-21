const KEY = "trillion-last-id";

export type LastId = {
  name: string | null;
  email: string | null;
  image: string | null;
  providerId: string | null;
};

export function readLastId(): LastId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastId;
    if (!parsed || (!parsed.email && !parsed.providerId)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveLastId(next: LastId) {
  if (typeof window === "undefined") return;
  try {
    const prev = readLastId();
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        name: next.name ?? prev?.name ?? null,
        email: next.email ?? prev?.email ?? null,
        image: next.image ?? prev?.image ?? null,
        providerId: next.providerId ?? prev?.providerId ?? null,
      }),
    );
  } catch {
    /* ignore */
  }
}

export function clearLastId() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
