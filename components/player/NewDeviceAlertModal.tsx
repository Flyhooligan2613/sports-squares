"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { getOrCreateDeviceKey } from "@/lib/auth/security/deviceClient";

interface UnacknowledgedDevice {
  id: string;
  deviceName: string;
  platform: string;
  browserName: string | null;
  lastLocation: string | null;
  registeredAt: string;
}

export default function NewDeviceAlertModal() {
  const [device, setDevice] = useState<UnacknowledgedDevice | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const deviceKey = getOrCreateDeviceKey();
      const res = await fetch(`/api/auth/security/dashboard?deviceKey=${encodeURIComponent(deviceKey)}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        unacknowledgedDevices?: UnacknowledgedDevice[];
      };
      if (cancelled) return;
      setDevice(data.unacknowledgedDevices?.[0] ?? null);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAction(action: "acknowledge" | "secure_account") {
    if (!device) return;
    setLoading(true);
    const res = await fetch("/api/auth/security/device-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ deviceId: device.id, action }),
    });
    setLoading(false);

    if (action === "secure_account" && res.ok) {
      window.location.href = "/my-games/login";
      return;
    }

    setDevice(null);
  }

  if (!device) return null;

  return (
    <div className="fixed inset-0 z-[145] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <LandingGlassCard className="w-full max-w-md p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-sb-purple-light mb-2">Security alert</p>
        <h2 className="text-2xl font-bold text-white mb-2">New login detected</h2>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 mb-6 text-sm">
          <p className="text-white font-medium">{device.deviceName}</p>
          <p className="text-sb-muted mt-1 capitalize">
            {device.platform}
            {device.browserName ? ` · ${device.browserName}` : ""}
          </p>
          {device.lastLocation ? <p className="text-sb-muted mt-1">{device.lastLocation}</p> : null}
          <p className="text-sb-muted mt-1">{new Date(device.registeredAt).toLocaleString()}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Button disabled={loading} onClick={() => void handleAction("acknowledge")}>
            This was me
          </Button>
          <Button variant="ghost" disabled={loading} onClick={() => void handleAction("secure_account")}>
            Secure my account
          </Button>
        </div>
      </LandingGlassCard>
    </div>
  );
}
