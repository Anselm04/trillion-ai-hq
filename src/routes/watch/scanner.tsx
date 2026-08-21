import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { runScanner } from "@/lib/trillion/command";
import { Badge } from "@/components/ui/badge";
import { formatWhen } from "@/lib/trillion/format";

export const Route = createFileRoute("/watch/scanner")({ component: Scanner });

function Scanner() {
  const q = useQuery({ queryKey: ["scan"], queryFn: () => runScanner() });
  return (
    <div>
      <h1 className="font-display text-3xl">Vulnerability scanner</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Live checks against the headquarters itself — not a theatre list of CVEs.
        {q.data ? ` Scanned ${formatWhen(q.data.scannedAt)}.` : ""}
      </p>
      <div className="grid gap-3">
        {(q.data?.findings ?? []).map((f) => (
          <div key={f.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
            <Badge variant={f.ok ? "sage" : "warn"}>{f.ok ? "Pass" : "Finding"}</Badge>
            <p className="mt-2 font-medium">{f.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{f.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
