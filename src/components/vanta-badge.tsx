import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function VantaBadge() {
  return (
    <Badge variant="sage" className="gap-1">
      <ShieldCheck className="size-3" />
      Vanta-Ready
    </Badge>
  );
}
