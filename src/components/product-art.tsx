import { cn } from "@/lib/utils";
import type { Category } from "@/lib/trillion/types";

export function ProductArt({
  slug,
  category,
  className,
}: {
  slug: string;
  category: Category | string;
  className?: string;
}) {
  const n = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rotate = (n % 12) - 6;
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        className,
      )}
      aria-hidden="true"
    >
      <div className="bg-grid absolute inset-0 opacity-60" />
      <svg viewBox="0 0 160 100" className="relative h-full w-full">
        {category === "agent" && (
          <g transform={`rotate(${rotate} 80 50)`}>
            <circle cx="80" cy="50" r="22" className="stroke-sage" fill="none" strokeWidth="1.5" />
            <circle cx="80" cy="50" r="8" className="fill-sage" />
            <path d="M80 18 v10 M80 72 v10 M18 50 h10 M132 50 h10" className="stroke-foreground/50" strokeWidth="1.2" />
          </g>
        )}
        {category === "software" && (
          <g>
            <rect x="30" y="22" width="100" height="56" rx="6" className="stroke-foreground/40" fill="none" strokeWidth="1.4" />
            <rect x="38" y="32" width="50" height="8" rx="2" className="fill-sage/80" />
            <rect x="38" y="46" width="84" height="4" rx="1" className="fill-foreground/25" />
            <rect x="38" y="56" width="70" height="4" rx="1" className="fill-foreground/18" />
            <rect x="38" y="66" width="40" height="4" rx="1" className="fill-foreground/12" />
          </g>
        )}
        {category === "app" && (
          <g>
            <rect x="48" y="14" width="64" height="72" rx="10" className="stroke-foreground/45" fill="none" strokeWidth="1.4" />
            <rect x="58" y="28" width="44" height="6" rx="2" className="fill-sage" />
            <rect x="58" y="40" width="44" height="28" rx="3" className="fill-foreground/10" />
          </g>
        )}
        {category === "tool" && (
          <g transform={`rotate(${rotate} 80 50)`}>
            <path d="M40 70 L78 32 L92 46 L54 84 Z" className="stroke-foreground/50" fill="none" strokeWidth="1.4" />
            <circle cx="108" cy="34" r="16" className="stroke-sage" fill="none" strokeWidth="1.6" />
          </g>
        )}
        {category === "game" && (
          <g>
            <rect x="28" y="28" width="18" height="18" className="fill-foreground/25" />
            <rect x="52" y="28" width="18" height="18" className="fill-sage/70" />
            <rect x="76" y="28" width="18" height="18" className="fill-foreground/15" />
            <rect x="40" y="52" width="18" height="18" className="fill-foreground/20" />
            <rect x="64" y="52" width="18" height="18" className="fill-foreground/40" />
            <rect x="88" y="52" width="18" height="18" className="fill-sage/40" />
          </g>
        )}
      </svg>
    </div>
  );
}
