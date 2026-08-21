import { createFileRoute } from "@tanstack/react-router";
import { ProductLine } from "@/components/product-line";
import { SHIELD_PLANS } from "@/lib/trillion/plans";

export const Route = createFileRoute("/shield")({ component: Shield });

function Shield() {
  return (
    <ProductLine
      kicker="Compliance"
      title="Trillion Shield"
      lede="Vanta-class evidence, monitoring, and auditor access. You pick the independent auditor. Auditor codes are time-limited and read-only."
      plans={SHIELD_PLANS}
    >
      <p className="mt-10 max-w-2xl text-sm text-muted-foreground">
        Frameworks include SOC 2, ISO 27001, HIPAA, GDPR, PCI DSS, FedRAMP, and NIST. Add-ons:
        extra framework, Trust Center, vendor risk, questionnaire automation, penetration-testing
        bundle. All auditor actions are logged.
      </p>
    </ProductLine>
  );
}
