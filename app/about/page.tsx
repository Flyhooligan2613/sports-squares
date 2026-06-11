import PageShell from "@/components/ui/PageShell";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `About | ${BRAND_NAME}`,
};

export default function AboutPage() {
  return (
    <PageShell title={`About ${BRAND_NAME}`}>
      <p>
        {BRAND_NAME} is a modern sports squares platform built for players
        who want a premium, mobile-first experience — from buying squares
        to tracking live scores and quarter winners.
      </p>
      <p>
        We combine secure Stripe payments, instant invite links, and ESPN
        live score sync so you can focus on the game, not spreadsheets.
      </p>
    </PageShell>
  );
}
