import { cn } from "@/lib/utils";

export function TrillionMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <rect x="4" y="14" width="6" height="12" rx="1" className="fill-foreground" />
      <rect x="13" y="6" width="6" height="20" rx="1" className="fill-sage" />
      <rect x="22" y="10" width="6" height="16" rx="1" className="fill-foreground" />
    </svg>
  );
}

export function TrillionWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <TrillionMark size={22} />
      <span className="font-display text-[15px] font-semibold tracking-tight">Trillion AI</span>
    </span>
  );
}
