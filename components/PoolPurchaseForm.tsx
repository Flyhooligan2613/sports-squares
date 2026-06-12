"use client";

import { useState } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";
import Alert from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
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
              ? "Checkout is not available yet. Please contact SquareBoards support."
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
    <Card variant="elevated" glow className="p-5 sm:p-6 border-sb-success/20">
      <CardHeader
        title="Purchase Squares"
        subtitle="Pay securely with Stripe. Your invite link will be emailed after payment."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            aria-label="Your name"
          />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            aria-label="Email"
          />
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (optional)"
            aria-label="Phone"
          />
          <Input
            type="number"
            min={1}
            max={100}
            value={squaresCount}
            onChange={(e) => setSquaresCount(e.target.value)}
            placeholder="Number of squares"
            required
            aria-label="Number of squares"
          />
        </div>

        <div className="sb-card-glass rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sb-muted text-xs uppercase tracking-wider font-medium mb-1">
              Total
            </p>
            <p className="text-2xl font-bold text-sb-success tabular-nums">
              ${total.toFixed(2)}
            </p>
            <p className="text-sb-muted text-xs mt-0.5">
              ${costPerSquare.toFixed(2)} per square
            </p>
          </div>
          <div className="flex items-center gap-2 text-sb-muted text-xs">
            <ShieldCheck className="w-4 h-4 text-sb-success" />
            Secured by Stripe
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full sm:w-auto sm:min-w-[220px]"
          disabled={loading}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {loading ? "Redirecting..." : "Continue to Checkout"}
        </Button>
      </form>

      {error && (
        <Alert variant="error" className="mt-4">
          {error}
        </Alert>
      )}
    </Card>
  );
}
