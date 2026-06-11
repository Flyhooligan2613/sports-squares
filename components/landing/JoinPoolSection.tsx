"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
        setError("Pool not found. Check your code or use your personal invite link.");
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
    <section
      id="join"
      className="scroll-mt-20 bg-slate-900/40 border-y border-slate-800/80 py-10 sm:py-14 landing-fade-up"
    >
      <div className="max-w-xl mx-auto w-full px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-2">
            Already have an invite?
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            Enter your Pool Code or use your personal invite link.
          </p>
        </div>

        {activeInvite && (
          <div className="mb-5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-indigo-200 text-sm">
              You have an active invite session.
            </p>
            <Link
              href={activeInvite.path}
              className="inline-flex justify-center min-h-[44px] items-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              Continue to My Squares
            </Link>
          </div>
        )}

        <form
          onSubmit={handleJoin}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl shadow-black/20"
        >
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
            className="w-full min-h-[52px] bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 text-base text-slate-100 placeholder-slate-500 outline-none transition-all mb-3"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[52px] rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-base transition-all active:scale-[0.98]"
          >
            {loading ? "Finding pool..." : "Join Pool"}
          </button>
          {error && (
            <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
          )}
        </form>
      </div>
    </section>
  );
}
