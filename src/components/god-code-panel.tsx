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

export function GodCodePanel() {
  const { access } = useAccess();
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["god-codes"], queryFn: () => listGodCodes() });
  const [tier, setTier] = useState<"limited" | "medium" | "full" | "life">("limited");
  const [hours, setHours] = useState("24");
  const [note, setNote] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);
  const allow = hasPerm(access.role, "godCodes");

  if (!allow) {
    return <p className="text-sm text-muted-foreground">Only Anselm Perkins can issue God Codes.</p>;
  }

  return (
    <div className="grid gap-6">
      <form
        className="grid gap-3"
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
              toast.success("Copy the code now. It will not be shown again.");
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
              <option value="medium">Medium · view, reports, support</option>
              <option value="full">Full · almost everything</option>
              <option value="life">God / Life · never expires</option>
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
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Who it is for" />
        </div>
        <Button type="submit">Generate God Code</Button>
        {revealed && (
          <p className="rounded-lg bg-muted px-3 py-3 font-mono text-sm break-all">{revealed}</p>
        )}
      </form>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-faint">
            <tr>
              <th className="py-2 font-medium">Prefix</th>
              <th className="py-2 font-medium">Tier</th>
              <th className="py-2 font-medium">Uses</th>
              <th className="py-2 font-medium">Expires</th>
            </tr>
          </thead>
          <tbody>
            {(list.data ?? []).map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="py-2 font-mono">{c.codePrefix}…</td>
                <td className="py-2">
                  <Badge>{c.tier === "life" ? "God / Life" : c.tier}</Badge>
                </td>
                <td className="py-2 tabular-nums">
                  {c.usedCount}/{c.maxUses}
                </td>
                <td className="py-2 text-xs text-faint">{c.expiresAt ? formatWhen(c.expiresAt) : "Never"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.isSuccess && (list.data ?? []).length === 0 && (
          <p className="py-4 text-sm text-muted-foreground">No codes issued yet.</p>
        )}
      </div>
    </div>
  );
}
