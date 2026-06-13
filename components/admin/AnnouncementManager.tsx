"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Megaphone, Plus, RefreshCw, Trash2, Zap } from "lucide-react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import {
  AUDIENCE_LABELS,
  CATEGORY_LABELS,
  DISPLAY_TYPE_LABELS,
  FREQUENCY_LABELS,
  type AnnouncementAudience,
  type AnnouncementCategory,
  type AnnouncementDisplayType,
  type AnnouncementFrequency,
  type AnnouncementUpsertInput,
  type PlatformAnnouncement,
} from "@/lib/platform/announcements/types";

const DISPLAY_TYPES = Object.keys(DISPLAY_TYPE_LABELS) as AnnouncementDisplayType[];
const CATEGORIES = Object.keys(CATEGORY_LABELS) as AnnouncementCategory[];
const AUDIENCES = Object.keys(AUDIENCE_LABELS) as AnnouncementAudience[];
const FREQUENCIES = Object.keys(FREQUENCY_LABELS) as AnnouncementFrequency[];

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nowLocalInput(): string {
  return toLocalInput(new Date().toISOString());
}

function scheduleStatus(item: PlatformAnnouncement): {
  label: string;
  tone: "live" | "scheduled" | "expired" | "paused";
} {
  if (!item.active) return { label: "Paused", tone: "paused" };
  const now = Date.now();
  const starts = new Date(item.startsAt).getTime();
  const ends = item.endsAt ? new Date(item.endsAt).getTime() : null;
  if (starts > now) return { label: "Scheduled (not yet live)", tone: "scheduled" };
  if (ends !== null && ends < now) return { label: "Expired", tone: "expired" };
  return { label: "Live on site", tone: "live" };
}

const EMPTY_FORM: AnnouncementUpsertInput = {
  title: "",
  subtitle: "",
  imageUrl: "",
  buttonText: "",
  destinationHref: "",
  displayType: "welcome_popup",
  category: "feature_release",
  audience: "all",
  audienceRegions: [],
  priority: 0,
  dismissible: true,
  frequency: "once",
  startsAt: nowLocalInput(),
  endsAt: "",
  active: true,
};

function formFromAnnouncement(a: PlatformAnnouncement): AnnouncementUpsertInput {
  return {
    title: a.title,
    subtitle: a.subtitle ?? "",
    imageUrl: a.imageUrl ?? "",
    buttonText: a.buttonText ?? "",
    destinationHref: a.destinationHref ?? "",
    displayType: a.displayType,
    category: a.category,
    audience: a.audience,
    audienceRegions: a.audienceRegions,
    priority: a.priority,
    dismissible: a.dismissible,
    frequency: a.frequency,
    startsAt: toLocalInput(a.startsAt),
    endsAt: toLocalInput(a.endsAt),
    active: a.active,
  };
}

function inputClassName() {
  return "w-full rounded-xl bg-white/5 border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sb-purple/40";
}

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [form, setForm] = useState<AnnouncementUpsertInput>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [regionsInput, setRegionsInput] = useState("");
  const [runningAutomation, setRunningAutomation] = useState(false);
  const [startImmediately, setStartImmediately] = useState(true);
  const [deliveryStatus, setDeliveryStatus] = useState<{
    configured?: boolean;
    scheduledCount?: number;
    publicAnonymousPopups?: number;
    publicAnonymousCount?: number;
    error?: string;
  } | null>(null);

  const loadDeliveryStatus = useCallback(async () => {
    const res = await fetch("/api/admin/announcements/delivery-status");
    if (!res.ok) return;
    const data = (await res.json()) as typeof deliveryStatus;
    setDeliveryStatus(data);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/announcements");
    const data = (await res.json()) as {
      announcements?: PlatformAnnouncement[];
      error?: string;
    };
    if (!res.ok) {
      setError(data.error ?? "Failed to load announcements.");
      setLoading(false);
      return;
    }
    setAnnouncements(data.announcements ?? []);
    setLoading(false);
    void loadDeliveryStatus();
  }, [loadDeliveryStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setRegionsInput("");
    setStartImmediately(true);
  }

  function handleEdit(item: PlatformAnnouncement) {
    if (item.source === "automated") {
      showToast("Automated announcements are managed by the NFL calendar engine.");
      return;
    }
    setEditingId(item.id);
    setForm(formFromAnnouncement(item));
    setRegionsInput(item.audienceRegions.join(", "));
    const startsInFuture = new Date(item.startsAt).getTime() > Date.now();
    setStartImmediately(!startsInFuture);
  }

  async function handleRunAutomation() {
    setRunningAutomation(true);
    setError(null);
    const res = await fetch("/api/admin/announcements/automation", { method: "POST" });
    const data = (await res.json()) as {
      result?: { slotsDetected: number; published: number; deactivated: number; slotIds: string[] };
      error?: string;
    };
    setRunningAutomation(false);
    if (!res.ok) {
      setError(data.error ?? "Automation failed.");
      return;
    }
    showToast(
      `Automation complete — ${data.result?.published ?? 0} active, ${data.result?.slotsDetected ?? 0} event slots.`
    );
    await load();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: AnnouncementUpsertInput = {
      ...form,
      audienceRegions: regionsInput
        .split(",")
        .map((r) => r.trim().toUpperCase())
        .filter(Boolean),
      startsAt: startImmediately
        ? new Date().toISOString()
        : form.startsAt
          ? new Date(form.startsAt).toISOString()
          : undefined,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
    };

    const url = editingId
      ? `/api/admin/announcements/${editingId}`
      : "/api/admin/announcements";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string };

    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed.");
      return;
    }

    showToast(editingId ? "Announcement updated." : "Announcement published.");
    resetForm();
    await load();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this announcement?")) return;
    const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Delete failed.");
      return;
    }
    showToast("Announcement deleted.");
    if (editingId === id) resetForm();
    await load();
  }

  async function toggleActive(item: PlatformAnnouncement) {
    const activating = !item.active;
    const patch: Partial<AnnouncementUpsertInput> = { active: activating };

    if (activating) {
      const now = Date.now();
      if (new Date(item.startsAt).getTime() > now) {
        patch.startsAt = new Date().toISOString();
      }
      if (item.endsAt && new Date(item.endsAt).getTime() < now) {
        patch.endsAt = null;
      }
    }

    const res = await fetch(`/api/admin/announcements/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      if (activating && patch.startsAt) {
        showToast("Activated and set to go live now.");
      }
      await load();
    }
  }

  async function handleGoLiveNow(item: PlatformAnnouncement) {
    const res = await fetch(`/api/admin/announcements/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        active: true,
        startsAt: new Date().toISOString(),
        endsAt: null,
      }),
    });
    if (!res.ok) {
      setError("Could not go live.");
      return;
    }
    showToast("Announcement is live now.");
    await load();
  }

  async function handleResetDismissals(id: string) {
    if (!window.confirm("Reset dismissals so all visitors see this again?")) return;
    const res = await fetch(`/api/admin/announcements/${id}/reset-dismissals`, {
      method: "POST",
    });
    if (!res.ok) {
      setError("Could not reset dismissals.");
      return;
    }
    showToast("Dismissals cleared — popup will show again for everyone.");
  }

  return (
    <div className="space-y-6">
      {toast ? (
        <div className="admin-toast-enter fixed bottom-6 right-6 z-50 sb-card px-4 py-3 text-sm text-white border border-emerald-500/30">
          {toast}
        </div>
      ) : null}

      {error ? (
        <LandingGlassCard className="p-4 border border-red-500/30">
          <p className="text-red-400 text-sm">{error}</p>
        </LandingGlassCard>
      ) : null}

      {deliveryStatus ? (
        <LandingGlassCard
          className={`p-4 border ${
            deliveryStatus.configured === false
              ? "border-red-500/40 bg-red-500/5"
              : (deliveryStatus.publicAnonymousPopups ?? 0) > 0
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-amber-500/40 bg-amber-500/5"
          }`}
        >
          <p className="text-sm font-semibold text-white mb-1">Public site delivery</p>
          {deliveryStatus.configured === false ? (
            <p className="text-xs text-red-300">
              {deliveryStatus.error ??
                "Server database key missing — add SUPABASE_SERVICE_ROLE_KEY on Vercel and redeploy."}
            </p>
          ) : (
            <p className="text-xs text-sb-muted leading-relaxed">
              {(deliveryStatus.publicAnonymousPopups ?? 0) > 0
                ? `${deliveryStatus.publicAnonymousPopups} welcome popup(s) delivering to visitors right now.`
                : (deliveryStatus.publicAnonymousCount ?? 0) > 0
                  ? `${deliveryStatus.publicAnonymousCount} announcement(s) live, but none are Welcome Popups — visitors see banners/tickers instead.`
                  : (deliveryStatus.scheduledCount ?? 0) > 0
                    ? `${deliveryStatus.scheduledCount} in schedule window but filtered out (audience, dismissals, or wrong display type).`
                    : "Nothing is live yet — check start time is in the past and Display Type is Welcome Popup for a center modal."}
            </p>
          )}
        </LandingGlassCard>
      ) : null}

      <LandingGlassCard className="p-5 border border-emerald-500/20 bg-emerald-500/5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <p className="text-sm font-semibold text-white">Automated NFL Calendar</p>
            </div>
            <p className="text-xs text-sb-muted leading-relaxed max-w-xl">
              The platform automatically publishes announcements for NFL week opens, Thursday Night
              Football, Sunday Game Day, Monday Championship Tiebreakers, holidays, and Super Bowl
              week. Runs every 30 minutes and after each Pick&apos;em sync. Popups only appear on
              the public site (not in admin) — use Display Type &quot;Welcome Popup&quot; for the
              center modal.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="sb-btn-motion sb-btn-secondary sb-btn-sm inline-flex items-center justify-center font-semibold min-h-[52px] px-6 py-3 rounded-xl"
            >
              Preview homepage
            </Link>
            <Button
              type="button"
              variant="secondary"
              disabled={runningAutomation}
              onClick={() => void handleRunAutomation()}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${runningAutomation ? "animate-spin" : ""}`} />
              {runningAutomation ? "Running…" : "Run automation now"}
            </Button>
          </div>
        </div>
      </LandingGlassCard>

      <LandingGlassCard className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Megaphone className="w-5 h-5 text-sb-purple-light" />
          <h2 className="text-lg font-semibold text-white">
            {editingId ? "Edit Announcement" : "Create Announcement"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">
                Title *
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClassName()}
                placeholder="NFL Week 6 is open"
              />
            </div>
            <div>
              <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">
                Subtitle
              </label>
              <input
                value={form.subtitle ?? ""}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className={inputClassName()}
                placeholder="Make your picks before kickoff"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">
                Image URL
              </label>
              <input
                value={form.imageUrl ?? ""}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className={inputClassName()}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">
                Destination URL
              </label>
              <input
                value={form.destinationHref ?? ""}
                onChange={(e) => setForm({ ...form, destinationHref: e.target.value })}
                className={inputClassName()}
                placeholder="/pickem/week"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">
                Button Text
              </label>
              <input
                value={form.buttonText ?? ""}
                onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                className={inputClassName()}
                placeholder="Play Now"
              />
            </div>
            <div>
              <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">
                Priority (higher first)
              </label>
              <input
                type="number"
                value={form.priority ?? 0}
                onChange={(e) =>
                  setForm({ ...form, priority: Number.parseInt(e.target.value, 10) || 0 })
                }
                className={inputClassName()}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">
                Display Type
              </label>
              <select
                value={form.displayType}
                onChange={(e) =>
                  setForm({ ...form, displayType: e.target.value as AnnouncementDisplayType })
                }
                className={inputClassName()}
              >
                {DISPLAY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {DISPLAY_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-sb-muted mt-1">
                {form.displayType === "welcome_popup"
                  ? "Center-screen modal on the homepage and public pages."
                  : form.displayType === "top_banner"
                    ? "Thin strip at the top — not a popup."
                    : "See label for placement on the public site."}
              </p>
            </div>
            <div>
              <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as AnnouncementCategory })
                }
                className={inputClassName()}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">
                Audience
              </label>
              <select
                value={form.audience}
                onChange={(e) =>
                  setForm({ ...form, audience: e.target.value as AnnouncementAudience })
                }
                className={inputClassName()}
              >
                {AUDIENCES.map((a) => (
                  <option key={a} value={a}>
                    {AUDIENCE_LABELS[a]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">
                Frequency
              </label>
              <select
                value={form.frequency}
                onChange={(e) =>
                  setForm({ ...form, frequency: e.target.value as AnnouncementFrequency })
                }
                className={inputClassName()}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {FREQUENCY_LABELS[f]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">
              Location Regions (optional)
            </label>
            <input
              value={regionsInput}
              onChange={(e) => setRegionsInput(e.target.value)}
              className={inputClassName()}
              placeholder="US, US-TX, CA"
            />
            <p className="text-xs text-sb-muted mt-1">
              Comma-separated country or region codes. Leave blank for all locations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">
                Start Date
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-white mb-2">
                <input
                  type="checkbox"
                  checked={startImmediately}
                  onChange={(e) => setStartImmediately(e.target.checked)}
                  className="rounded border-white/20"
                />
                Start immediately (recommended)
              </label>
              <input
                type="datetime-local"
                value={form.startsAt?.slice(0, 16) ?? ""}
                onChange={(e) => {
                  setStartImmediately(false);
                  setForm({ ...form, startsAt: e.target.value });
                }}
                disabled={startImmediately}
                className={`${inputClassName()} disabled:opacity-40`}
              />
            </div>
            <div>
              <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">
                End Date (optional)
              </label>
              <input
                type="datetime-local"
                value={form.endsAt?.slice(0, 16) ?? ""}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className={inputClassName()}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-white">
              <input
                type="checkbox"
                checked={form.dismissible ?? true}
                onChange={(e) => setForm({ ...form, dismissible: e.target.checked })}
                className="rounded border-white/20"
              />
              Dismissible
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-white">
              <input
                type="checkbox"
                checked={form.active ?? true}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="rounded border-white/20"
              />
              Active
            </label>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Update" : "Publish"}
            </Button>
            {editingId ? (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </LandingGlassCard>

      <LandingGlassCard className="overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted">
            Scheduled Announcements
          </h2>
          <button
            type="button"
            onClick={() => resetForm()}
            className="text-xs text-sb-purple-light hover:text-white inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        {loading ? (
          <p className="p-6 text-sb-muted text-sm">Loading…</p>
        ) : announcements.length === 0 ? (
          <p className="p-6 text-sb-muted text-sm">No announcements yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {announcements.map((item) => {
              const status = scheduleStatus(item);
              const statusClass =
                status.tone === "live"
                  ? "border-emerald-500/40 text-emerald-300"
                  : status.tone === "scheduled"
                    ? "border-amber-500/40 text-amber-300"
                    : status.tone === "expired"
                      ? "border-red-500/40 text-red-300"
                      : "border-white/20 text-sb-muted";

              return (
              <div
                key={item.id}
                className="px-5 py-4 flex flex-wrap items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-white font-medium">{item.title}</p>
                    <span
                      className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${statusClass}`}
                    >
                      {status.label}
                    </span>
                    {item.source === "automated" ? (
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full border border-sky-500/40 text-sky-300">
                        Automated
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-sb-muted">
                    {DISPLAY_TYPE_LABELS[item.displayType]} · {AUDIENCE_LABELS[item.audience]} ·{" "}
                    {FREQUENCY_LABELS[item.frequency]} · Priority {item.priority}
                  </p>
                  {status.tone === "scheduled" ? (
                    <p className="text-xs text-amber-300/90 mt-1">
                      Starts {new Date(item.startsAt).toLocaleString()} — use Go live now or edit
                      start time.
                    </p>
                  ) : null}
                  {status.tone === "live" && item.displayType !== "welcome_popup" ? (
                    <p className="text-xs text-amber-300/90 mt-1">
                      Live as {DISPLAY_TYPE_LABELS[item.displayType]} — change to Welcome Popup for
                      a center modal.
                    </p>
                  ) : null}
                  {item.subtitle ? (
                    <p className="text-xs text-white/60 mt-1 truncate">{item.subtitle}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    disabled={item.source === "automated"}
                    className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleActive(item)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white hover:bg-white/5"
                  >
                    {item.active ? "Pause" : "Activate"}
                  </button>
                  {status.tone !== "live" && item.source !== "automated" ? (
                    <button
                      type="button"
                      onClick={() => void handleGoLiveNow(item)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                    >
                      Go live now
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void handleResetDismissals(item.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white hover:bg-white/5"
                  >
                    Reset dismissals
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </LandingGlassCard>
    </div>
  );
}
