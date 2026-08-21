import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProductCover } from "@/components/product-art";
import { saveProduct, type ProductInput } from "@/lib/trillion/catalog";
import { CATEGORIES, type PriceTier, type Product } from "@/lib/trillion/types";
import { CATEGORY_SINGULAR } from "@/lib/trillion/brand";
import { formatPrice, slugify } from "@/lib/trillion/format";

async function fileToJpegDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 1600;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that image");
  ctx.drawImage(bitmap, 0, 0, w, h);
  const data = canvas.toDataURL("image/jpeg", 0.82);
  if (data.length > 900_000) {
    return canvas.toDataURL("image/jpeg", 0.65);
  }
  return data;
}

function emptyTier(): PriceTier {
  return { name: "", amountCents: 0, billing: "subscription", billingInterval: "month" };
}

export function ProductEditor({
  product,
  defaultCategory,
  onSaved,
}: {
  product?: Product | null;
  defaultCategory?: string;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductInput>({
    id: product?.id,
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    tagline: product?.tagline ?? "",
    description: product?.description ?? "",
    category: product?.category ?? defaultCategory ?? "software",
    priceCents: product?.priceCents ?? null,
    billing: product?.billing ?? "one_time",
    billingInterval: product?.billingInterval ?? "month",
    prices: product?.prices?.length
      ? product.prices
      : product?.priceCents != null
        ? [
            {
              name: "Standard",
              amountCents: product.priceCents,
              billing: product.billing,
              billingInterval: product.billingInterval,
            },
          ]
        : [],
    features: product?.features ?? "",
    vantaReady: product?.vantaReady ?? false,
    featured: product?.featured ?? false,
    status: product?.status ?? "published",
    demoUrl: product?.demoUrl,
    videoUrl: product?.videoUrl,
    imageUrl: product?.imageUrl,
  });
  const [busy, setBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const prices = form.prices ?? [];

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setTier(index: number, patch: Partial<PriceTier>) {
    set(
      "prices",
      prices.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    );
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        setBusy(true);
        const payload = {
          ...form,
          slug: slugify(form.slug || form.name),
          prices,
        };
        saveProduct({ data: payload })
          .then(() => {
            toast.success(product ? "Product updated" : "Published to catalog");
            onSaved();
          })
          .catch((err: Error) => toast.error(err.message))
          .finally(() => setBusy(false));
      }}
    >
      <div className="overflow-hidden rounded-xl bg-muted">
        <ProductCover
          name={form.name || "New product"}
          category={form.category}
          imageUrl={form.imageUrl}
          className="h-40 w-full"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="image">Catalog image (optional)</Label>
        <Input
          id="image-url"
          placeholder="Paste an image URL, or upload a file"
          value={form.imageUrl?.startsWith("data:") ? "" : (form.imageUrl ?? "")}
          onChange={(e) => set("imageUrl", e.target.value || null)}
        />
        <input
          id="image"
          type="file"
          accept="image/*"
          className="mt-1 text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setImageBusy(true);
            fileToJpegDataUrl(file)
              .then((url) => set("imageUrl", url))
              .catch((err: Error) => toast.error(err.message))
              .finally(() => setImageBusy(false));
          }}
        />
        {imageBusy && <p className="text-xs text-faint">Processing image…</p>}
        {form.imageUrl && (
          <button
            type="button"
            className="text-left text-xs text-muted-foreground hover:text-foreground"
            onClick={() => set("imageUrl", null)}
          >
            Remove image
          </button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="name">Product name</Label>
          <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="slug">URL slug</Label>
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
              {CATEGORY_SINGULAR[c]}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <Label>Subscription & price plans</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => set("prices", [...prices, emptyTier()])}>
            Add plan
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Add as many plans as you want. When Stripe is connected, each plan becomes a live payment link
          in that account (cards + Alipay if enabled).
        </p>
        {prices.length === 0 && (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
            No plans yet — this product shows as coming soon. Add a monthly, yearly, or one-time plan.
          </p>
        )}
        {prices.map((tier, i) => (
          <div key={i} className="grid gap-3 rounded-xl border border-border p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Plan name</Label>
                <Input
                  value={tier.name}
                  placeholder={`Plan ${i + 1}`}
                  onChange={(e) => setTier(i, { name: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Price (USD)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={tier.amountCents ? tier.amountCents / 100 : ""}
                  onChange={(e) =>
                    setTier(i, { amountCents: e.target.value === "" ? 0 : Math.round(Number(e.target.value) * 100) })
                  }
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Billing</Label>
                <select
                  className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
                  value={
                    tier.billing === "free"
                      ? "free"
                      : tier.billing === "one_time"
                        ? "one_time"
                        : tier.billingInterval === "year"
                          ? "yearly"
                          : tier.billingInterval === "week"
                            ? "weekly"
                            : tier.billingInterval === "quarter"
                              ? "quarterly"
                              : "monthly"
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "free") setTier(i, { billing: "free", billingInterval: null, amountCents: 0 });
                    else if (v === "one_time") setTier(i, { billing: "one_time", billingInterval: null });
                    else if (v === "yearly") setTier(i, { billing: "subscription", billingInterval: "year" });
                    else if (v === "weekly") setTier(i, { billing: "subscription", billingInterval: "week" });
                    else if (v === "quarterly") setTier(i, { billing: "subscription", billingInterval: "quarter" });
                    else setTier(i, { billing: "subscription", billingInterval: "month" });
                  }}
                >
                  <option value="monthly">Monthly subscription</option>
                  <option value="yearly">Yearly subscription</option>
                  <option value="weekly">Weekly subscription</option>
                  <option value="quarterly">Every 3 months</option>
                  <option value="one_time">One-time</option>
                  <option value="free">Free</option>
                </select>
              </div>
              <div className="flex items-end justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  {formatPrice(tier.amountCents, tier.billing, tier.billingInterval)}
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={() => set("prices", prices.filter((_, j) => j !== i))}>
                  Remove
                </Button>
              </div>
            </div>
            {tier.paymentLinkUrl && (
              <div className="grid gap-1.5">
                <Label>Live payment link</Label>
                <div className="flex gap-2">
                  <Input readOnly value={tier.paymentLinkUrl} />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      void navigator.clipboard.writeText(tier.paymentLinkUrl!);
                      toast.success("Link copied");
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="features">Features (one per line)</Label>
        <Textarea id="features" value={form.features} onChange={(e) => set("features", e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="demo">Demo URL</Label>
          <Input
            id="demo"
            value={form.demoUrl ?? ""}
            onChange={(e) => set("demoUrl", e.target.value || null)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="video">Video URL</Label>
          <Input
            id="video"
            value={form.videoUrl ?? ""}
            onChange={(e) => set("videoUrl", e.target.value || null)}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
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
          Featured on homepage
        </label>
        <select
          className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
        >
          <option value="published">Published (live on site)</option>
          <option value="draft">Draft (hidden)</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : product ? "Save product" : "Add to catalog"}
      </Button>
    </form>
  );
}
