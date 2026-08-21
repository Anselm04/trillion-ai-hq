import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ProductEditor } from "@/components/product-editor";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { VantaBadge } from "@/components/vanta-badge";
import { deleteProduct, listAllProducts } from "@/lib/trillion/catalog";
import { formatPrice } from "@/lib/trillion/format";
import { canMutate, hasPerm } from "@/lib/trillion/roles";
import { useAccess } from "@/components/access-provider";
import type { Product } from "@/lib/trillion/types";

export const Route = createFileRoute("/throne/products")({ component: Products });

export function Products() {
  const { access } = useAccess();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["all-products"], queryFn: () => listAllProducts() });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const allow = hasPerm(access.role, "manageProducts") && canMutate(access.role);

  function refresh() {
    qc.invalidateQueries({ queryKey: ["all-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    setOpen(false);
    setEditing(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Product control</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The Market is this table. Nothing here is hardcoded.
          </p>
        </div>
        {allow && (
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            Add product
          </Button>
        )}
      </div>
      <div className="mt-6 grid gap-3">
        {(q.data ?? []).map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{p.name}</p>
                <Badge>{p.status}</Badge>
                {p.vantaReady && <VantaBadge />}
              </div>
              <p className="text-sm text-muted-foreground">
                {p.category} · {formatPrice(p.priceCents, p.billing)}
              </p>
            </div>
            {allow && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(p);
                    setOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (!confirm(`Remove ${p.name} from the catalog?`)) return;
                    deleteProduct({ data: p.id })
                      .then(refresh)
                      .catch((err: Error) => toast.error(err.message));
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          <ProductEditor key={editing?.id ?? "new"} product={editing} onSaved={refresh} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
