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

  function copyCode() {
    if (!data?.referralCode) return;
    void navigator.clipboard.writeText(data.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const qrUrl = data?.referralLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.referralLink)}`
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 space-y-6">
      <PageHeader
        title="Invite Friends"
        subtitle="Share SquareBoards. Earn rewards when friends qualify and play."
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <LandingGlassCard className="p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-sb-muted">Referral Code</p>
            <p className="text-3xl font-bold text-white font-mono">{data?.referralCode ?? "…"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-sb-muted mb-1">Referral Link</p>
            <p className="text-xs text-white/80 break-all font-mono">{data?.referralLink ?? "…"}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button className="w-full" onClick={copyLink}>
              {copied ? "Copied!" : "Copy referral link"}
            </Button>
            <Button variant="secondary" className="w-full" onClick={copyCode}>
              Copy code
            </Button>
          </div>
        </LandingGlassCard>

        <LandingGlassCard className="p-6 flex flex-col items-center justify-center">
          <p className="text-xs uppercase tracking-wider text-sb-muted mb-3">QR Code</p>
          {qrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrUrl}
              alt="Referral QR code"
              width={180}
              height={180}
              className="rounded-xl border border-white/10"
            />
          ) : (
            <div className="w-[180px] h-[180px] rounded-xl bg-white/5 animate-pulse" />
          )}
          <p className="text-xs text-sb-muted mt-3 text-center">Scan to join with your code</p>
        </LandingGlassCard>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Pending" value={data?.pendingReferrals ?? 0} />
        <StatCard label="Qualified" value={data?.qualifiedReferrals ?? 0} />
        <StatCard label="Lifetime" value={data?.totalReferrals ?? 0} />
        <StatCard
          label="Earnings"
          value={`$${((data?.referralEarningsCents ?? 0) / 100).toFixed(0)}`}
        />
      </div>

      <LandingGlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Referral Milestones</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {data?.milestones.map((m) => (
            <div
              key={m.count}
              className={`rounded-xl border px-3 py-3 text-center text-sm ${
                m.reached
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  : "border-white/10 text-sb-muted"
              }`}
            >
              <p className="font-bold">{m.count}</p>
              <p className="text-[10px] uppercase mt-1">{m.reached ? "Reached" : "Locked"}</p>
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

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <LandingGlassCard className="p-4 text-center">
      <p className="text-[10px] uppercase tracking-wider text-sb-muted">{label}</p>
      <p className="text-xl font-bold text-white mt-1">{value}</p>
    </LandingGlassCard>
  );
}
