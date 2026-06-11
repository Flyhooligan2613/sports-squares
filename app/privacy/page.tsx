import PageShell from "@/components/ui/PageShell";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Privacy Policy | ${BRAND_NAME}`,
};

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy">
      <p>
        {BRAND_NAME} collects information you provide when creating pools,
        purchasing squares, or contacting support — including name, email,
        and phone number when supplied.
      </p>
      <p>
        Payment information is processed securely by Stripe. We do not store
        full card numbers on our servers.
      </p>
      <p>
        We use Supabase for data storage, Resend for transactional email,
        and ESPN public APIs for live score data. Each provider processes
        data according to their own privacy policies.
      </p>
      <p>
        We use cookies and local storage for authentication and session
        management. You may contact us to request deletion of your data
        where applicable.
      </p>
    </PageShell>
  );
}
