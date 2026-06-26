"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Mail } from "lucide-react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import BrandedLoadingLabel from "@/components/ui/BrandedLoadingLabel";
import NotificationHubShell from "@/components/player/NotificationHubShell";
import { getPlayerSessionUser } from "@/lib/auth/playerAuthClient";
import { subscribeToPushNotifications } from "@/lib/push/clientSubscribe";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  loadNotificationPreferences,
  PREFERENCE_CATEGORY_LABELS,
  saveNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/notifications/preferenceState";
import { formatUserError } from "@/lib/errors/formatUserError";

export default function NotificationSettingsPanel() {
  const [email, setEmail] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pushBusy, setPushBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await getPlayerSessionUser();
      if (!user?.email) {
        setError("Sign in to manage notification settings.");
        return;
      }
      setEmail(user.email);
      setPrefs(loadNotificationPreferences(user.email));

      const res = await fetch("/api/player/notification-preferences", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { pushSubscribed?: boolean };
        setPushSubscribed(Boolean(data.pushSubscribed));
      }
    } catch (err) {
      setError(formatUserError(err, "load"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function updatePref<K extends keyof NotificationPreferences>(key: K, value: boolean) {
    if (!email) return;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    saveNotificationPreferences(email, next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  async function handlePushToggle(enabled: boolean) {
    if (!email) return;
    setPushBusy(true);
    setError(null);

    try {
      if (enabled) {
        const result = await subscribeToPushNotifications();
        if (!result.ok) {
          setError(result.error ?? "Could not enable push notifications.");
          return;
        }
      }

      const res = await fetch("/api/player/notification-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pushEnabled: enabled }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to update push settings.");
      }

      const data = (await res.json()) as { pushSubscribed?: boolean };
      setPushSubscribed(Boolean(data.pushSubscribed));
      updatePref("pushEnabled", enabled);
    } catch (err) {
      setError(formatUserError(err, "save"));
    } finally {
      setPushBusy(false);
    }
  }

  if (loading) {
    return (
      <NotificationHubShell
        title="Settings"
        subtitle="Choose what reaches you — in-app, push, and email."
      >
        <BrandedLoadingLabel context="general" className="text-center text-sb-muted py-12" />
      </NotificationHubShell>
    );
  }

  if (error && !email) {
    return (
      <NotificationHubShell
        title="Settings"
        subtitle="Choose what reaches you — in-app, push, and email."
      >
        <LandingGlassCard className="p-8 text-center">
          <p className="text-white font-semibold">{error}</p>
        </LandingGlassCard>
      </NotificationHubShell>
    );
  }

  return (
    <NotificationHubShell
      title="Settings"
      subtitle="Choose what reaches you — in-app, push, and email."
      actions={
        saved ? (
          <span className="text-xs font-semibold text-emerald-400 shrink-0">Saved</span>
        ) : null
      }
    >
      {error ? (
        <p className="text-sm text-amber-300 mb-4" role="alert">
          {error}
        </p>
      ) : null}

      <div className="space-y-4">
        <LandingGlassCard className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
            Delivery channels
          </h2>
          <ul className="space-y-3">
            <li>
              <ToggleRow
                icon={<Bell className="w-4 h-4" />}
                label="Push notifications"
                description={
                  pushSubscribed
                    ? "Game-day alerts on this device."
                    : "Enable alerts for kickoffs, wins, and contest updates."
                }
                checked={pushSubscribed && prefs.pushEnabled}
                disabled={pushBusy}
                onChange={(v) => void handlePushToggle(v)}
              />
            </li>
            <li>
              <ToggleRow
                icon={<Mail className="w-4 h-4" />}
                label="Email updates"
                description="Important account and payout notices. (UI-ready — delivery queue coming soon.)"
                checked={prefs.emailEnabled}
                onChange={(v) => updatePref("emailEnabled", v)}
              />
            </li>
          </ul>
        </LandingGlassCard>

        <LandingGlassCard className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
            Alert categories
          </h2>
          <ul className="space-y-3">
            {PREFERENCE_CATEGORY_LABELS.map((item) => (
              <li key={item.key}>
                <ToggleRow
                  icon={<BellOff className="w-4 h-4 opacity-60" />}
                  label={item.label}
                  description={item.description}
                  checked={prefs[item.key]}
                  onChange={(v) => updatePref(item.key, v)}
                />
              </li>
            ))}
          </ul>
          <p className="text-xs text-sb-muted mt-4 leading-relaxed">
            Category preferences are saved on this device. Push delivery uses your enrolled
            device subscription when push is configured on the server.
          </p>
        </LandingGlassCard>
      </div>
    </NotificationHubShell>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="flex items-start gap-3 min-h-[44px]">
      <span className="mt-1 text-sb-glow shrink-0" aria-hidden>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <label htmlFor={id} className="text-sm font-semibold text-white block">
          {label}
        </label>
        <p className="text-xs text-sb-muted mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${label}: ${checked ? "on" : "off"}`}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          "notification-toggle shrink-0 min-w-[52px] min-h-[32px] rounded-full border transition-all duration-[250ms]",
          checked
            ? "bg-sb-glow/30 border-sb-glow/50"
            : "bg-white/5 border-white/15",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-white/25",
        ].join(" ")}
      >
        <span
          className={[
            "notification-toggle-knob block w-5 h-5 rounded-full bg-white shadow transition-transform duration-[250ms]",
            checked ? "translate-x-6" : "translate-x-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
