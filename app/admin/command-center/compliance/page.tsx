import SectionPlaceholder from "@/components/admin/commandCenter/SectionPlaceholder";

export default function ComplianceCenterPage() {
  return (
    <SectionPlaceholder
      title="Compliance Center"
      description="Identity verification, account suspensions, and regulatory monitoring."
      deferred={[
        "Stripe Identity verification queue via PaymentEngine",
        "Suspended account dashboard from player_auth_profiles",
        "Jurisdiction and age-gate audit trail",
      ]}
    />
  );
}
