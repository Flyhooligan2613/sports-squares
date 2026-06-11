import PageShell from "@/components/ui/PageShell";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Terms of Service | ${BRAND_NAME}`,
};

export default function TermsPage() {
  return (
    <PageShell title="Terms of Service">
      <p>
        {BRAND_NAME} provides online tools to create and manage sports
        squares pools. By using this service, you agree to use it in
        compliance with applicable laws and regulations in your jurisdiction.
      </p>
      <p>
        Pool organizers are responsible for pool rules, payouts, and
        participant communications. {BRAND_NAME} facilitates pool
        management and payment processing but does not guarantee game
        outcomes or financial settlements between participants.
      </p>
      <p>
        You must not use the platform for unlawful gambling where prohibited.
        You are responsible for ensuring your pools comply with local rules.
      </p>
      <p>
        We may update these terms. Continued use of the service constitutes
        acceptance of updated terms.
      </p>
    </PageShell>
  );
}
