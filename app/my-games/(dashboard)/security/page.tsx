import PageHeader from "@/components/ui/PageHeader";
import SecurityCenter from "@/components/player/SecurityCenter";

export default function PlayerSecurityPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Security"
        subtitle="Security Center, trusted devices, biometrics, and Quick PIN."
      />
      <SecurityCenter />
    </div>
  );
}
