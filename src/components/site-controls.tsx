import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useI18n } from "@/lib/i18n/locale";
import { LOCALES, type LocaleId } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

export function SiteControls({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();

  return (
    <div className={cn("flex flex-col gap-4", compact && "gap-3")}>
      <div
        className="flex h-9 w-fit items-center rounded-full border border-border p-0.5"
        role="group"
        aria-label={theme === "day" ? t("theme.day") : t("theme.night")}
      >
        <button
          type="button"
          onClick={() => setTheme("night")}
          className={cn(
            "grid size-8 place-items-center rounded-full",
            theme === "night" ? "bg-sage text-sage-foreground" : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={theme === "night"}
          title={t("theme.night")}
        >
          <Moon className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setTheme("day")}
          className={cn(
            "grid size-8 place-items-center rounded-full",
            theme === "day" ? "bg-sage text-sage-foreground" : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={theme === "day"}
          title={t("theme.day")}
        >
          <Sun className="size-3.5" />
        </button>
      </div>
      <div>
        <p className="text-[10px] tracking-[0.2em] text-faint uppercase">{t("lang.label")}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {LOCALES.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLocale(l.id as LocaleId)}
              className={cn(
                "h-8 rounded-full px-3 text-xs",
                locale === l.id
                  ? "bg-sage text-sage-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              aria-pressed={locale === l.id}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
