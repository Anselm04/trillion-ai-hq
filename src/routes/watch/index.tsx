import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listIncidents, runScanner } from "@/lib/trillion/command";
import { AlertList } from "@/routes/throne/sentinel";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/watch/")({ component: Threats });

function Threats() {
  const scan = useQuery({ queryKey: ["scan"], queryFn: () => runScanner() });
  const incidents = useQuery({ queryKey: ["incidents"], queryFn: () => listIncidents() });
  const fail = (scan.data?.findings ?? []).filter((f) => !f.ok).length;
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Threat dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {fail === 0 ? "Watch is clear on the last scan." : `${fail} finding(s) need attention.`}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(incidents.data ?? [])
          .filter((i) => i.status === "open")
          .map((i) => (
            <Badge key={i.id} variant="danger">
              {i.title}
            </Badge>
          ))}
      </div>
      <AlertList manage />
    </div>
  );
}
