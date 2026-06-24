import Link from "next/link";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import TrustCenterBadges from "@/components/trust/TrustCenterBadges";
import { TRUST_CENTER_META } from "@/lib/trust/trustCenterMeta";
import type { TrustLucideIconName } from "@/lib/trust/trustIcons";
import { TrustLucideIcon } from "@/lib/trust/trustIcons";

interface TrustSectionLayoutProps {
  title: string;
  lucideIcon?: TrustLucideIconName;
  children: ReactNode;
}

export default function TrustSectionLayout({
  title,
  lucideIcon,
  children,
}: TrustSectionLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 sb-page-enter">
        <Link
          href="/trust"
          className="inline-flex items-center gap-1.5 text-sb-glow hover:text-white text-sm font-medium transition-colors mb-8"
        >
          <span aria-hidden>←</span>
          Back to Trust Center
        </Link>

        <div className="flex flex-wrap items-start gap-3 mb-3">
          {lucideIcon ? (
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sb-purple/10 border border-sb-purple/20 text-sb-glow"
              aria-hidden
            >
              <TrustLucideIcon name={lucideIcon} className="w-5 h-5" />
            </span>
          ) : null}
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex-1 min-w-0">
            {title}
          </h1>
        </div>

        <p className="text-xs text-sb-muted mb-6">
          Last Updated: {TRUST_CENTER_META.lastUpdated} · Version {TRUST_CENTER_META.version}
        </p>

        <TrustCenterBadges />

        <div className="trust-policy-prose mt-8">{children}</div>

        <div className="trust-center-footer mt-12">
          <p>
            Last Updated: {TRUST_CENTER_META.lastUpdated} | Version {TRUST_CENTER_META.version}
          </p>
          <p>
            {TRUST_CENTER_META.company} | {TRUST_CENTER_META.brandMark} |{" "}
            {TRUST_CENTER_META.tagline} |{" "}
            <a href={TRUST_CENTER_META.websiteUrl} className="trust-center-footer-link">
              {TRUST_CENTER_META.website}
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
