import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listPeople } from "@/lib/trillion/identity";
import { formatWhen, roleLabel } from "@/lib/trillion/format";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/throne/users")({ component: Users });

function Users() {
  const q = useQuery({ queryKey: ["people"], queryFn: () => listPeople() });
  return (
    <div>
      <h1 className="font-display text-3xl">User management</h1>
      <p className="mt-1 text-sm text-muted-foreground">Every signed-in identity on the headquarters.</p>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-card shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="text-xs text-faint">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Seat</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(q.data ?? []).map((u) => (
              <tr key={u.userId} className="border-t border-border">
                <td className="px-4 py-3">{u.name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge>{roleLabel(u.role)}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-faint">{formatWhen(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
