import { Shield } from "lucide-react";
import ComingSoonSection from "@/components/admin/commandCenter/ComingSoonSection";

export default function CommandCenterSecurityPage() {
  return (
    <ComingSoonSection
      title="Security Center"
      description="Player security controls, device revocation, and login monitoring are live in Classic Admin. Aggregated failed-login dashboards arrive in a future release."
      icon={Shield}
      capabilities={[
        { label: "Player security lookup", status: "live" },
        { label: "Suspend / flag accounts", status: "live" },
        { label: "Force logout & device revoke", status: "live" },
        { label: "Failed login aggregation", status: "planned" },
        { label: "IP anomaly detection", status: "planned" },
      ]}
      relatedLinks={[
        { href: "/admin/security", label: "Open Security Admin" },
        { href: "/admin/command-center/players", label: "Player Management" },
        { href: "/trust", label: "Trust Center" },
      ]}
    />
  );
}
