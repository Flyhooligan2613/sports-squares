"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import type { ConnectSampleAccountStatus } from "@/lib/stripe/connectSample/types";

interface ConnectSampleDashboardProps {
  initialAccountId?: string | null;
}

function formatMoney(cents: number | null, currency: string | null) {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency ?? "usd",
  }).format(cents / 100);
}

export default function ConnectSampleDashboard({
  initialAccountId = null,
}: ConnectSampleDashboardProps) {
  const [email, setEmail] = useState("merchant@example.com");
  const [displayName, setDisplayName] = useState("Demo Merchant");
  const [accountId, setAccountId] = useState<string | null>(initialAccountId);
  const [status, setStatus] = useState<ConnectSampleAccountStatus | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [productName, setProductName] = useState("SquareBoards Tee");
  const [productDescription, setProductDescription] = useState("Sample merch item");
  const [productPrice, setProductPrice] = useState("2500");
  const [isLocalDev, setIsLocalDev] = useState(true);

  useEffect(() => {
    setIsLocalDev(window.location.hostname === "localhost");
  }, []);

  const storefrontHref = useMemo(
    () => (accountId ? `/connect-sample/storefront/${accountId}` : null),
    [accountId]
  );

  const refreshStatus = useCallback(async (id: string) => {
    const res = await fetch(`/api/connect-sample/accounts?accountId=${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    const json = (await res.json()) as {
      status?: ConnectSampleAccountStatus;
      error?: string;
    };
    if (!res.ok) throw new Error(json.error ?? "Failed to load account status.");
    setStatus(json.status ?? null);
  }, []);

  useEffect(() => {
    if (!accountId) return;
    void refreshStatus(accountId).catch((err) =>
      setError(err instanceof Error ? err.message : "Status refresh failed.")
    );
  }, [accountId, refreshStatus]);

  async function loadMapping() {
    setError(null);
    const res = await fetch(`/api/connect-sample/mapping?email=${encodeURIComponent(email)}`);
    const json = (await res.json()) as {
      record?: { stripe_account_id: string; subscription_status: string | null };
      error?: string;
    };
    if (!res.ok) throw new Error(json.error ?? "Failed to load mapping.");
    if (json.record?.stripe_account_id) {
      setAccountId(json.record.stripe_account_id);
      setSubscriptionStatus(json.record.subscription_status);
    }
  }

  async function createAccount() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/connect-sample/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, contactEmail: email }),
      });
      const json = (await res.json()) as {
        accountId?: string;
        status?: ConnectSampleAccountStatus;
        error?: string;
      };
      if (!res.ok || !json.accountId) {
        throw new Error(json.error ?? "Failed to create account.");
      }
      setAccountId(json.accountId);
      setStatus(json.status ?? null);
      setMessage(`Connected account created: ${json.accountId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create account failed.");
    } finally {
      setLoading(false);
    }
  }

  async function startOnboarding() {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/connect-sample/account-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Onboarding failed.");
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onboarding failed.");
      setLoading(false);
    }
  }

  async function createProduct() {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/connect-sample/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          name: productName,
          description: productDescription,
          priceInCents: Number(productPrice),
        }),
      });
      const json = (await res.json()) as { error?: string; product?: { name: string } };
      if (!res.ok) throw new Error(json.error ?? "Product creation failed.");
      setMessage(`Product created: ${json.product?.name ?? productName}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Product creation failed.");
    } finally {
      setLoading(false);
    }
  }

  async function startSubscription() {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/connect-sample/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Subscription checkout failed.");
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Subscription checkout failed.");
      setLoading(false);
    }
  }

  async function openBillingPortal() {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/connect-sample/subscription/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Billing portal failed.");
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Billing portal failed.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-emerald-400/90 mb-2">
          Stripe Connect Sample
        </p>
        <h1 className="text-3xl font-bold text-white mb-2">Accounts v2 Demo</h1>
        <p className="text-sb-muted text-sm leading-relaxed">
          Onboard connected accounts, create products, run a storefront, and charge subscriptions.
          Requires <code className="text-emerald-300">stripe@latest</code> and Accounts v2 enabled in Stripe.
        </p>
      </header>

      {!isLocalDev && (
        <LandingGlassCard className="p-4 border border-yellow-500/40">
          <p className="text-yellow-200 text-sm">
            You are on production. This demo uses your local Stripe test key — open{" "}
            <a href="http://localhost:3000/connect-sample" className="underline text-emerald-300">
              http://localhost:3000/connect-sample
            </a>{" "}
            while developing, or update <code>STRIPE_SECRET_KEY</code> on Vercel to match your new
            test key.
          </p>
        </LandingGlassCard>
      )}

      {error && (
        <LandingGlassCard className="p-4 border border-red-500/40">
          <p className="text-red-400 text-sm">{error}</p>
          {error.includes("Permission denied") && (
            <p className="text-sb-muted text-xs mt-2">
              If you finished Stripe onboarding, you were likely sent back to production. Open{" "}
              <a href="http://localhost:3000/connect-sample" className="text-emerald-300 underline">
                localhost:3000/connect-sample
              </a>
              , click <strong>Onboard to collect payments</strong> again, then complete onboarding
              once more so the return URL stays on localhost.
            </p>
          )}
        </LandingGlassCard>
      )}
      {message && (
        <LandingGlassCard className="p-4 border border-emerald-500/30">
          <p className="text-emerald-300 text-sm">{message}</p>
        </LandingGlassCard>
      )}

      <LandingGlassCard className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">1. Create connected account</h2>
        <p className="text-sm text-sb-muted">
          Uses <code>stripeClient.v2.core.accounts.create</code> — no top-level{" "}
          <code>type</code> field.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="text-sb-muted">Display name</span>
            <input
              className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="text-sb-muted">Contact email (demo user key)</span>
            <input
              className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => createAccount()} disabled={loading}>
            Create account
          </Button>
          <Button variant="secondary" onClick={() => loadMapping()} disabled={loading}>
            Load saved mapping
          </Button>
        </div>
        {accountId && (
          <p className="text-xs text-sb-muted font-mono break-all">Account ID: {accountId}</p>
        )}
      </LandingGlassCard>

      <LandingGlassCard className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">2. Onboarding status (live API)</h2>
        <p className="text-sm text-sb-muted">
          Status is always fetched from Stripe — not stored in the database for this demo.
        </p>
        {status ? (
          <ul className="text-sm space-y-1 text-sb-muted">
            <li>
              Payments ready:{" "}
              <span className={status.readyToProcessPayments ? "text-emerald-400" : "text-yellow-400"}>
                {status.readyToProcessPayments ? "Yes" : "Not yet"}
              </span>
            </li>
            <li>
              Onboarding complete:{" "}
              <span className={status.onboardingComplete ? "text-emerald-400" : "text-yellow-400"}>
                {status.onboardingComplete ? "Yes" : "Incomplete"}
              </span>
            </li>
            <li>Requirements: {status.requirementsStatus ?? "unknown"}</li>
            <li>Card payments: {status.cardPaymentsStatus ?? "unknown"}</li>
          </ul>
        ) : (
          <p className="text-sm text-sb-muted">Create an account to see live status.</p>
        )}
        <Button onClick={() => startOnboarding()} disabled={loading || !accountId}>
          Onboard to collect payments
        </Button>
      </LandingGlassCard>

      <LandingGlassCard className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">3. Create a product</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="block text-sm sm:col-span-1">
            <span className="text-sb-muted">Name</span>
            <input
              className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-sb-muted">Description</span>
            <input
              className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="text-sb-muted">Price (cents)</span>
            <input
              className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
            />
          </label>
        </div>
        <p className="text-xs text-sb-muted">
          Example price: {formatMoney(Number(productPrice) || 0, "usd")}
        </p>
        <Button onClick={() => createProduct()} disabled={loading || !accountId}>
          Create product on connected account
        </Button>
        {storefrontHref && (
          <Link href={storefrontHref} className="text-sm text-emerald-400 hover:underline block">
            Open storefront →
          </Link>
        )}
      </LandingGlassCard>

      <LandingGlassCard className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">4. Platform subscription</h2>
        <p className="text-sm text-sb-muted">
          Uses <code>customer_account</code> with the connected account ID (V2).
          Set <code>STRIPE_CONNECT_SAMPLE_SUBSCRIPTION_PRICE_ID=price_***</code> in env.
        </p>
        {subscriptionStatus && (
          <p className="text-sm text-sb-muted">
            Cached subscription status:{" "}
            <span className="text-white">{subscriptionStatus}</span>
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => startSubscription()} disabled={loading || !accountId}>
            Subscribe to platform
          </Button>
          <Button variant="secondary" onClick={() => openBillingPortal()} disabled={loading || !accountId}>
            Manage billing
          </Button>
        </div>
      </LandingGlassCard>
    </div>
  );
}
