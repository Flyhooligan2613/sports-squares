"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Sparkles } from "lucide-react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { listInviteSessions } from "@/lib/invites/session";
import { normalizePoolCode, parseJoinInput } from "@/lib/landing/join";
import { formatUserError } from "@/lib/errors/formatUserError";
import { poolStore } from "@/lib/poolStore";

export default function JoinPoolSection() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeInvite, setActiveInvite] = useState<{
    poolId: string;
    path: string;
  } | null>(null);

  useEffect(() => {
    const sessions = listInviteSessions();
    const latest = sessions.sort((a, b) => b.savedAt - a.savedAt)[0];
    if (latest) {
      setActiveInvite({
        poolId: latest.poolId,
        path: `/join/${latest.inviteToken}`,
      });
    }
  }, []);

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
        setError("Enter a pool code or paste your invite link.");
        return;
      }

      const pools = await poolStore.listPools();
      const match = pools.find(
        (p) =>
          p.inviteCode.toUpperCase() === poolCode ||
          p.id.toLowerCase() === poolCode.toLowerCase()
      );

      if (!match) {
        setError(
          "Pool not found. Check your code or use your personal invite link."
        );
        return;
      }

      router.push(`/pool/${match.id}`);
    } catch (err) {
      setError(formatUserError(err, "join"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <LandingSection id="join" variant="glow" scrollMargin>
      <ScrollReveal>
        <LandingSectionHeader
          eyebrow="Pool Access"
          title="Already have an invite?"
          subtitle="Enter your pool code or paste your personal invite link to jump straight to your board."
        />
      </ScrollReveal>

      {activeInvite && (
        <ScrollReveal delay={80}>
          <LandingGlassCard
            glow
            className="mb-6 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-sb-purple/25"
          >
            <div className="flex items-center gap-3">
              <span className="landing-icon-badge !w-10 !h-10 !mb-0">
                <Sparkles className="w-4 h-4" />
              </span>
              <p className="text-sb-secondary text-sm">
                Welcome back — your invite session is ready.
              </p>
            </div>
            <Button href={activeInvite.path} variant="primary" size="sm">
              Continue to My Squares
            </Button>
          </LandingGlassCard>
        </ScrollReveal>
      )}

      <ScrollReveal delay={120}>
        <div className="landing-join-form-card">
          <div className="flex items-center gap-2 text-sb-muted text-xs uppercase tracking-wider font-semibold mb-5">
            <KeyRound className="w-4 h-4 text-sb-glow" />
            Enter pool code
          </div>
          <form onSubmit={handleJoin} className="space-y-4">
            <Input
              id="pool-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              placeholder="Pool code or invite link"
              autoComplete="off"
              aria-label="Pool code or invite link"
            />
            <Button
              type="submit"
              variant="primary"
              className="w-full hero-btn-primary"
              disabled={loading}
            >
              {loading ? "Finding pool..." : "Join Pool"}
            </Button>
            {error && <Alert variant="error">{error}</Alert>}
          </form>
        </div>
      </ScrollReveal>
    </LandingSection>
  );
}
