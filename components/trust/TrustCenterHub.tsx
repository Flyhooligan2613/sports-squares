import Link from "next/link";
import { ChevronRight } from "lucide-react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import TrustBadge from "@/components/alive/TrustBadge";
import { TRUST_CENTER_META } from "@/lib/trust/trustCenterMeta";
import { TRUST_CENTER_SECTIONS } from "@/lib/trust/trustCenterSections";

export default function TrustCenterHub() {
  return (
    <div className="not-prose">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
          {TRUST_CENTER_META.title}
        </h1>
        <p className="text-sb-glow text-sm sm:text-base font-medium mb-4">
          {TRUST_CENTER_META.subtitle}
        </p>
        <p className="text-sb-muted text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          {TRUST_CENTER_META.intro}
        </p>
      </div>

      <TrustBadge className="justify-center mb-10" />

      <div className="flex flex-col gap-3 sm:gap-4 mb-12">
        {TRUST_CENTER_SECTIONS.map((section) => (
          <Link
            key={section.slug}
            href={section.route}
            className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-glow/50 focus-visible:ring-offset-2 focus-visible:ring-offset-sb-bg"
          >
            <LandingGlassCard glow className="p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sb-purple/10 border border-sb-purple/20 text-xl"
                  aria-hidden
                >
                  {section.icon}
                </span>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white font-semibold text-base sm:text-lg group-hover:text-sb-glow transition-colors">
                    {section.title}
                  </p>
                  <p className="text-sb-muted text-sm mt-0.5 leading-snug line-clamp-2">
                    {section.description}
                  </p>
                </div>
                <ChevronRight
                  className="w-5 h-5 shrink-0 text-sb-muted group-hover:text-sb-glow group-hover:translate-x-0.5 transition-all"
                  aria-hidden
                />
              </div>
            </LandingGlassCard>
          </Link>
        ))}
      </div>

      <footer className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-6 text-center text-xs text-sb-muted space-y-1">
        <p>Last Updated: {TRUST_CENTER_META.lastUpdated}</p>
        <p>Version: {TRUST_CENTER_META.version}</p>
        <p>Company: {TRUST_CENTER_META.company}</p>
        <p>
          Website:{" "}
          <a
            href={TRUST_CENTER_META.websiteUrl}
            className="text-sb-glow hover:text-white transition-colors"
          >
            {TRUST_CENTER_META.website}
          </a>
        </p>
      </footer>
    </div>
  );
}
