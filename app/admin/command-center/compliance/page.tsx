import { ShieldCheck } from "lucide-react";
import ComingSoonSection from "@/components/admin/commandCenter/ComingSoonSection";

export default function ComplianceCenterPage() {
  return (
    <ComingSoonSection
      title="Compliance Center"
      description="Identity verification queues, suspension review, and regulatory audit trails are being integrated with PaymentEngine and player profiles."
      icon={ShieldCheck}
      capabilities={[
        { label: "Trust Center policy hub (player-facing)", status: "live" },
        { label: "Admin security player lookup", status: "live" },
        { label: "Stripe Identity verification queue", status: "planned" },
        { label: "Suspended account dashboard", status: "planned" },
        { label: "Jurisdiction and age-gate audit trail", status: "planned" },
      ]}
      relatedLinks={[
        { href: "/admin/security", label: "Security admin" },
        { href: "/trust", label: "Trust Center (public)" },
      ]}
    />
  );
}
