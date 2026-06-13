"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import type { ReferralSummary } from "@/lib/platform/ecosystem/types";

export default function PlayerReferralsHub() {
  const [data, setData] = useState<ReferralSummary | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void fetch("/api/ecosystem/referrals", { cache: "no-store", credentials: "include" })
      .then((res) => res.json())
      .then((json) => setData(json as ReferralSummary));
  }, []);

  function copyLink() {
    if (!data?.referralLink) return;
    void navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 space-y-6">
      <PageHeader
        title="Refer & Earn"
        subtitle="Share SquareBoards. Earn $10 Square Credit when friends qualify."
      />

      <LandingGlassCard className="p-6 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-sb-muted">Your Referral ID</p>
          <p className="text-3xl font-bold text-white font-mono">{data?.referralCode ?? "…"}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1" onClick={copyLink}>
            {copied ? "Copied!" : "Copy referral link"}
          </Button>
        </div>
        <p className="text-xs text-sb-muted">
          Friends qualify after a $25+ first deposit and $15+ in paid gameplay. One reward per new account.
        </p>
      </LandingGlassCard>

      <LandingGlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Milestones</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {data?.milestones.map((m) => (
            <div
              key={m.count}
              className={`rounded-xl border px-3 py-2 text-center text-sm ${
                m.reached
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  : "border-white/10 text-sb-muted"
              }`}
            >
              {m.count} refs
            </div>
          ))}
        </div>
      </LandingGlassCard>

      <LandingGlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Recent referrals</h3>
        <div className="space-y-2">
          {data?.referrals.map((r) => (
            <div key={r.id} className="flex justify-between text-sm border-b border-white/5 py-2">
              <span className="text-white">{r.refereeEmailMasked}</span>
              <span className="text-sb-muted capitalize">{r.status}</span>
            </div>
          ))}
          {!data?.referrals.length ? (
            <p className="text-sm text-sb-muted">No referrals yet — share your link to get started.</p>
          ) : null}
        </div>
      </LandingGlassCard>
    </div>
  );
}
