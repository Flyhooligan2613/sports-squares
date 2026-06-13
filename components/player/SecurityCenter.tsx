"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import TrustedDevicesSettings from "@/components/player/TrustedDevicesSettings";
import PasswordSettings from "@/components/player/PasswordSettings";
import { getOrCreateDeviceKey } from "@/lib/auth/security/deviceClient";
import { fetchAuthBootstrap } from "@/lib/auth/security/webauthnClient";
import { isQuickPinEnabledLocally } from "@/lib/auth/security/quickPin";

interface DashboardData {
  score: number;
  biometricEnabled: boolean;
  pinEnabled: boolean;
  activeSessions: number;
  tips: string[];
  recentEvents: {
    id: string;
    label: string;
    metadata: Record<string, unknown>;
    createdAt: string;
  }[];
}

function scoreColor(score: number): string {
  if (score >= 90) return "text-emerald-300";
  if (score >= 70) return "text-sb-purple-light";
  return "text-amber-300";
}

export default function SecurityCenter() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerEmail, setPlayerEmail] = useState("");
  const deviceKey = getOrCreateDeviceKey();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const bootstrap = await fetchAuthBootstrap();
      if (bootstrap.email) setPlayerEmail(bootstrap.email);

      const res = await fetch(`/api/auth/security/dashboard?deviceKey=${encodeURIComponent(deviceKey)}`, {
        cache: "no-store",
        credentials: "include",
      });
      const payload = (await res.json()) as DashboardData & { error?: string };
      if (cancelled) return;
      if (!res.ok) {
        setError(payload.error ?? "Could not load security dashboard.");
        setLoading(false);
        return;
      }
      setData(payload);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [deviceKey]);

  const pinActiveLocally = data?.pinEnabled || (playerEmail ? isQuickPinEnabledLocally(playerEmail) : false);

  return (
    <div className="space-y-6">
      <LandingGlassCard className="p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-sb-purple-light mb-1">Security Center</p>
        <h2 className="text-2xl font-bold text-white">Your protection</h2>
        {loading ? <p className="text-sm text-sb-muted mt-4">Loading security score…</p> : null}
        {error ? <p className="text-sm text-red-300 mt-4">{error}</p> : null}
        {data ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-sb-muted uppercase tracking-wider">Security score</p>
              <p className={`text-4xl font-bold mt-2 ${scoreColor(data.score)}`}>{data.score}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2 text-sm">
              <p className="flex justify-between"><span>Biometric</span><span className="text-white">{data.biometricEnabled ? "Enabled" : "Off"}</span></p>
              <p className="flex justify-between"><span>Quick PIN</span><span className="text-white">{data.pinEnabled || pinActiveLocally ? "Enabled" : "Off"}</span></p>
              <p className="flex justify-between"><span>Trusted devices</span><span className="text-white">{data.activeSessions}</span></p>
              <p className="flex justify-between"><span>Active sessions</span><span className="text-white">{data.activeSessions}</span></p>
            </div>
          </div>
        ) : null}
      </LandingGlassCard>

      {data?.recentEvents?.length ? (
        <LandingGlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent security events</h3>
          <div className="space-y-3">
            {data.recentEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <p className="text-white font-medium">{event.label}</p>
                <p className="text-xs text-sb-muted mt-1">
                  {new Date(event.createdAt).toLocaleString()}
                  {event.metadata.location ? ` · ${String(event.metadata.location)}` : ""}
                  {event.metadata.device ? ` · ${String(event.metadata.device)}` : ""}
                  {event.metadata.amount ? ` · ${String(event.metadata.amount)}` : ""}
                </p>
              </div>
            ))}
          </div>
        </LandingGlassCard>
      ) : null}

      {data?.tips?.length ? (
        <LandingGlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Security tips</h3>
          <ul className="space-y-2 text-sm text-sb-muted">
            {data.tips.map((tip) => (
              <li key={tip} className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                {tip}
              </li>
            ))}
          </ul>
        </LandingGlassCard>
      ) : null}

      <PasswordSettings />

      <TrustedDevicesSettings />
    </div>
  );
}
