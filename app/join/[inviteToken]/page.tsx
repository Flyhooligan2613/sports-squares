"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import PoolStatusBadge from "@/components/PoolStatusBadge";
import Alert from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import KpiCard from "@/components/ui/KpiCard";
import Spinner from "@/components/ui/Spinner";
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
        <Spinner label="Loading your invite..." />
      </main>
    );
  }

  if (invalid || !invite) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 sb-page-enter">
        <Card variant="glass" className="w-full max-w-md p-8 text-center">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 mx-auto mb-5">
            <AlertCircle className="w-7 h-7" />
          </span>
          <h1 className="text-xl font-bold text-white mb-2">
            Invalid Invite Link
          </h1>
          <p className="text-sb-muted text-sm mb-6 leading-relaxed">
            This invite link is invalid or has expired. Please contact your
            pool admin for a new link.
          </p>
          <Button href="/" variant="secondary">
            Back to Home
          </Button>
        </Card>
      </main>
    );
  }

  const { player, poolName, homeTeam, awayTeam, poolStatus } = invite;
  const isOpen = poolStatus === "open";

  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12 sb-page-enter">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-sb-muted text-xs uppercase tracking-widest font-semibold mb-2">
            Your Squares Invite
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {poolName}
          </h1>
          <p className="text-sb-muted text-sm mt-2">
            {awayTeam} <span className="text-sb-muted/60">vs</span> {homeTeam}
          </p>
          <div className="flex justify-center mt-4">
            <PoolStatusBadge status={poolStatus} />
          </div>
        </div>

        <Card variant="elevated" glow className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4">
            <span
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sb-glow"
              style={{ backgroundColor: player.color ?? "#5B4CF7" }}
            >
              {player.initials}
            </span>
            <div>
              <p className="text-sb-muted text-xs uppercase tracking-wider font-medium">
                Player
              </p>
              <p className="text-white font-semibold text-xl">{player.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <KpiCard label="Allocated" value={player.creditsPurchased} accent="muted" />
            <KpiCard label="Used" value={player.creditsUsed} accent="muted" />
            <KpiCard
              label="Remaining"
              value={player.creditsRemaining < 0 ? "—" : player.creditsRemaining}
              accent={player.creditsRemaining > 0 ? "success" : "muted"}
            />
          </div>

          {!isOpen && (
            <Alert variant="warning">
              This pool is no longer open for claiming squares.
            </Alert>
          )}

          {player.creditsRemaining <= 0 && isOpen && (
            <p className="text-sb-muted text-sm text-center">
              You have used all your allocated credits.
            </p>
          )}

          <Button
            type="button"
            variant="primary"
            className="w-full"
            onClick={handleSelectSquares}
            disabled={!isOpen || player.creditsRemaining <= 0}
          >
            Select My Squares
          </Button>
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
