"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import Alert from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { signInAdmin } from "@/lib/auth/adminAuthClient";

function AdminLoginFormInner() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      setError("Unauthorized account");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signInAdmin(email.trim(), password);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    window.location.assign("/admin");
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12 sb-page-enter">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo href="/" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Staff Portal
          </h1>
          <p className="text-sb-muted text-sm mt-2">
            Authorized SquareBoards personnel only
          </p>
        </div>

        <Card variant="glass" className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
              autoComplete="email"
              placeholder="Email address"
            />

            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />

            {error && <Alert variant="error">{error}</Alert>}

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Staff sign in"}
            </Button>
          </form>
        </Card>

        <p className="text-center mt-6">
          <Link
            href="/"
            className="text-sb-muted hover:text-white text-sm transition-colors"
          >
            ← Back to public site
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function AdminLoginForm() {
  return (
    <Suspense fallback={null}>
      <AdminLoginFormInner />
    </Suspense>
  );
}
