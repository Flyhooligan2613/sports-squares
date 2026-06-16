"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import type { SquarePassMyReferral } from "@/lib/platform/engines/squarePass";

export default function ReferralHub() {
  const [data, setData] = useState<SquarePassMyReferral | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void fetch("/api/square-pass/my-referral", { cache: "no-store", credentials: "include" })
      .then((res) => res.json())
      .then((json) => setData(json as SquarePassMyReferral));
  }, []);

  function copyLink() {
    if (!data?.referralLink) return;
    void navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyCode() {
    if (!data?.personalCode) return;
    void navigator.clipboard.writeText(data.personalCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const qrUrl = data?.referralLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.referralLink)}`
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 space-y-6">
      <PageHeader
        title="SquarePass Referrals"
        subtitle="Share your exclusive invite. Build your roster and unlock milestone rewards."
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <LandingGlassCard className="p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-sb-muted">Your Invite Code</p>
            <p className="text-3xl font-bold text-white font-mono">{data?.personalCode ?? "…"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-sb-muted mb-1">Invite Link</p>
            <p className="text-xs text-white/80 break-all font-mono">{data?.referralLink ?? "…"}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button className="w-full" onClick={copyLink}>
              {copied ? "Copied!" : "Copy invite link"}
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
        </LandingGlassCard>
      </div>

      <LandingGlassCard className="p-6">
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div>
            <p className="text-2xl font-bold text-white">{data?.totalReferrals ?? 0}</p>
            <p className="text-xs text-sb-muted">Invited</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{data?.qualifiedReferrals ?? 0}</p>
            <p className="text-xs text-sb-muted">Qualified</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{data?.pendingReferrals ?? 0}</p>
            <p className="text-xs text-sb-muted">Pending</p>
          </div>
        </div>

        <p className="text-xs uppercase tracking-wider text-sb-muted mb-3">Milestone Progress</p>
        <div className="space-y-3">
          {(data?.milestones ?? []).map((m) => (
            <div key={m.count} className="flex items-center gap-3">
              <div
                className={[
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                  m.reached ? "bg-sb-purple text-white" : "bg-white/10 text-sb-muted",
                ].join(" ")}
              >
                {m.count}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{m.title}</p>
                <p className="text-xs text-sb-muted">{m.description}</p>
              </div>
              {m.rewarded ? (
                <span className="text-xs text-emerald-400">Claimed</span>
              ) : m.reached ? (
                <span className="text-xs text-sb-purple-light">Ready</span>
              ) : null}
            </div>
          ))}
        </div>
      </LandingGlassCard>
    </div>
  );
}
