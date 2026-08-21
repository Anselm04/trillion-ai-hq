import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkout/cancel")({
  validateSearch: (s: Record<string, unknown>) => ({
    slug: typeof s.slug === "string" ? s.slug : undefined,
  }),
  component: Cancel,
});

function Cancel() {
  const { slug } = Route.useSearch();
  return (
    <PublicShell>
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Payment cancelled</h1>
        <p className="mt-3 text-sm text-muted-foreground">Nothing was charged. You can try again when you are ready.</p>
        <div className="mt-8 flex flex-col gap-2">
          {slug ? (
            <Button asChild>
              <Link to="/market/$slug" params={{ slug }}>
                Back to product
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link to="/market">Catalog</Link>
          </Button>
        </div>
      </div>
    </PublicShell>
  );
}
