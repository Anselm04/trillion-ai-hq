import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { generateGodCode, listGodCodes } from "@/lib/trillion/command";
import { formatWhen } from "@/lib/trillion/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { hasPerm } from "@/lib/trillion/roles";
import { useAccess } from "@/components/access-provider";

export const Route = createFileRoute("/throne/god-codes")({ component: GodCodes });

function GodCodes() {
  const { access } = useAccess();
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["god-codes"], queryFn: () => listGodCodes() });
  const [tier, setTier] = useState<"limited" | "medium" | "full" | "life">("limited");
  const [hours, setHours] = useState("24");
  const [note, setNote] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);
  const allow = hasPerm(access.role, "godCodes");

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-display text-3xl">God Code generator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          One-time codes. Limited is view-only. Medium is view, reports, and support. Full is almost
          everything. Life never expires.
        </p>
      </div>
      {allow && (
        <form
          className="grid gap-3 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]"
          onSubmit={(e) => {
            e.preventDefault();
            generateGodCode({
              data: {
                tier,
                hours: tier === "life" ? null : Number(hours) || 24,
                note,
              },
            })
              .then((r) => {
                setRevealed(r.code);
                qc.invalidateQueries({ queryKey: ["god-codes"] });
                toast.success("Code issued — copy it now. It will not be shown again.");
              })
              .catch((err: Error) => toast.error(err.message));
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Tier</Label>
              <select
                className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
                value={tier}
                onChange={(e) => setTier(e.target.value as typeof tier)}
              >
                <option value="limited">Limited · view</option>
                <option value="medium">Medium · view + reports + support</option>
                <option value="full">Full · almost everything</option>
                <option value="life">Life pass · never expires</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label>Hours until expiry</Label>
              <Input
                type="number"
                min={1}
                value={hours}
                disabled={tier === "life"}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Note</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="VIP, contractor…" />
          </div>
          <Button type="submit">Generate</Button>
          {revealed && (
            <p className="rounded-lg bg-muted px-3 py-2 font-mono text-sm break-all">{revealed}</p>
          )}
        </form>
      )}
      <div className="overflow-x-auto rounded-2xl bg-card shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="text-xs text-faint">
            <tr>
              <th className="px-4 py-3">Prefix</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Uses</th>
              <th className="px-4 py-3">Expires</th>
            </tr>
          </thead>
          <tbody>
            {(list.data ?? []).map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono">{c.codePrefix}…</td>
                <td className="px-4 py-3">
                  <Badge>{c.tier}</Badge>
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {c.usedCount}/{c.maxUses}
                </td>
                <td className="px-4 py-3 text-xs text-faint">
                  {c.expiresAt ? formatWhen(c.expiresAt) : "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
