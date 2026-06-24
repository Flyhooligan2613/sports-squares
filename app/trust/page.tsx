import PageShell from "@/components/ui/PageShell";
import TrustCenterHub from "@/components/trust/TrustCenterHub";
import { BRAND_NAME } from "@/lib/brand";
import { TRUST_CENTER_META } from "@/lib/trust/trustCenterMeta";

export const metadata = {
  title: `${TRUST_CENTER_META.title} | ${BRAND_NAME}`,
  description: TRUST_CENTER_META.intro,
};

export default function TrustCenterPage() {
  return (
    <PageShell title={TRUST_CENTER_META.title} showLogo={false} hideTitle maxWidth="lg">
      <TrustCenterHub />
    </PageShell>
  );
}
