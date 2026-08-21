import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContact } from "@/lib/trillion/catalog";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <PublicShell>
      <div className="mx-auto grid max-w-5xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-xs tracking-[0.22em] text-sage uppercase">Contact</p>
          <h1 className="mt-3 font-display text-4xl">Write the desk.</h1>
          <p className="mt-4 text-muted-foreground">
            Hello for general, support for subscribers, Anselm for Throne matters. Messages land in
            Shield and Support queues.
          </p>
          <ul className="mt-8 space-y-2 text-sm">
            <li>
              <a href="mailto:hello@trillionaitech.com">hello@trillionaitech.com</a>
            </li>
            <li>
              <a href="mailto:support@trillionaitech.com">support@trillionaitech.com</a>
            </li>
            <li>
              <a href="mailto:anselm@trillionaitech.com">anselm@trillionaitech.com</a>
            </li>
          </ul>
        </div>
        {sent ? (
          <div className="rounded-2xl bg-card p-6 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-2xl">Received</h2>
            <p className="mt-2 text-sm text-muted-foreground">The desk has your note.</p>
          </div>
        ) : (
          <form
            className="grid gap-4 rounded-2xl bg-card p-6 shadow-[var(--shadow-border)]"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setBusy(true);
              submitContact({
                data: {
                  name: String(fd.get("name") ?? ""),
                  email: String(fd.get("email") ?? ""),
                  topic: String(fd.get("topic") ?? "general"),
                  message: String(fd.get("message") ?? ""),
                },
              })
                .then(() => setSent(true))
                .catch((err: Error) => toast.error(err.message))
                .finally(() => setBusy(false));
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="topic">Topic</Label>
              <select
                id="topic"
                name="topic"
                className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="general">General</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="security">Security</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" required />
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Sending…" : "Send"}
            </Button>
          </form>
        )}
      </div>
    </PublicShell>
  );
}
