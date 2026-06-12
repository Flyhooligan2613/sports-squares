"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import type { ConnectSampleProductSummary } from "@/lib/stripe/connectSample/types";

interface ConnectSampleStorefrontProps {
  accountId: string;
}

function formatMoney(cents: number | null, currency: string | null) {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency ?? "usd",
  }).format(cents / 100);
}

export default function ConnectSampleStorefront({
  accountId,
}: ConnectSampleStorefrontProps) {
  const [products, setProducts] = useState<ConnectSampleProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/connect-sample/products/${accountId}`, {
          cache: "no-store",
        });
        const json = (await res.json()) as {
          products?: ConnectSampleProductSummary[];
          error?: string;
        };
        if (!res.ok) throw new Error(json.error ?? "Failed to load products.");
        setProducts(json.products ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load storefront.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [accountId]);

  async function buy(product: ConnectSampleProductSummary) {
    if (!product.unitAmount) return;
    setCheckingOut(product.id);
    setError(null);
    try {
      const res = await fetch("/api/connect-sample/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          productName: product.name,
          unitAmountCents: product.unitAmount,
          currency: product.currency ?? "usd",
        }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Checkout failed.");
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setCheckingOut(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-emerald-400/90 mb-2">Storefront</p>
        <h1 className="text-3xl font-bold text-white mb-2">Merchant Shop</h1>
        <p className="text-sm text-sb-muted">
          {/* In production, use a merchant slug instead of exposing acct_ IDs in URLs. */}
          Connected account: <span className="font-mono text-xs">{accountId}</span>
        </p>
      </header>

      {error && (
        <LandingGlassCard className="p-4 mb-4 border border-red-500/40">
          <p className="text-red-400 text-sm">{error}</p>
        </LandingGlassCard>
      )}

      {loading ? (
        <p className="text-sb-muted text-sm">Loading products…</p>
      ) : products.length === 0 ? (
        <LandingGlassCard className="p-8 text-center">
          <p className="text-sb-muted text-sm">No products yet. Create one from the merchant dashboard.</p>
        </LandingGlassCard>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <LandingGlassCard key={product.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">{product.name}</h2>
                {product.description && (
                  <p className="text-sm text-sb-muted mt-1">{product.description}</p>
                )}
                <p className="text-emerald-400 font-mono mt-2">
                  {formatMoney(product.unitAmount, product.currency)}
                </p>
              </div>
              <Button
                onClick={() => buy(product)}
                disabled={checkingOut === product.id || !product.unitAmount}
              >
                {checkingOut === product.id ? "Redirecting…" : "Buy now"}
              </Button>
            </LandingGlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
