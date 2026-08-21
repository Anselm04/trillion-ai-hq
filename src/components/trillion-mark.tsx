import { cn } from "@/lib/utils";

export function TrillionMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="60" height="60" rx="14" className="stroke-sage" strokeWidth="2.2" />
      <rect x="8" y="8" width="48" height="48" rx="10" className="stroke-sage/40" strokeWidth="1" />
      <path d="M18 18h28v7H36.2V46h-8.4V25H18z" className="fill-sage" />
    </svg>
  );
}

export function TrillionWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <TrillionMark size={36} />
      <span className="font-sans text-[15px] font-semibold tracking-[0.04em] sm:text-[18px]">
        Trillion AI Tech Ltd
        <sup className="ml-0.5 text-[9px] tracking-normal text-sage">™</sup>
      </span>
    </span>
  );
}

export function TrillionEmblem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={80} height={80} fill="none" className={cn("text-sage", className)} aria-hidden="true">
      <rect x="1.5" y="1.5" width="61" height="61" rx="16" stroke="currentColor" strokeWidth="1.6" />
      <rect x="8" y="8" width="48" height="48" rx="11" stroke="currentColor" strokeWidth="0.8" opacity="0.45" />
      <path d="M17 17.5h30v8H36.5V47h-9V25.5H17z" fill="currentColor" />
    </svg>
  );
}
