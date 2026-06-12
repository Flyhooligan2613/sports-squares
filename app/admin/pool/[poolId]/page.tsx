"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Board from "@/components/Board";
import NumberDrawModal from "@/components/NumberDrawModal";
import PoolStatusBadge from "@/components/PoolStatusBadge";
import ScoringSection from "@/components/ScoringSection";
import WinnerHistorySection from "@/components/WinnerHistorySection";
import EspnGameSettings from "@/components/admin/EspnGameSettings";
import PoolFinancialSettings from "@/components/admin/PoolFinancialSettings";
import PoolPayoutSettings from "@/components/admin/PoolPayoutSettings";
import PlayersManagement from "@/components/admin/PlayersManagement";
import PoolSummaryPanel from "@/components/PoolSummaryPanel";
import LiveScoreBanner from "@/components/LiveScoreBanner";
import StatsPanel from "@/components/StatsPanel";
import { useEspnScoreSync } from "@/hooks/useEspnScoreSync";
import { poolStore } from "@/lib/poolStore";
import {
  getDefaultScoringPeriod,
  getScoringPeriods,
} from "@/lib/espn/sports";
import type {
  BoardSquare,
  Pool,
  ScoringPeriod,
  WinnerHistory,
  WinnerResult,
} from "@/lib/types";
import { loadWinnerHistory, saveWinnerHistory } from "@/lib/winnerStorage";
import { attachPayoutToWinner, poolHasFinancials } from "@/lib/poolFinance";
import {
  enrichWinnerHistory,
  withRecordedAt,
} from "@/lib/winnerHistoryUtils";

export default function AdminPoolControlPage() {
  const params = useParams();
  const poolId = params.poolId as string;
  const router = useRouter();

  const [pool, setPool] = useState<Pool | null>(null);
  const [squares, setSquares] = useState<BoardSquare[]>([]);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [activeQuarter, setActiveQuarter] = useState<ScoringPeriod>("Q1");
  const [winnerHistory, setWinnerHistory] = useState<WinnerHistory>({});
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    homeTeam: "",
    awayTeam: "",
  });
  const [actionMessage, setActionMessage] = useState("");
  const skipWinnerSave = useRef(true);

  const numbersDrawn =
    pool?.status === "numbers-drawn" || pool?.status === "completed";

  const refreshWinnerHistory = useCallback(async () => {
    const history = await loadWinnerHistory(poolId);
    setWinnerHistory(history);
  }, [poolId]);

  const handleWinnersSynced = useCallback(
    async (results: WinnerResult[]) => {
      setWinnerHistory((prev) => {
        const next = { ...prev };
        for (const result of results) {
          next[result.quarter] = withRecordedAt(result);
        }
        return next;
      });
      await refreshWinnerHistory();
      if (results.length > 0) {
        const msg = `ESPN synced: ${results.map((r) => `${r.quarter} → ${r.ownerName}`).join(", ")}`;
        setActionMessage(msg);
        setTimeout(() => setActionMessage(""), 3000);
      }
    },
    [refreshWinnerHistory]
  );

  const scoringPeriods = getScoringPeriods(pool?.espnSport);

  const { liveGame, syncing, lastSyncAt, syncError, isActive } =
    useEspnScoreSync({
      poolId,
      espnGameId: pool?.espnGameId,
      espnSport: pool?.espnSport,
      enabled: numbersDrawn && Boolean(pool?.espnGameId),
      topNumbers: pool?.topNumbers,
      sideNumbers: pool?.sideNumbers,
      squares,
      winnerHistory,
      pool,
      scoringPeriods,
      onWinnersSynced: handleWinnersSynced,
    });

  const reloadPool = useCallback(async () => {
    let found = await poolStore.getPool(poolId, { includeSensitive: true });
    if (!found) return null;

    if (
      found.status === "locked" &&
      found.topNumbers?.length === 10 &&
      found.sideNumbers?.length === 10
    ) {
      const finalized = await poolStore.finalizeNumberDraw(poolId);
      if (finalized) found = finalized;
    }

    setPool(found);
    setActiveQuarter(getDefaultScoringPeriod(found.espnSport));
    setSquares(found.squares.map((s) => ({ ...s, selected: false })));
    setEditForm({
      name: found.name,
      homeTeam: found.homeTeam,
      awayTeam: found.awayTeam,
    });
    return found;
  }, [poolId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const found = await reloadPool();
      if (!found) {
        router.replace("/admin/pools");
        return;
      }

      if (cancelled) return;

      if (found.status === "locked" && !found.topNumbers?.length) {
        setShowDrawModal(true);
      }

      skipWinnerSave.current = true;
      const history = await loadWinnerHistory(poolId);
      if (!cancelled) setWinnerHistory(history);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [poolId, router, reloadPool]);

  useEffect(() => {
    if (skipWinnerSave.current) {
      skipWinnerSave.current = false;
      return;
    }
    saveWinnerHistory(poolId, winnerHistory);
  }, [winnerHistory, poolId]);

  const stats = useMemo(() => {
    const claimed = squares.filter((s) => s.claimed).length;
    return { claimed, available: 100 - claimed, selected: 0 };
  }, [squares]);

  const featuredWinningSquareId = winnerHistory[activeQuarter]?.squareId;
  const pastWinningSquareIds = useMemo(
    () =>
      scoringPeriods.filter((q) => q !== activeQuarter && winnerHistory[q]).map(
        (q) => winnerHistory[q]!.squareId
      ),
    [winnerHistory, activeQuarter, scoringPeriods]
  );

  const enrichedWinnerHistory = useMemo(
    () => enrichWinnerHistory(winnerHistory, pool?.participants ?? []),
    [winnerHistory, pool?.participants]
  );

  function flash(msg: string) {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(""), 3000);
  }

  async function handleSaveEdit() {
    const updated = await poolStore.updatePool(poolId, editForm);
    if (updated) {
      setPool(updated);
      setEditing(false);
      flash("Pool updated.");
    }
  }

  async function handleClosePool() {
    const updated = await poolStore.closePool(poolId);
    if (updated) {
      setPool(updated);
      flash(
        updated.status === "completed"
          ? "Pool marked as completed."
          : "Pool closed — claiming disabled."
      );
    } else {
      flash("Cannot close pool in its current state.");
    }
  }

  async function handleLockBoard() {
    const updated = await poolStore.lockPool(poolId);
    if (updated) {
      setPool(updated);
      setShowDrawModal(true);
      flash("Board locked. Draw numbers to continue.");
    } else {
      flash("Board can only be locked when pool is open.");
    }
  }

  async function handleDrawNumbers() {
    if (pool?.status === "numbers-drawn" || pool?.status === "completed") {
      flash("Numbers already drawn.");
      return;
    }
    const updated = await poolStore.adminDrawNumbers(poolId);
    if (updated) {
      setPool(updated);
      setShowDrawModal(true);
      flash("Ready to draw numbers.");
    }
  }

  async function handleArchive() {
    const updated = await poolStore.archivePool(poolId);
    if (updated) {
      setPool(updated);
      flash("Pool archived.");
    }
  }

  async function handleDuplicate() {
    const duplicated = await poolStore.duplicatePool(poolId);
    if (duplicated) {
      router.push(`/admin/pool/${duplicated.id}`);
    } else {
      flash("Could not duplicate pool.");
    }
  }

  const handleNumbersReady = useCallback(
    async (topNumbers: number[], sideNumbers: number[]) => {
      const updated = await poolStore.storePendingNumbers(
        poolId,
        topNumbers,
        sideNumbers
      );
      if (updated) setPool(updated);
    },
    [poolId]
  );

  const handleDrawComplete = useCallback(async () => {
    const updated = await poolStore.finalizeNumberDraw(poolId);
    if (updated) {
      setPool(updated);
      setSquares(updated.squares.map((s) => ({ ...s, selected: false })));
    }
    setShowDrawModal(false);
    flash("Numbers drawn successfully.");
  }, [poolId]);

  function handleWinnerCalculated(result: WinnerResult) {
    const stamped = withRecordedAt(result);
    const withPayout = pool
      ? attachPayoutToWinner(stamped, pool, scoringPeriods)
      : stamped;
    setWinnerHistory((prev) => ({
      ...prev,
      [result.quarter]: withPayout,
    }));
    flash(`${result.quarter} winner: ${result.ownerName}`);
  }

  if (!pool) {
    return <p className="text-slate-500">Loading pool...</p>;
  }

  const isArchived = pool.status === "archived";

  return (
    <div className="max-w-5xl space-y-6">
      <NumberDrawModal
        isOpen={showDrawModal}
        homeTeam={pool.homeTeam}
        awayTeam={pool.awayTeam}
        presetTop={pool.topNumbers}
        presetSide={pool.sideNumbers}
        onNumbersReady={handleNumbersReady}
        onComplete={handleDrawComplete}
      />

      <div>
        <Link
          href="/admin/pools"
          className="text-slate-500 hover:text-slate-300 text-xs mb-2 inline-block"
        >
          &larr; Back to pools
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-100">{pool.name}</h1>
          <PoolStatusBadge status={pool.status} />
        </div>
        <p className="text-slate-500 text-sm mt-0.5">Pool control panel</p>
      </div>

      {actionMessage && (
        <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 admin-toast-enter">
          {actionMessage}
        </p>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-slate-200 font-semibold text-sm">
            Pool Information
          </h2>

          {editing ? (
            <div className="space-y-3">
              <EditField
                label="Pool Name"
                value={editForm.name}
                onChange={(v) => setEditForm((f) => ({ ...f, name: v }))}
              />
              <EditField
                label="Home Team"
                value={editForm.homeTeam}
                onChange={(v) => setEditForm((f) => ({ ...f, homeTeam: v }))}
              />
              <EditField
                label="Away Team"
                value={editForm.awayTeam}
                onChange={(v) => setEditForm((f) => ({ ...f, awayTeam: v }))}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <dl className="space-y-3 text-sm">
              <InfoRow label="Name" value={pool.name} />
              <InfoRow
                label="Matchup"
                value={`${pool.awayTeam} vs ${pool.homeTeam}`}
              />
              <InfoRow
                label="Invite Code"
                value={pool.inviteCode}
                mono
              />
              <InfoRow label="Status" value={pool.status} />
              <InfoRow
                label="Players"
                value={String(pool.participants.length)}
              />
            </dl>
          )}

          {!editing && !isArchived && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Edit details
            </button>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-slate-200 font-semibold text-sm mb-4">
            Admin Actions
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton
              label="Close Pool"
              onClick={handleClosePool}
              disabled={isArchived}
              variant="slate"
            />
            <ActionButton
              label="Lock Board"
              onClick={handleLockBoard}
              disabled={isArchived || pool.status !== "open"}
              variant="amber"
            />
            <ActionButton
              label="Draw Numbers"
              onClick={handleDrawNumbers}
              disabled={
                isArchived ||
                pool.status === "numbers-drawn" ||
                pool.status === "completed"
              }
              variant="indigo"
            />
            <ActionButton
              label="Enter Scores"
              onClick={() => {
                document
                  .getElementById("admin-scoring")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              disabled={!numbersDrawn}
              variant="green"
            />
            <ActionButton
              label="Duplicate Pool"
              onClick={handleDuplicate}
              variant="slate"
              className="col-span-2"
            />
            <ActionButton
              label="Archive Pool"
              onClick={handleArchive}
              disabled={isArchived}
              variant="red"
              className="col-span-2"
            />
          </div>
          <Link
            href={`/pool/${pool.id}`}
            className="mt-4 block text-center text-xs text-slate-500 hover:text-slate-300"
          >
            View public pool page &rarr;
          </Link>
        </div>
      </div>

      <PoolFinancialSettings
        pool={pool}
        onUpdate={async () => {
          await reloadPool();
          const history = await loadWinnerHistory(poolId);
          setWinnerHistory(history);
        }}
        disabled={isArchived}
      />

      <PoolPayoutSettings
        pool={pool}
        onUpdate={async () => {
          await reloadPool();
          const history = await loadWinnerHistory(poolId);
          setWinnerHistory(history);
        }}
        disabled={isArchived}
      />

      <PoolSummaryPanel pool={pool} />

      <PlayersManagement
        pool={pool}
        onUpdate={async (updated) => {
          setPool(updated);
          setSquares(updated.squares.map((s) => ({ ...s, selected: false })));
          const history = await loadWinnerHistory(poolId);
          setWinnerHistory(history);
        }}
        disabled={isArchived}
      />

      <EspnGameSettings
        pool={pool}
        onUpdate={async (updated) => {
          setPool(updated);
          setSquares(updated.squares.map((s) => ({ ...s, selected: false })));
          const history = await loadWinnerHistory(poolId);
          setWinnerHistory(history);
        }}
        disabled={isArchived}
      />

      {numbersDrawn && liveGame && (
        <LiveScoreBanner
          game={liveGame}
          poolHomeTeam={pool.homeTeam}
          poolAwayTeam={pool.awayTeam}
          syncing={syncing}
          lastSyncAt={lastSyncAt}
          syncError={syncError}
          espnSyncActive={isActive}
          espnSport={pool.espnSport}
        />
      )}

      <StatsPanel
        claimed={stats.claimed}
        available={stats.available}
        selected={0}
      />

      <Board
        squares={squares}
        onSquareClick={() => {}}
        topNumbers={numbersDrawn ? pool.topNumbers : undefined}
        sideNumbers={numbersDrawn ? pool.sideNumbers : undefined}
        homeTeam={pool.homeTeam}
        awayTeam={pool.awayTeam}
        locked
        featuredWinningSquareId={featuredWinningSquareId}
        pastWinningSquareIds={pastWinningSquareIds}
      />

      {numbersDrawn && pool.topNumbers && pool.sideNumbers && (
        <>
          <div id="admin-scoring">
            <ScoringSection
              homeTeam={pool.homeTeam}
              awayTeam={pool.awayTeam}
              topNumbers={pool.topNumbers}
              sideNumbers={pool.sideNumbers}
              squares={squares}
              winnerHistory={winnerHistory}
              onWinnerCalculated={handleWinnerCalculated}
              activeQuarter={activeQuarter}
              onQuarterChange={setActiveQuarter}
              scoringPeriods={scoringPeriods}
              espnSyncActive={isActive}
            />
          </div>
          <WinnerHistorySection
            winnerHistory={enrichedWinnerHistory}
            scoringPeriods={scoringPeriods}
            awayTeam={pool.awayTeam}
            homeTeam={pool.homeTeam}
            activeQuarter={activeQuarter}
            onSelectQuarter={setActiveQuarter}
            financialsEnabled={poolHasFinancials(pool)}
            adminMode
          />
        </>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={`text-slate-200 font-medium text-right ${mono ? "font-mono" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-slate-400 text-xs font-medium block mb-1">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
      />
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  variant,
  className = "",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant: "slate" | "amber" | "indigo" | "green" | "red";
  className?: string;
}) {
  const styles = {
    slate: "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200",
    amber:
      "bg-amber-600/20 hover:bg-amber-600/30 border-amber-500/30 text-amber-300",
    indigo:
      "bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/30 text-indigo-300",
    green:
      "bg-green-600/20 hover:bg-green-600/30 border-green-500/30 text-green-300",
    red: "bg-red-600/20 hover:bg-red-600/30 border-red-500/30 text-red-300",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "text-xs font-semibold px-3 py-2.5 rounded-lg border transition-all",
        styles[variant],
        disabled ? "opacity-40 cursor-not-allowed" : "hover:scale-[1.02]",
        className,
      ].join(" ")}
    >
      {label}
    </button>
  );
}
