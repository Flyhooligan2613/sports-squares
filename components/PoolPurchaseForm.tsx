"use client";

import { useState } from "react";
import type { Pool } from "@/lib/types";

interface PoolPurchaseFormProps {
  pool: Pool;
}

export default function PoolPurchaseForm({ pool }: PoolPurchaseFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [squaresCount, setSquaresCount] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const costPerSquare = pool.costPerSquare ?? 0;
  const count = parseInt(squaresCount, 10) || 0;
  const total = count > 0 ? count * costPerSquare : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const squares = parseInt(squaresCount, 10);
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }

    if (!Number.isInteger(squares) || squares < 1 || squares > 100) {
      setError("Enter between 1 and 100 squares.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/purchase/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId: pool.id,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          squaresCount: squares,
        }),
      });

      const raw = await response.text();
      let payload: { url?: string; error?: string } = {};
      try {
        payload = raw ? (JSON.parse(raw) as { url?: string; error?: string }) : {};
      } catch {
        payload = {};
      }

      if (!response.ok || !payload.url) {
        setError(
          payload.error ||
            (response.status === 503
              ? "Checkout is not available yet. Please contact the pool organizer."
              : `Could not start checkout (HTTP ${response.status}).`)
        );
        setLoading(false);
        return;
      }

      window.location.href = payload.url;
    } catch {
      setError("Could not start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <section className="bg-slate-900 border border-emerald-500/20 rounded-xl p-5">
      <div className="mb-4">
        <h2 className="text-slate-200 font-semibold text-sm">
          Purchase Squares
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Pay securely with Stripe. Your invite link will be emailed after
          payment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (optional)"
            className="bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
          />
          <input
            type="number"
            min={1}
            max={100}
            value={squaresCount}
            onChange={(e) => setSquaresCount(e.target.value)}
            placeholder="Number of squares"
            required
            className="bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500 min-w-0">
            Total:{" "}
            <span className="text-emerald-300 font-mono font-semibold">
              ${total.toFixed(2)}
            </span>
            <span className="text-slate-600 ml-2">
              (${costPerSquare.toFixed(2)} per square)
            </span>
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-sm font-semibold transition-colors"
          >
            {loading ? "Redirecting..." : "Continue to Checkout"}
          </button>
        </div>
      </form>

      {error && (
        <p className="text-red-400 text-xs mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </section>
  );
}
