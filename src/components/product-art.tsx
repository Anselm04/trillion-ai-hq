import { cn } from "@/lib/utils";
import { TrillionEmblem } from "@/components/trillion-mark";
import { categoryLabel } from "@/lib/trillion/brand";

export function ProductCover({
  name,
  category,
  imageUrl,
  className,
  priority = false,
}: {
  name: string;
  category: string;
  imageUrl?: string | null;
  className?: string;
  priority?: boolean;
}) {
  if (imageUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <img
          src={imageUrl}
          alt=""
          width={1200}
          height={750}
          decoding={priority ? "sync" : "async"}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "low"}
          className="size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden bg-muted px-6 py-5",
        className,
      )}
    >
      <TrillionEmblem className="pointer-events-none absolute -right-4 -bottom-6 h-36 w-36 opacity-[0.18]" />
      <p className="relative text-[10px] tracking-[0.28em] text-sage uppercase">{categoryLabel(category)}</p>
      <p className="relative font-display text-3xl leading-none tracking-tight text-foreground/90">{name}</p>
    </div>
  );
}
