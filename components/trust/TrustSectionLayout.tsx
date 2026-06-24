import Link from "next/link";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import TrustBadge from "@/components/alive/TrustBadge";
import { TRUST_CENTER_META } from "@/lib/trust/trustCenterMeta";

interface TrustSectionLayoutProps {
  title: string;
  icon?: string;
  children: ReactNode;
}

export default function TrustSectionLayout({
  title,
  icon,
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
          {icon ? (
            <span className="text-3xl leading-none" aria-hidden>
              {icon}
            </span>
          ) : null}
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex-1 min-w-0">
            {title}
          </h1>
        </div>

        <p className="text-xs text-sb-muted mb-6">
          Last Updated: {TRUST_CENTER_META.lastUpdated} · Version {TRUST_CENTER_META.version}
        </p>

        <TrustBadge className="mb-8" />

        <div className="trust-policy-prose">{children}</div>

        <div className="mt-12 pt-8 border-t border-white/[0.06] text-xs text-sb-muted space-y-1">
          <p>
            {TRUST_CENTER_META.company} · {TRUST_CENTER_META.website}
          </p>
          <p>
            Trust Center v{TRUST_CENTER_META.version} · Updated {TRUST_CENTER_META.lastUpdated}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
