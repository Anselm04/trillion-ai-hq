import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveProduct, type ProductInput } from "@/lib/trillion/catalog";
import { CATEGORIES, type Product } from "@/lib/trillion/types";
import { slugify } from "@/lib/trillion/format";

export function ProductEditor({
  product,
  onSaved,
}: {
  product?: Product | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductInput>({
    id: product?.id,
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    tagline: product?.tagline ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "software",
    priceCents: product?.priceCents ?? null,
    billing: product?.billing ?? "one_time",
    features: product?.features ?? "",
    vantaReady: product?.vantaReady ?? false,
    featured: product?.featured ?? false,
    status: product?.status ?? "published",
    demoUrl: product?.demoUrl,
    videoUrl: product?.videoUrl,
  });
  const [busy, setBusy] = useState(false);

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setBusy(true);
        const payload = {
          ...form,
          slug: slugify(form.slug || form.name),
          billing: form.billing === "free" ? "free" : "one_time",
          priceCents:
            form.billing === "free"
              ? 0
              : form.billing === "coming_soon"
                ? null
                : form.priceCents === null
                  ? null
                  : Number(form.priceCents),
        };
        saveProduct({ data: payload })
          .then(() => {
            toast.success("Catalog updated");
            onSaved();
          })
          .catch((err: Error) => toast.error(err.message))
          .finally(() => setBusy(false));
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="auto from name"
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="tagline">Tagline</Label>
        <Input id="tagline" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="billing">Billing</Label>
          <select
            id="billing"
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
            value={form.priceCents == null && form.billing !== "free" ? "coming_soon" : form.billing}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "coming_soon") {
                set("billing", "one_time");
                set("priceCents", null);
              } else if (v === "free") {
                set("billing", "free");
                set("priceCents", 0);
              } else {
                set("billing", "one_time");
              }
            }}
          >
            <option value="one_time">One-time</option>
            <option value="free">Free</option>
            <option value="coming_soon">Coming soon</option>
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step="0.01"
            value={form.priceCents == null ? "" : form.priceCents / 100}
            onChange={(e) =>
              set("priceCents", e.target.value === "" ? null : Math.round(Number(e.target.value) * 100))
            }
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="features">Features (one per line)</Label>
        <Textarea id="features" value={form.features} onChange={(e) => set("features", e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.vantaReady}
            onChange={(e) => set("vantaReady", e.target.checked)}
          />
          Vanta-Ready
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
          />
          Featured
        </label>
        <select
          className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
        >
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : product ? "Save product" : "Add to Market"}
      </Button>
    </form>
  );
}
