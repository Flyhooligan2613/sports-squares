"use client";

import { useCallback, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import type { SecurityEventType } from "@/lib/auth/security/db";
import { securityEventLabel } from "@/lib/auth/security/securityCenter";

interface PlayerSummary {
  email: string;
  emailVerified: boolean;
  biometricEnabled: boolean;
  pinEnabled: boolean;
  accountSuspended: boolean;
  securityFlagged: boolean;
  trustedDeviceCount: number;
  savedPaymentLast4: string | null;
  devices: {
    id: string;
    deviceName: string;
    customName: string | null;
    platform: string;
    browserName: string | null;
    lastLocation: string | null;
    lastActiveAt: string;
    registeredAt: string;
  }[];
  recentEvents: {
    id: string;
    eventType: string;
    label?: string;
    metadata: Record<string, unknown>;
    createdAt: string;
  }[];
}

export default function AdminSecurityClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [selected, setSelected] = useState<PlayerSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    if (query.trim().length < 2) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/security/players?q=${encodeURIComponent(query.trim())}`);
    const data = (await res.json()) as { players?: string[]; error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Search failed.");
      return;
    }
    setResults(data.players ?? []);
  }, [query]);

  async function loadPlayer(email: string) {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/security/players/${encodeURIComponent(email)}`);
    const data = (await res.json()) as PlayerSummary & { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not load player.");
      return;
    }
    setSelected(data);
  }

  async function runAction(action: string, deviceId?: string) {
    if (!selected) return;
    setBusy(true);
    setError(null);
    const res = await fetch(
      `/api/admin/security/players/${encodeURIComponent(selected.email)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, deviceId }),
      }
    );
    const data = (await res.json()) as { summary?: PlayerSummary; error?: string };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Action failed.");
      return;
    }
    if (data.summary) setSelected(data.summary);
    else await loadPlayer(selected.email);
  }

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Player Security"
        subtitle="Force logout, revoke devices, review login history. PINs and biometrics are never visible."
      />

      <LandingGlassCard className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search player email"
            className="player-input flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") void search();
            }}
          />
          <Button disabled={loading} onClick={() => void search()}>
            {loading ? "Searching…" : "Search"}
          </Button>
        </div>

        {results.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {results.map((email) => (
              <button
                key={email}
                type="button"
                onClick={() => void loadPlayer(email)}
                className="text-sm px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-white hover:border-sb-purple-light/40"
              >
                {email}
              </button>
            ))}
          </div>
        ) : null}
      </LandingGlassCard>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {selected ? (
        <>
          <LandingGlassCard className="p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-sb-muted">Player</p>
                <h2 className="text-xl font-bold text-white">{selected.email}</h2>
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  {selected.accountSuspended ? (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
                      Suspended
                    </span>
                  ) : null}
                  {selected.securityFlagged ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Flagged
                    </span>
                  ) : null}
                  {selected.biometricEnabled ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Biometrics
                    </span>
                  ) : null}
                  {selected.pinEnabled ? (
                    <span className="px-2 py-0.5 rounded-full bg-sb-purple/15 text-sb-purple-light border border-sb-purple/30">
                      Quick PIN (device-only)
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="text-sm text-sb-muted text-right">
                <p>{selected.trustedDeviceCount} trusted devices</p>
                {selected.savedPaymentLast4 ? (
                  <p>Saved card ···· {selected.savedPaymentLast4}</p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => void runAction("force_logout")}
              >
                Force logout
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() =>
                  void runAction(selected.accountSuspended ? "unsuspend" : "suspend")
                }
              >
                {selected.accountSuspended ? "Unsuspend" : "Suspend account"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => void runAction(selected.securityFlagged ? "unflag" : "flag")}
              >
                {selected.securityFlagged ? "Clear flag" : "Flag suspicious"}
              </Button>
            </div>
          </LandingGlassCard>

          <LandingGlassCard className="p-5">
            <h3 className="text-lg font-semibold text-white mb-3">Trusted devices</h3>
            <div className="space-y-2">
              {selected.devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div>
                    <p className="text-white font-medium">
                      {device.customName || device.deviceName}
                    </p>
                    <p className="text-xs text-sb-muted capitalize">
                      {device.platform}
                      {device.browserName ? ` · ${device.browserName}` : ""}
                      {device.lastLocation ? ` · ${device.lastLocation}` : ""}
                    </p>
                    <p className="text-xs text-sb-muted">
                      Last active {new Date(device.lastActiveAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => void runAction("revoke_device", device.id)}
                  >
                    Revoke
                  </Button>
                </div>
              ))}
              {selected.devices.length === 0 ? (
                <p className="text-sm text-sb-muted">No active trusted devices.</p>
              ) : null}
            </div>
          </LandingGlassCard>

          <LandingGlassCard className="p-5">
            <h3 className="text-lg font-semibold text-white mb-3">Login & security history</h3>
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {selected.recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <p className="text-white text-sm font-medium">
                    {event.label ?? securityEventLabel(event.eventType as SecurityEventType)}
                  </p>
                  <p className="text-xs text-sb-muted mt-1">
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {selected.recentEvents.length === 0 ? (
                <p className="text-sm text-sb-muted">No security events recorded.</p>
              ) : null}
            </div>
          </LandingGlassCard>
        </>
      ) : null}
    </div>
  );
}
