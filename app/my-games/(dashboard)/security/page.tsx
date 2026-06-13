import PageHeader from "@/components/ui/PageHeader";
import TrustedDevicesSettings from "@/components/player/TrustedDevicesSettings";

export default function PlayerSecurityPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Security"
        subtitle="Manage trusted devices, biometric login, and account protection."
      />
      <TrustedDevicesSettings />
    </div>
  );
}
