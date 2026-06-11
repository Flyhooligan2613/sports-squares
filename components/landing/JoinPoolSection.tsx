"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { SectionHeader } from "@/components/ui/Button";
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
    <section id="join" className="scroll-mt-20 sb-section bg-slate-900/20">
      <div className="max-w-xl mx-auto w-full px-4 sm:px-6">
        <ScrollReveal>
          <SectionHeader
            title="Already have an invite?"
            subtitle="Enter your Pool Code or paste your personal invite link."
          />
        </ScrollReveal>

        {activeInvite && (
          <ScrollReveal delay={80}>
            <div className="mb-6 sb-card border-indigo-500/25 bg-indigo-500/5 px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-indigo-200 text-sm">
                Welcome back — your invite session is ready.
              </p>
              <Link
                href={activeInvite.path}
                className="sb-btn-primary inline-flex justify-center min-h-[48px] items-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
              >
                Continue to My Squares
              </Link>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal delay={120}>
          <form
            onSubmit={handleJoin}
            className="sb-card p-5 sm:p-7 shadow-2xl shadow-black/30"
          >
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider font-semibold mb-4">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              Pool access
            </div>
            <label htmlFor="pool-code" className="sr-only">
              Pool code or invite link
            </label>
            <input
              id="pool-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              placeholder="Pool code or invite link"
              autoComplete="off"
              className="sb-input mb-4"
            />
            <button
              type="submit"
              disabled={loading}
              className="sb-btn-primary w-full min-h-[52px] rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-base transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
            >
              {loading ? "Finding pool..." : "Join Pool"}
            </button>
            {error && (
              <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
            )}
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
