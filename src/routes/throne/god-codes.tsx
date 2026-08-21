import { createFileRoute } from "@tanstack/react-router";
import { GodCodePanel } from "@/components/god-code-panel";

export const Route = createFileRoute("/throne/god-codes")({ component: GodCodes });

function GodCodes() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <p className="text-[10px] tracking-[0.24em] text-sage uppercase">Admin</p>
        <h1 className="mt-3 font-display text-4xl">God Codes</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Issue a one-time access code. Copy it as soon as it appears — it is not stored in plain
          text. Limited, Medium, Full, or a God / Life pass that never expires.
        </p>
      </div>
      <div className="rounded-2xl bg-card p-8 shadow-[var(--shadow-border)]">
        <GodCodePanel />
      </div>
    </div>
  );
}
