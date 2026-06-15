"use client";

import {
  ENTRY_TIER_GROUPS,
  PLATFORM_ENTRY_TIERS,
  formatTierCents,
  type EntryTier,
  type EntryTierGroup,
} from "@/lib/platform/core/entryTiers";
import { formatHostingFeePercent } from "@/lib/platform/core/platformFeeSchedule";

interface EntryTierSelectorProps {
  selectedCents?: number | null;
  onSelect?: (tier: EntryTier) => void;
  hrefBuilder?: (tier: EntryTier) => string;
  className?: string;
}

const GROUP_ORDER: EntryTierGroup[] = ["beginner", "casual", "premium"];

export default function EntryTierSelector({
  selectedCents,
  onSelect,
  hrefBuilder,
  className = "",
}: EntryTierSelectorProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {GROUP_ORDER.map((group) => {
        const meta = ENTRY_TIER_GROUPS[group];
        const tiers = PLATFORM_ENTRY_TIERS.filter((t) => t.group === group);

        return (
          <div key={group}>
            <div className="mb-3">
              <h3 className="text-white font-semibold">{meta.label}</h3>
              <p className="text-sb-muted text-sm">{meta.description}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {tiers.map((tier) => {
                const selected = selectedCents === tier.cents;
                const className = [
                  "entry-tier-chip rounded-xl border px-4 py-3 text-center transition-all",
                  selected
                    ? "border-emerald-400/50 bg-emerald-500/10 text-white shadow-sb-glow"
                    : "border-white/10 bg-white/[0.03] text-sb-muted hover:border-white/20 hover:text-white",
                ].join(" ");

                const content = (
                  <>
                    <p className="text-lg font-bold">{tier.label}</p>
                    <p className="text-[10px] uppercase tracking-wider mt-1 opacity-70">
                      {formatTierCents(tier.cents)} entry
                    </p>
                    <p className="text-[10px] mt-1 text-emerald-400/80">
                      {formatHostingFeePercent(tier.cents)} hosting
                    </p>
                  </>
                );

                if (hrefBuilder) {
                  return (
                    <a key={tier.cents} href={hrefBuilder(tier)} className={className}>
                      {content}
                    </a>
                  );
                }

                return (
                  <button
                    key={tier.cents}
                    type="button"
                    className={className}
                    onClick={() => onSelect?.(tier)}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
