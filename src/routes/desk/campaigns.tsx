import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listCampaigns, saveCampaign } from "@/lib/trillion/command";
import { formatWhen } from "@/lib/trillion/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { canMutate } from "@/lib/trillion/roles";
import { useAccess } from "@/components/access-provider";

export const Route = createFileRoute("/desk/campaigns")({ component: Campaigns });

function Campaigns() {
  const { access } = useAccess();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["campaigns"], queryFn: () => listCampaigns() });
  const allow = canMutate(access.role);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Campaigns</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Marketing Lead surface. Drafts stay off Market until published.
        </p>
      </div>
      {allow && (
        <form
          className="grid gap-3 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            saveCampaign({
              data: {
                title: String(fd.get("title") ?? ""),
                channel: String(fd.get("channel") ?? "web"),
                body: String(fd.get("body") ?? ""),
                status: String(fd.get("status") ?? "draft"),
              },
            })
              .then(() => {
                toast.success("Saved");
                qc.invalidateQueries({ queryKey: ["campaigns"] });
                e.currentTarget.reset();
              })
              .catch((err: Error) => toast.error(err.message));
          }}
        >
          <Input name="title" placeholder="Title" required />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              name="channel"
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="web">Web</option>
              <option value="email">Email</option>
              <option value="launch">Launch</option>
            </select>
            <select
              name="status"
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
            </select>
          </div>
          <Textarea name="body" placeholder="Copy" />
          <Button type="submit">Save campaign</Button>
        </form>
      )}
      <div className="grid gap-3">
        {(q.data ?? []).map((c) => (
          <div key={c.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
            <div className="flex justify-between gap-2">
              <h2 className="font-medium">{c.title}</h2>
              <Badge>{c.status}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            <p className="mt-1 text-xs text-faint">
              {c.channel} · {formatWhen(c.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
