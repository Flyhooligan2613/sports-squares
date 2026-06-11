import PageShell from "@/components/ui/PageShell";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Responsible Gaming | ${BRAND_NAME}`,
};

export default function ResponsibleGamingPage() {
  return (
    <PageShell title="Responsible Gaming" showLogo={false}>
      <p>
        {BRAND_NAME} is intended for entertainment among friends, bars,
        fundraisers, and community groups. Only participate if it is legal
        in your jurisdiction.
      </p>
      <p>
        Set limits, play for fun, and never wager more than you can afford
        to lose. Pool hosts are responsible for local compliance and payout
        rules.
      </p>
      <p>
        If you or someone you know needs help with gambling-related issues,
        contact the National Council on Problem Gambling at 1-800-522-4700
        (US).
      </p>
    </PageShell>
  );
}
