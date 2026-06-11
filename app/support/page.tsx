import Link from "next/link";
import PageShell from "@/components/ui/PageShell";
import { Card } from "@/components/ui/Card";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Support | ${BRAND_NAME}`,
};

export default function SupportPage() {
  return (
    <PageShell title="Support" showLogo={false}>
      <div className="space-y-4 not-prose">
        <Card variant="glass" className="p-5 sm:p-6">
          <h2 className="text-white font-semibold mb-2">Pool organizers</h2>
          <p className="text-sb-muted text-sm leading-relaxed">
            Sign in to the admin dashboard to manage pools, resend invite
            links, and review player payments.
          </p>
          <Link
            href="/admin"
            className="inline-block mt-4 text-sm text-sb-glow hover:text-white font-medium transition-colors"
          >
            Go to Admin →
          </Link>
        </Card>
        <Card variant="glass" className="p-5 sm:p-6">
          <h2 className="text-white font-semibold mb-2">Players</h2>
          <p className="text-sb-muted text-sm leading-relaxed">
            Use the invite link from your pool organizer or purchase
            confirmation to access your squares. If you completed checkout,
            your personal access link is shown on the purchase confirmation
            page.
          </p>
        </Card>
        <Card variant="glass" className="p-5 sm:p-6">
          <h2 className="text-white font-semibold mb-2">Common issues</h2>
          <ul className="text-sb-muted text-sm space-y-2 list-disc pl-5">
            <li>Invalid invite link — contact your pool organizer for a new link.</li>
            <li>Payment completed but no email — use the access link on the confirmation page.</li>
            <li>Cannot claim squares — ensure you opened your personal invite link first.</li>
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}
