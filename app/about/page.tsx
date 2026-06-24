import Link from "next/link";
import PageShell from "@/components/ui/PageShell";
import { Card } from "@/components/ui/Card";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `About | ${BRAND_NAME}`,
};

export default function AboutPage() {
  return (
    <PageShell title={`About ${BRAND_NAME}`}>
      <p>
        {BRAND_NAME} is the automated sports squares marketplace — built for competitors who want a
        premium, mobile-first experience from buying squares through live scores and quarter winners.
      </p>
      <p>
        We combine secure Stripe payments, instant invite links, and official league score sync so
        you can focus on the game, not spreadsheets.
      </p>

      <Card variant="glass" className="p-6 sm:p-8 not-prose mt-8">
        <h2 className="text-white font-semibold mb-3">Company</h2>
        <ul className="text-sb-muted text-sm space-y-2">
          <li>
            <span className="text-white/80">Legal entity:</span> ALTIVORA LABS LLC
          </li>
          <li>
            <span className="text-white/80">Doing business as:</span> {BRAND_NAME}™
          </li>
          <li>
            <span className="text-white/80">Support:</span>{" "}
            <a href="mailto:support@squareboards.pro" className="text-sb-glow hover:text-white">
              support@squareboards.pro
            </a>
          </li>
          <li>
            <span className="text-white/80">Legal inquiries:</span>{" "}
            <a href="mailto:legal@squareboards.pro" className="text-sb-glow hover:text-white">
              legal@squareboards.pro
            </a>
          </li>
        </ul>
        <p className="text-xs text-sb-muted mt-4 leading-relaxed">
          Policies, contest rules, privacy, and partner documentation are published in the{" "}
          <Link href="/trust" className="text-sb-glow hover:text-white">
            Trust Center
          </Link>
          .
        </p>
      </Card>
    </PageShell>
  );
}
