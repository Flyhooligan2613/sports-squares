"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import PoolStatusBadge from "@/components/PoolStatusBadge";
import { storeInviteSession } from "@/lib/invites/session";
import { poolStore } from "@/lib/poolStore";
import type { PlayerInviteInfo } from "@/lib/types";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const inviteToken = params.inviteToken as string;

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<PlayerInviteInfo | null>(null);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const info = await poolStore.getPlayerByInviteToken(inviteToken);
      if (cancelled) return;

      if (!info) {
        setInvalid(true);
        setLoading(false);
        return;
      }

      storeInviteSession(info.poolId, info.player.id, inviteToken);
      setInvite(info);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [inviteToken]);

  function handleSelectSquares() {
    if (!invite) return;
    router.push(`/pool/${invite.poolId}?player=${invite.player.id}`);
  }

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading your invite...</p>
        </div>
      </main>
    );
  }

  if (invalid || !invite) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-slate-900 border border-red-500/30 rounded-xl p-8">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-xl">!</span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 mb-2">
              Invalid Invite Link
            </h1>
            <p className="text-slate-500 text-sm mb-6">
              This invite link is invalid or has expired. Please contact your
              pool admin for a new link.
            </p>
            <Link
              href="/"
              className="inline-block text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-5 py-2.5 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { player, poolName, homeTeam, awayTeam, poolStatus } = invite;
  const isOpen = poolStatus === "open";

  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-2">
            Your Squares Invite
          </p>
          <h1 className="text-2xl font-bold text-slate-100">{poolName}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {awayTeam} <span className="text-slate-600">vs</span> {homeTeam}
          </p>
          <div className="flex justify-center mt-3">
            <PoolStatusBadge status={poolStatus} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ backgroundColor: player.color ?? "#6366f1" }}
            >
              {player.initials}
            </span>
            <div>
              <p className="text-slate-400 text-xs">Player</p>
              <p className="text-slate-100 font-semibold text-lg">
                {player.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <CreditStat label="Allocated" value={player.creditsPurchased} />
            <CreditStat label="Used" value={player.creditsUsed} />
            <CreditStat
              label="Remaining"
              value={player.creditsRemaining}
              highlight={player.creditsRemaining > 0}
            />
          </div>

          {!isOpen && (
            <p className="text-amber-400/90 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-center">
              This pool is no longer open for claiming squares.
            </p>
          )}

          {player.creditsRemaining <= 0 && isOpen && (
            <p className="text-slate-500 text-xs text-center">
              You have used all your allocated credits.
            </p>
          )}

          <button
            type="button"
            onClick={handleSelectSquares}
            disabled={!isOpen || player.creditsRemaining <= 0}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-sm transition-colors"
          >
            Select My Squares
          </button>
        </div>

        <p className="text-center mt-6">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
          >
            &larr; Back to public site
          </Link>
        </p>
      </div>
    </main>
  );
}

function CreditStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-3 text-center">
      <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">
        {label}
      </p>
      <p
        className={`text-xl font-bold font-mono mt-1 ${
          highlight ? "text-green-400" : "text-slate-200"
        }`}
      >
        {value < 0 ? "—" : value}
      </p>
    </div>
  );
}
