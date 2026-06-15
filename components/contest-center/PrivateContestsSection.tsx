"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { FEATURED_CTA_LABELS } from "@/lib/contestCenter/cta";
import { normalizePoolCode, parseJoinInput } from "@/lib/landing/join";
import { poolStore } from "@/lib/poolStore";

const PRIVATE_LINKS = [
  { label: "Friends Leagues", href: "/survivor/private", emoji: "👥" },
  { label: "Family Leagues", href: "/survivor/private", emoji: "🏠" },
  { label: "Office Leagues", href: "/survivor/private", emoji: "🏢" },
  { label: "Custom Contests", href: "/games/nfl", emoji: "✨" },
];

export default function PrivateContestsSection() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const directPath = parseJoinInput(code);
      if (directPath) {
        router.push(directPath);
        return;
      }

      const poolCode = normalizePoolCode(code);
      if (!poolCode) {
        setError("Enter a contest code, pool ID, or invite link.");
        return;
      }

      const pools = await poolStore.listPools();
      const match = pools.find(
        (p) =>
          p.inviteCode.toUpperCase() === poolCode ||
          p.id.toLowerCase() === poolCode.toLowerCase()
      );

      if (!match) {
        setError("Contest not found. Check your code or invite link.");
        return;
      }

      router.push(`/pool/${match.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="cc-section" aria-labelledby="cc-private-heading">
      <h2 id="cc-private-heading" className="cc-section-title">
        Private Contests
      </h2>
      <LandingGlassCard className="cc-private-panel p-5 sm:p-6">
        <div className="cc-private-grid">
          <div>
            <p className="cc-private-kicker">
              <KeyRound size={16} aria-hidden className="inline mr-1.5 -mt-0.5" />
              Join with Invite Code
            </p>
            <form onSubmit={handleJoin} className="cc-private-form">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste code or invite link"
                aria-label="Private contest invite code"
              />
              <Button type="submit" variant="primary" className="contest-join-btn" disabled={loading}>
                {loading ? "Joining…" : FEATURED_CTA_LABELS.claim_spot}
              </Button>
            </form>
            {error ? <Alert variant="error">{error}</Alert> : null}
          </div>
          <ul className="cc-private-links">
            {PRIVATE_LINKS.map((link) => (
              <li key={link.label}>
                <Button href={link.href} variant="secondary" className="w-full justify-start">
                  <span aria-hidden className="mr-2">
                    {link.emoji}
                  </span>
                  {link.label}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </LandingGlassCard>
    </section>
  );
}
