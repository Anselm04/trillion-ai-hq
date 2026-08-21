import { createFileRoute } from "@tanstack/react-router";
import { Products } from "@/routes/throne/products";

export const Route = createFileRoute("/desk/products")({
  component: Products,
});
