"use client";

import { useCallback, useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import {
  detectDeviceInfo,
  getOrCreateDeviceKey,
  isWebAuthnAvailable,
} from "@/lib/auth/security/deviceClient";
import { setStepUpToken } from "@/lib/auth/security/deviceClient";
import { confirmSensitiveActionWithBiometric } from "@/lib/auth/security/webauthnClient";
import { signOutPlayer } from "@/lib/auth/playerAuthClient";

interface TrustedDeviceRow {
  id: string;
  deviceName: string;
  platform: string;
  lastActiveAt: string;
  registeredAt: string;
  isCurrent: boolean;
}

export default function TrustedDevicesSettings() {
  const [devices, setDevices] = useState<TrustedDeviceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const deviceKey = getOrCreateDeviceKey();
  const currentDevice = detectDeviceInfo(navigator.userAgent, deviceKey);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/auth/device?deviceKey=${encodeURIComponent(deviceKey)}`, {
      cache: "no-store",
      credentials: "include",
    });
    const data = (await res.json()) as { devices?: TrustedDeviceRow[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not load trusted devices.");
      setLoading(false);
      return;
    }
    setDevices(data.devices ?? []);
    setLoading(false);
  }, [deviceKey]);

  useEffect(() => {
    void load();
  }, [load]);

  async function removeDevice(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/auth/device/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setBusyId(null);
    if (!res.ok) {
      setError("Could not remove device.");
      return;
    }
    await load();
  }

  async function signOutAllDevices() {
    setBusyId("all");
    await fetch("/api/auth/device/sign-out-all", {
      method: "POST",
      credentials: "include",
    });
    setBusyId(null);
    window.location.href = "/my-games/login";
  }

  async function signOutThisDevice() {
    await signOutPlayer();
    window.location.href = "/my-games/login";
  }

  return (
    <LandingGlassCard className="p-6 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-sb-purple-light mb-1">Security</p>
        <h2 className="text-xl font-bold text-white">Trusted devices</h2>
        <p className="text-sm text-sb-muted mt-2">
          Devices that completed email verification can use biometric unlock and stay signed in.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <p className="text-xs text-sb-muted uppercase tracking-wider">This device</p>
        <p className="text-white font-medium mt-1">{currentDevice.deviceName}</p>
        <p className="text-xs text-sb-muted mt-1 capitalize">{currentDevice.platform}</p>
      </div>

      {loading ? <p className="text-sm text-sb-muted">Loading devices…</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {!loading && devices.length === 0 ? (
        <p className="text-sm text-sb-muted">No trusted devices yet. Sign in once to register this device.</p>
      ) : null}

      <div className="space-y-3">
        {devices.map((device) => (
          <div
            key={device.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-white font-medium truncate">
                {device.deviceName}
                {device.isCurrent ? (
                  <span className="ml-2 text-[11px] uppercase tracking-wider text-sb-purple-light">
                    Current
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-sb-muted mt-1 capitalize">
                {device.platform} · Last active{" "}
                {new Date(device.lastActiveAt).toLocaleString()}
              </p>
            </div>
            {!device.isCurrent ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={busyId === device.id}
                onClick={() => void removeDevice(device.id)}
              >
                Remove
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button variant="secondary" disabled={busyId === "all"} onClick={() => void signOutThisDevice()}>
          Sign out on this device
        </Button>
        <Button variant="ghost" disabled={busyId === "all"} onClick={() => void signOutAllDevices()}>
          Sign out everywhere
        </Button>
      </div>
    </LandingGlassCard>
  );
}

export async function ensurePayoutStepUp(): Promise<string | null> {
  if (!isWebAuthnAvailable()) return null;
  try {
    const token = await confirmSensitiveActionWithBiometric("payout_change");
    setStepUpToken(token);
    return token;
  } catch {
    return null;
  }
}
