"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { formatTimeAgo } from "@/lib/liveWinners/format";
import type { PurchaseFeedItem } from "@/lib/actionCenter/types";

interface LivePurchaseFeedProps {
  purchases: PurchaseFeedItem[];
}

export default function LivePurchaseFeed({ purchases }: LivePurchaseFeedProps) {
  return (
    <section>
      <h2 className="ac-section-title">Live Purchase Feed</h2>
      <LandingGlassCard className="ac-purchase-panel p-3 sm:p-4">
        {purchases.length === 0 ? (
          <p className="text-sb-muted text-sm text-center py-4">
            Purchases stream here in real time.
          </p>
        ) : (
          <ul className="space-y-1 max-h-80 overflow-y-auto">
            {purchases.map((item, index) => (
              <li
                key={item.id}
                className={[
                  "ac-purchase-item admin-stat-enter",
                  index === 0 ? "ac-purchase-item-new" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
              >
                <span className="ac-purchase-icon" aria-hidden>
                  💳
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white">
                    <span className="font-semibold">{item.maskedName}</span> purchased{" "}
                    {item.squares} square{item.squares === 1 ? "" : "s"}
                  </p>
                  <p className="text-xs text-sb-muted truncate">{item.detail}</p>
                </div>
                <span className="text-[10px] text-sb-muted shrink-0">
                  {formatTimeAgo(item.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </LandingGlassCard>
    </section>
  );
}
