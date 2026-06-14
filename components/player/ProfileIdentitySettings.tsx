"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";

interface IdentityData {
  firstName: string | null;
  lastName: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
}

export default function ProfileIdentitySettings() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function loadIdentity() {
    const res = await fetch("/api/player/identity", { cache: "no-store", credentials: "include" });
    const json = (await res.json()) as IdentityData;
    setFirstName(json.firstName ?? "");
    setLastName(json.lastName ?? "");
    setAddressLine1(json.addressLine1 ?? "");
    setAddressLine2(json.addressLine2 ?? "");
    setCity(json.city ?? "");
    setState(json.state ?? "");
    setPostalCode(json.postalCode ?? "");
  }

  useEffect(() => {
    void loadIdentity().finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/player/identity", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
      }),
    });
    const json = (await res.json()) as IdentityData & { error?: string };
    setSaving(false);

    if (!res.ok) {
      setError(json.error ?? "Could not save profile.");
      return;
    }

    await loadIdentity();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  if (loading) {
    return (
      <LandingGlassCard className="p-6 text-sm text-sb-muted animate-pulse">
        Loading account details…
      </LandingGlassCard>
    );
  }

  return (
    <LandingGlassCard className="p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-2">
        Name &amp; address
      </h3>
      <p className="text-xs text-sb-muted mb-5">
        Used for account verification and payouts. Update anytime — manage password and biometrics under{" "}
        <a href="/my-games/security" className="text-sb-glow hover:underline">
          Security
        </a>
        .
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="profile-first-name" className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2">
              First name
            </label>
            <input
              id="profile-first-name"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="player-input w-full"
              required
              minLength={2}
            />
          </div>
          <div>
            <label htmlFor="profile-last-name" className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2">
              Last name
            </label>
            <input
              id="profile-last-name"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="player-input w-full"
              required
              minLength={2}
            />
          </div>
        </div>

        <div>
          <label htmlFor="profile-address1" className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2">
            Street address
          </label>
          <input
            id="profile-address1"
            type="text"
            autoComplete="address-line1"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            className="player-input w-full"
          />
        </div>

        <div>
          <label htmlFor="profile-address2" className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2">
            Apt / suite (optional)
          </label>
          <input
            id="profile-address2"
            type="text"
            autoComplete="address-line2"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            className="player-input w-full"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="profile-city" className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2">
              City
            </label>
            <input
              id="profile-city"
              type="text"
              autoComplete="address-level2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="player-input w-full"
            />
          </div>
          <div>
            <label htmlFor="profile-state" className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2">
              State
            </label>
            <input
              id="profile-state"
              type="text"
              autoComplete="address-level1"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="player-input w-full"
            />
          </div>
          <div>
            <label htmlFor="profile-zip" className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2">
              ZIP
            </label>
            <input
              id="profile-zip"
              type="text"
              autoComplete="postal-code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="player-input w-full"
            />
          </div>
        </div>

        {error ? (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            Profile saved.
          </p>
        ) : null}

        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save details"}
        </Button>
      </form>
    </LandingGlassCard>
  );
}
