import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listPeople, listStaff, setStaffRole } from "@/lib/trillion/identity";
import { STAFF_ASSIGNABLE, type Role } from "@/lib/trillion/roles";
import { formatWhen, roleLabel } from "@/lib/trillion/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { hasPerm } from "@/lib/trillion/roles";
import { useAccess } from "@/components/access-provider";

export const Route = createFileRoute("/throne/staff")({ component: Staff });

function Staff() {
  const { access } = useAccess();
  const qc = useQueryClient();
  const staff = useQuery({ queryKey: ["staff"], queryFn: () => listStaff() });
  const people = useQuery({ queryKey: ["people"], queryFn: () => listPeople() });
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<Role>("view_only");
  const [department, setDepartment] = useState("");
  const can = hasPerm(access.role, "manageStaff");

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-display text-3xl">Staff management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Assign seats. Throne cannot be handed over from this panel.
        </p>
      </div>
      {can && (
        <form
          className="grid gap-3 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)] sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setStaffRole({ data: { userId, role, department } })
              .then(() => {
                toast.success("Seat updated");
                qc.invalidateQueries({ queryKey: ["staff"] });
                qc.invalidateQueries({ queryKey: ["people"] });
              })
              .catch((err: Error) => toast.error(err.message));
          }}
        >
          <select
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm sm:col-span-2"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          >
            <option value="">Select a signed-in person</option>
            {(people.data ?? []).map((p) => (
              <option key={p.userId} value={p.userId}>
                {p.email} · {roleLabel(p.role)}
              </option>
            ))}
          </select>
          <select
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {STAFF_ASSIGNABLE.map((r) => (
              <option key={r} value={r}>
                {roleLabel(r)}
              </option>
            ))}
          </select>
          <Input
            placeholder="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
          <Button type="submit" className="sm:col-span-2">
            Assign seat
          </Button>
        </form>
      )}
      <div className="grid gap-3">
        {(staff.data ?? []).map((s) => (
          <div
            key={s.userId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]"
          >
            <div>
              <p className="font-medium">{s.displayName || s.email}</p>
              <p className="text-xs text-muted-foreground">{s.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{roleLabel(s.role)}</Badge>
              <span className="text-xs text-faint">{formatWhen(s.lastSeenAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
