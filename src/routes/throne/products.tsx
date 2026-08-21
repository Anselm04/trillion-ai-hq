import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ProductEditor } from "@/components/product-editor";
import { ProductCover } from "@/components/product-art";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VantaBadge } from "@/components/vanta-badge";
import { deleteProduct, listAllProducts } from "@/lib/trillion/catalog";
import { categoryLabel } from "@/lib/trillion/brand";
import { formatPrice } from "@/lib/trillion/format";
import { canMutate, hasPerm } from "@/lib/trillion/roles";
import { useAccess } from "@/components/access-provider";
import type { Product } from "@/lib/trillion/types";

export const Route = createFileRoute("/throne/products")({ component: Products });

export function Products() {
  const { access } = useAccess();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["all-products"], queryFn: () => listAllProducts() });
  const [mode, setMode] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Product | null>(null);
  const allow = hasPerm(access.role, "manageProducts") && canMutate(access.role);

  function refresh() {
    qc.invalidateQueries({ queryKey: ["all-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    setMode("list");
    setEditing(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.24em] text-sage uppercase">Admin</p>
          <h1 className="mt-2 font-display text-3xl">Catalog</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a product and it appears on the public website. Nothing is hard-coded.
          </p>
        </div>
        {allow && (
          <Button
            onClick={() => {
              setEditing(null);
              setMode(mode === "form" && !editing ? "list" : "form");
            }}
          >
            {mode === "form" ? "Close form" : "Add product"}
          </Button>
        )}
      </div>

      {allow && mode === "form" && (
        <div className="mt-6 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-2xl">{editing ? "Edit product" : "Add product"}</h2>
          <div className="mt-4">
            <ProductEditor key={editing?.id ?? "new"} product={editing} onSaved={refresh} />
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {(q.data ?? []).map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl bg-card p-3 shadow-[var(--shadow-border)]"
          >
            <ProductCover
              name={p.name}
              category={p.category}
              imageUrl={p.imageUrl}
              className="h-20 w-28 rounded-xl"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{p.name}</p>
                <Badge variant={p.status === "published" ? "sage" : "default"}>{p.status}</Badge>
                {p.featured && <Badge variant="outline">Featured</Badge>}
                {p.vantaReady && <VantaBadge />}
              </div>
              <p className="text-sm text-muted-foreground">
                {categoryLabel(p.category)} · {formatPrice(p.priceCents, p.billing, p.billingInterval)}
              </p>
            </div>
            {allow && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(p);
                    setMode("form");
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
        {q.isSuccess && (q.data ?? []).length === 0 && mode === "list" && (
          <p className="py-10 text-sm text-muted-foreground">
            No products yet. Add one to publish it on the website.
          </p>
        )}
      </div>
    </div>
  );
}
