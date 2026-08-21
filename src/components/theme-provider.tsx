import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "night" | "day";
const STORAGE = "trillion-theme";

type Ctx = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };

const ThemeContext = createContext<Ctx>({
  theme: "night",
  setTheme: () => undefined,
  toggle: () => undefined,
});

function apply(theme: Theme) {
  document.documentElement.classList.toggle("light", theme === "day");
  document.documentElement.style.colorScheme = theme === "day" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("night");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE);
      const next: Theme = stored === "day" ? "day" : "night";
      setThemeState(next);
      apply(next);
    } catch {
      apply("night");
    }
  }, []);

  function setTheme(next: Theme) {
    setThemeState(next);
    apply(next);
    try {
      window.localStorage.setItem(STORAGE, next);
    } catch {
      /* ignore */
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle: () => setTheme(theme === "night" ? "day" : "night") }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
