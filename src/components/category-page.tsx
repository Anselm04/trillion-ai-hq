import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PublicShell } from "@/components/public-shell";
import { ProductCard } from "@/components/product-card";
import { ProductCover } from "@/components/product-art";
import { ProductEditor } from "@/components/product-editor";
import { Button } from "@/components/ui/button";
import { useAccess } from "@/components/access-provider";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { deleteProduct, listAllProducts, listProducts } from "@/lib/trillion/catalog";
import { canMutate, hasPerm } from "@/lib/trillion/roles";
import { type Category, type Product } from "@/lib/trillion/types";
import { useI18n } from "@/lib/i18n/locale";
import type { MessageKey } from "@/lib/i18n/messages";

export function CategoryPage({ category }: { category: Category }) {
  const { t } = useI18n();
  const { user } = useCurrentUserState();
  const { access } = useAccess();
  const qc = useQueryClient();
  const allow = Boolean(user) && hasPerm(access.role, "manageProducts") && canMutate(access.role);
  const published = useQuery({ queryKey: ["products"], queryFn: () => listProducts() });
  const all = useQuery({
    queryKey: ["all-products"],
    queryFn: () => listAllProducts(),
    enabled: allow,
  });
  const source = allow ? (all.data ?? published.data ?? []) : (published.data ?? []);
  const items = source.filter((p) => p.category === category);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const title = t(`cat.${category}` as MessageKey);

  function refresh() {
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["all-products"] });
    setAdding(false);
    setEditing(null);
  }

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-5xl">{title}</h1>
          {allow && (
            <Button
              onClick={() => {
                setEditing(null);
                setAdding((v) => !v);
              }}
            >
              {adding ? "Close" : "Add product"}
            </Button>
          )}
        </div>

        {allow && (adding || editing) && (
          <div className="mt-8 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-8">
            <h2 className="font-display text-2xl">{editing ? `Edit ${editing.name}` : `New ${title.slice(0, -1).toLowerCase()}`}</h2>
            <div className="mt-5">
              <ProductEditor
                key={`${editing?.id ?? "new"}-${category}`}
                product={editing}
                defaultCategory={category}
                onSaved={refresh}
              />
            </div>
          </div>
        )}

        {items.length > 0 ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) =>
              allow ? (
                <div
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-border)]"
                >
                  <Link to="/market/$slug" params={{ slug: p.slug }}>
                    <ProductCover
                      name={p.name}
                      category={p.category}
                      imageUrl={p.imageUrl}
                      className="h-44 w-full"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="font-display text-2xl">{p.name}</p>
                    <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{p.tagline}</p>
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setAdding(false);
                          setEditing(p);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (!window.confirm(`Remove “${p.name}”?`)) return;
                          deleteProduct({ data: p.id })
                            .then(() => {
                              toast.success("Removed");
                              refresh();
                            })
                            .catch((err: Error) => toast.error(err.message));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <ProductCard key={p.id} product={p} />
              ),
            )}
          </div>
        ) : (
          !adding &&
          !editing && (
            <p className="mt-12 text-muted-foreground">No {title.toLowerCase()} listed yet.</p>
          )
        )}
      </div>
    </PublicShell>
  );
}

