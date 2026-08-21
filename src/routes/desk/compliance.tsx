import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "@/routes/throne/shield";

export const Route = createFileRoute("/desk/compliance")({
  component: Shield,
});
