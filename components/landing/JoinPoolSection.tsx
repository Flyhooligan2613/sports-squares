"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Button, SectionHeader } from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { listInviteSessions } from "@/lib/invites/session";
import { normalizePoolCode, parseJoinInput } from "@/lib/landing/join";
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
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="join" className="scroll-mt-20 sb-section bg-sb-surface/20">
      <div className="max-w-xl mx-auto w-full px-4 sm:px-6">
        <ScrollReveal>
          <SectionHeader
            title="Already have an invite?"
            subtitle="Enter your Pool Code or paste your personal invite link."
          />
        </ScrollReveal>

        {activeInvite && (
          <ScrollReveal delay={80}>
            <Card
              variant="glass"
              className="mb-6 border-sb-purple/25 px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <p className="text-sb-secondary text-sm">
                Welcome back — your invite session is ready.
              </p>
              <Button href={activeInvite.path} variant="primary" size="sm">
                Continue to My Squares
              </Button>
            </Card>
          </ScrollReveal>
        )}

        <ScrollReveal delay={120}>
          <Card variant="elevated" glow className="p-5 sm:p-7">
            <div className="flex items-center gap-2 text-sb-muted text-xs uppercase tracking-wider font-semibold mb-4">
              <KeyRound className="w-4 h-4 text-sb-glow" />
              Pool access
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
                className="w-full"
                disabled={loading}
              >
                {loading ? "Finding pool..." : "Join Pool"}
              </Button>
              {error && <Alert variant="error">{error}</Alert>}
            </form>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
}
