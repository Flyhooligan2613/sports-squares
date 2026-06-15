import Link from "next/link";
import PageShell from "@/components/ui/PageShell";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import PlatformTrustStrip from "@/components/platform/PlatformTrustStrip";
import { Button } from "@/components/ui/Button";
import { BRAND_NAME } from "@/lib/brand";
import { SUPPORT_CATEGORIES } from "@/lib/platform/core/supportCategories";
import { TRUST_MESSAGES } from "@/lib/platform/core/trustMessages";
import { PLATFORM_TERMS } from "@/lib/platform/legacy/competitiveLanguage";

export const metadata = {
  title: `Support Center | ${BRAND_NAME}`,
  description: "Get help with SquareBoards — payments, gameplay, and technical issues.",
};

export default function SupportCenterPage() {
  return (
    <PageShell title="Support Center" showLogo={false}>
      <p className="text-sb-muted text-sm text-center -mt-4 mb-8">We&apos;re here to help</p>
      <PlatformTrustStrip className="mb-8" />

      <div className="grid sm:grid-cols-2 gap-4 not-prose mb-8">
        <LandingGlassCard className="p-6">
          <h2 className="text-white font-semibold mb-2">Message Center</h2>
          <p className="text-sb-muted text-sm leading-relaxed mb-4">
            Sign in to track conversations with the platform administrator. Report payment
            issues, gameplay questions, or bugs — all in one place.
          </p>
          <Button href="/support/messages">Open Message Center</Button>
        </LandingGlassCard>

        <LandingGlassCard className="p-6">
          <h2 className="text-white font-semibold mb-2">Report a Problem</h2>
          <p className="text-sb-muted text-sm leading-relaxed mb-4">
            Quick form for urgent issues. For tracked replies, use Message Center after signing in.
          </p>
          <Button href="/support/report" variant="secondary">
            Report a Problem
          </Button>
        </LandingGlassCard>
      </div>

      <LandingGlassCard className="p-6 mb-8">
        <h2 className="text-white font-semibold mb-4">Support Categories</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {SUPPORT_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <p className="text-sm font-semibold text-white">{cat.label}</p>
              <p className="text-xs text-sb-muted mt-1">{cat.description}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-sb-muted mt-4">
          All support routes directly to the SquareBoards platform administrator — there are no
          pool hosts or commissioners.
        </p>
      </LandingGlassCard>

      <LandingGlassCard className="p-6 mb-8">
        <h2 className="text-white font-semibold mb-3">Common questions</h2>
        <ul className="text-sb-muted text-sm space-y-2 list-disc pl-5">
          <li>
            Payouts are processed automatically through Stripe — administrators cannot issue manual
            payouts.
          </li>
          <li>
            Scores and winners come from official league data feeds — results cannot be altered.
          </li>
          <li>
            Boards are guaranteed once they reach 85% capacity — games always run.
          </li>
          <li>
            Need payout setup help? Visit{" "}
            <Link href="/my-games/winnings" className="text-sb-glow hover:text-white">
              {PLATFORM_TERMS.contestWinnings}
            </Link>{" "}
            to connect Stripe.
          </li>
        </ul>
      </LandingGlassCard>

      <p className="text-center text-xs text-sb-muted">
        {TRUST_MESSAGES.fullyAutomated} ·{" "}
        <Link href="/transparency" className="text-sb-glow hover:text-white">
          Transparency Center
        </Link>
      </p>
    </PageShell>
  );
}
