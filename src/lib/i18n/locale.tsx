import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  localeMeta,
  translate,
  type LocaleId,
  type MessageKey,
} from "./messages";

const STORAGE = "trillion-locale";

type Ctx = {
  locale: LocaleId;
  setLocale: (id: LocaleId) => void;
  t: (key: MessageKey, vars?: Record<string, string>) => string;
  dir: "ltr" | "rtl";
};

const LocaleContext = createContext<Ctx>({
  locale: DEFAULT_LOCALE,
  setLocale: () => undefined,
  t: (key) => translate(DEFAULT_LOCALE, key),
  dir: "ltr",
});

function readLocale(): LocaleId {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(STORAGE);
    if (stored && LOCALES.some((l) => l.id === stored)) return stored as LocaleId;
  } catch {
    /* ignore */
  }
  const nav = typeof navigator !== "undefined" ? navigator.language.slice(0, 2).toLowerCase() : "en";
  const match = LOCALES.find((l) => l.id === nav);
  return match?.id ?? DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleId>(readLocale);

  useEffect(() => {
    const meta = localeMeta(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = meta.dir;
    try {
      window.localStorage.setItem(STORAGE, locale);
    } catch {
      /* ignore */
    }
  }, [locale]);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale: (id) => setLocaleState(id),
      t: (key, vars) => translate(locale, key, vars),
      dir: localeMeta(locale).dir,
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  return useContext(LocaleContext);
}
