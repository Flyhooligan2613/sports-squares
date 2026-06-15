"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import HighlightSquareLegend from "@/components/highlight/HighlightSquareLegend";
import HighlightSquareIntroPopup from "@/components/highlight/HighlightSquareIntroPopup";
import Board from "@/components/Board";
import NumberDrawModal from "@/components/NumberDrawModal";
import PoolStatusBadge from "@/components/PoolStatusBadge";
import ScoringSection from "@/components/ScoringSection";
import WinnerHistorySection from "@/components/WinnerHistorySection";
import StatsPanel from "@/components/StatsPanel";
import PoolPurchaseForm from "@/components/PoolPurchaseForm";
import PoolSummaryPanel from "@/components/PoolSummaryPanel";
import LiveScoreBanner from "@/components/LiveScoreBanner";
import Spinner from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import { useEspnScoreSync } from "@/hooks/useEspnScoreSync";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { getInviteSession } from "@/lib/invites/session";
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
import type { PoolHighlightSquare } from "@/lib/highlight/types";
import { learnHowToPlayHref } from "@/lib/highlight/learnLinks";
import { loadWinnerHistory, saveWinnerHistory } from "@/lib/winnerStorage";
import { attachPayoutToWinner, poolHasFinancials } from "@/lib/poolFinance";
import {
  enrichWinnerHistory,
  withRecordedAt,
} from "@/lib/winnerHistoryUtils";

export default function PoolPage() {
  const params = useParams();
  const poolId = params.poolid as string;
  const router = useRouter();

  const [pool, setPool] = useState<Pool | null>(null);
  const [squares, setSquares] = useState<BoardSquare[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [claimError, setClaimError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [activeQuarter, setActiveQuarter] = useState<ScoringPeriod>("Q1");
  const [winnerHistory, setWinnerHistory] = useState<WinnerHistory>({});
  const [highlights, setHighlights] = useState<PoolHighlightSquare[]>([]);
  const skipWinnerSave = useRef(true);
  const { isAdmin } = useIsAdmin();

  const isOpen = pool?.status === "open";
  const isLocked = pool?.status === "locked";
  const numbersDrawn =
    pool?.status === "numbers-drawn" || pool?.status === "completed";

  const refreshWinnerHistory = useCallback(async () => {
    const history = await loadWinnerHistory(poolId);
    setWinnerHistory(history);
  }, [poolId]);

  const refreshHighlights = useCallback(async () => {
    if (!numbersDrawn) return;
    try {
      const res = await fetch(`/api/pool/${poolId}/highlights`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (Array.isArray(data.highlights)) {
        setHighlights(data.highlights);
      }
    } catch {
      // Best-effort
    }
  }, [poolId, numbersDrawn]);

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
      await refreshHighlights();
    },
    [refreshWinnerHistory, refreshHighlights]
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

  useEffect(() => {
    let cancelled = false;

    async function loadPool() {
      let found = await poolStore.getPool(poolId);
      if (!found) {
        router.replace("/");
        return;
      }

      if (
        found.status === "locked" &&
        found.topNumbers?.length === 10 &&
        found.sideNumbers?.length === 10
      ) {
        const finalized = await poolStore.finalizeNumberDraw(poolId);
        if (finalized) found = finalized;
      }

      if (cancelled) return;

      setPool(found);
      setActiveQuarter(getDefaultScoringPeriod(found.espnSport));
      setSquares(found.squares.map((s) => ({ ...s, selected: false })));

      const inviteSession = getInviteSession(poolId);
      if (
        inviteSession &&
        inviteSession.inviteToken &&
        found.participants.some((p) => p.id === inviteSession.playerId)
      ) {
        setSelectedPlayerId(inviteSession.playerId);
        setInviteToken(inviteSession.inviteToken);
      }

      if (found.status === "locked" && !found.topNumbers?.length) {
        setShowDrawModal(true);
      } else {
        setShowDrawModal(false);
      }

      skipWinnerSave.current = true;
      const history = await loadWinnerHistory(poolId);
      if (!cancelled) setWinnerHistory(history);
    }

    loadPool();
    return () => {
      cancelled = true;
    };
  }, [poolId, router]);

  useEffect(() => {
    if (skipWinnerSave.current) {
      skipWinnerSave.current = false;
      return;
    }
    saveWinnerHistory(poolId, winnerHistory);
  }, [winnerHistory, poolId]);

  const highlightSquareIds = useMemo(
    () => highlights.map((h) => h.squareNumber),
    [highlights]
  );

  const activatedHighlightSquareIds = useMemo(
    () =>
      highlights.filter((h) => h.activatedAt).map((h) => h.squareNumber),
    [highlights]
  );

  useEffect(() => {
    void refreshHighlights();
  }, [refreshHighlights]);

  const featuredWinningSquareId =
    winnerHistory[activeQuarter]?.squareId;

  const pastWinningSquareIds = useMemo(() => {
    return scoringPeriods.filter((q) => q !== activeQuarter && winnerHistory[q]).map(
      (q) => winnerHistory[q]!.squareId
    );
  }, [winnerHistory, activeQuarter, scoringPeriods]);

  const enrichedWinnerHistory = useMemo(
    () => enrichWinnerHistory(winnerHistory, pool?.participants ?? []),
    [winnerHistory, pool?.participants]
  );

  const stats = useMemo(() => {
    const claimed = squares.filter((s) => s.claimed).length;
    const selected = squares.filter((s) => s.selected).length;
    return { claimed, available: 100 - claimed, selected };
  }, [squares]);

  const showLockButton = isAdmin && isOpen && stats.available === 0;

  const activePlayer = useMemo(
    () => pool?.participants.find((p) => p.id === selectedPlayerId),
    [pool, selectedPlayerId]
  );

  const creditsRemaining = activePlayer?.creditsRemaining ?? 0;

  function handleSquareClick(id: number) {
    if (!isOpen || !activePlayer) return;

    setSquares((prev) => {
      const square = prev.find((s) => s.id === id);
      if (!square || square.claimed) return prev;

      if (square.selected) {
        return prev.map((s) =>
          s.id === id ? { ...s, selected: false } : s
        );
      }

      const selectedCount = prev.filter((s) => s.selected).length;
      if (selectedCount >= creditsRemaining) return prev;

      return prev.map((s) =>
        s.id === id ? { ...s, selected: true } : s
      );
    });
    setClaimError("");
  }

  async function handleClaim() {
    if (!isOpen) return;

    if (!selectedPlayerId) {
      setClaimError("Select a player.");
      return;
    }
    if (stats.selected === 0) {
      setClaimError("Select at least one square.");
      return;
    }
    if (stats.selected > creditsRemaining) {
      setClaimError("Not enough credits remaining.");
      return;
    }

    const selectedIds = squares.filter((s) => s.selected).map((s) => s.id);
    const result = await poolStore.claimSquares(
      poolId,
      selectedIds,
      selectedPlayerId,
      inviteToken
    );

    if (!result.ok) {
      setClaimError(result.error);
      return;
    }

    setPool(result.pool);
    setSquares(result.pool.squares.map((s) => ({ ...s, selected: false })));
    setClaimError("");
  }

  async function handleLockBoard() {
    const updated = await poolStore.lockPool(poolId);
    if (!updated) return;
    setPool(updated);
    setShowDrawModal(true);
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
      await refreshHighlights();
    }
    setShowDrawModal(false);
  }, [poolId, refreshHighlights]);

  function handleWinnerCalculated(result: WinnerResult) {
    const stamped = withRecordedAt(result);
    const withPayout = pool
      ? attachPayoutToWinner(stamped, pool, scoringPeriods)
      : stamped;
    setWinnerHistory((prev) => ({
      ...prev,
      [result.quarter]: withPayout,
    }));
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!pool) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex justify-center">
        <Spinner label="Loading pool..." />
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 overflow-x-hidden">
      <HighlightSquareIntroPopup
        learnHref={learnHowToPlayHref(pool.espnSport ?? "nfl")}
      />
      <NumberDrawModal
        isOpen={showDrawModal}
        homeTeam={pool.homeTeam}
        awayTeam={pool.awayTeam}
        presetTop={pool.topNumbers}
        presetSide={pool.sideNumbers}
        onNumbersReady={handleNumbersReady}
        onComplete={handleDrawComplete}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Link
            href="/"
            className="text-sb-muted hover:text-white text-xs mb-2 inline-block transition-colors"
          >
            &larr; Back to pools
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-white break-words">
              {pool.name}
            </h1>
            <PoolStatusBadge status={pool.status} />
          </div>
          <p className="text-sb-muted text-sm mt-0.5">
            {pool.awayTeam}{" "}
            <span className="text-sb-muted/60">vs</span>{" "}
            {pool.homeTeam}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
          <span className="text-xs text-sb-muted">
            Invite:{" "}
            <span className="text-sb-secondary font-mono">{pool.inviteCode}</span>
          </span>
          <button
            type="button"
            onClick={copyLink}
            className="ml-2 flex items-center gap-1.5 text-xs sb-btn-secondary sb-btn-sm min-h-0 py-1.5 px-3 rounded-lg transition-all duration-300"
          >
            {copied ? (
              <>
                <span className="text-green-400">&#10003;</span> Copied!
              </>
            ) : (
              <>
                <CopyIcon /> Copy Link
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mb-5 space-y-4">
        <StatsPanel
          claimed={stats.claimed}
          available={stats.available}
          selected={stats.selected}
        />

        {isOpen && (pool.costPerSquare ?? 0) > 0 && (
          <PoolPurchaseForm pool={pool} />
        )}

        {isOpen && activePlayer && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sb-purple/10 border border-sb-purple/25">
              <span className="text-sb-muted text-xs">Credits Remaining</span>
              <span className="text-sb-glow font-bold font-mono text-lg tabular-nums">
                {creditsRemaining}
              </span>
              <span className="text-sb-muted text-xs">
                ({activePlayer.name})
              </span>
            </div>
          </div>
        )}

        {showLockButton && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleLockBoard}
              className="lock-board-btn px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm uppercase tracking-wider transition-all transform hover:scale-105"
            >
              Lock Board
            </button>
          </div>
        )}

        {isLocked && !showDrawModal && (
          <p className="text-center text-amber-400 text-sm font-medium">
            Board is locked. Drawing numbers...
          </p>
        )}

        {numbersDrawn && (
          <p className="text-center text-sb-glow text-sm">
            Numbers are locked in. Good luck!
          </p>
        )}
      </div>

      {numbersDrawn && liveGame && (
        <div className="mb-5">
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
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          {numbersDrawn && highlights.length > 0 ? (
            <HighlightSquareLegend
              highlights={highlights}
              className="mb-4"
            />
          ) : null}

          <Board
            squares={squares}
            onSquareClick={handleSquareClick}
            topNumbers={numbersDrawn ? pool.topNumbers : undefined}
            sideNumbers={numbersDrawn ? pool.sideNumbers : undefined}
            innerNumbers={numbersDrawn ? pool.innerNumbers : undefined}
            homeTeam={pool.homeTeam}
            awayTeam={pool.awayTeam}
            locked={!isOpen}
            featuredWinningSquareId={featuredWinningSquareId}
            pastWinningSquareIds={pastWinningSquareIds}
            highlightSquareIds={
              numbersDrawn ? highlightSquareIds : undefined
            }
            activatedHighlightSquareIds={
              numbersDrawn ? activatedHighlightSquareIds : undefined
            }
          />

          {numbersDrawn &&
            pool.topNumbers &&
            pool.sideNumbers && (
              <>
                <ScoringSection
                  homeTeam={pool.homeTeam}
                  awayTeam={pool.awayTeam}
                  topNumbers={pool.topNumbers}
                  sideNumbers={pool.sideNumbers}
                  innerNumbers={pool.innerNumbers}
                  squares={squares}
                  winnerHistory={winnerHistory}
                  onWinnerCalculated={
                    isAdmin ? handleWinnerCalculated : undefined
                  }
                  activeQuarter={activeQuarter}
                  onQuarterChange={setActiveQuarter}
                  scoringPeriods={scoringPeriods}
                  readOnly={!isAdmin}
                  espnSyncActive={isActive}
                />
                <WinnerHistorySection
                  winnerHistory={enrichedWinnerHistory}
                  scoringPeriods={scoringPeriods}
                  awayTeam={pool.awayTeam}
                  homeTeam={pool.homeTeam}
                  activeQuarter={activeQuarter}
                  onSelectQuarter={setActiveQuarter}
                  financialsEnabled={poolHasFinancials(pool)}
                  innerNumbers={pool.innerNumbers}
                />
              </>
            )}
        </div>

        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
          {numbersDrawn && <PoolSummaryPanel pool={pool} />}
          <div
            className={`sb-card p-5 ${!isOpen ? "opacity-60" : ""}`}
          >
            <h2 className="text-white font-semibold text-sm mb-3">
              Claim Squares
              {!isOpen && (
                <span className="ml-2 text-amber-500/80 text-xs font-normal">
                  (closed)
                </span>
              )}
            </h2>
            <div className="flex flex-col gap-3">
              {!inviteToken || !activePlayer ? (
                <p className="text-sb-muted text-xs">
                  Open your personal invite link to claim squares for your
                  player account.
                </p>
              ) : (
                <>
                  <p className="text-sb-muted text-xs font-medium">
                    Claiming as
                  </p>
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-sb-surface/80 px-3 py-2">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{
                        backgroundColor: activePlayer.color ?? "#5B4CF7",
                      }}
                    >
                      {activePlayer.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {activePlayer.name}
                      </p>
                      <p className="text-sb-muted text-xs">
                        Credits remaining:{" "}
                        <span className="text-sb-glow font-semibold font-mono">
                          {creditsRemaining}
                        </span>
                      </p>
                    </div>
                  </div>
                </>
              )}
              {claimError && (
                <p className="text-red-400 text-xs">{claimError}</p>
              )}
              <Button
                type="button"
                onClick={handleClaim}
                disabled={
                  !isOpen ||
                  stats.selected === 0 ||
                  !selectedPlayerId ||
                  !inviteToken ||
                  pool.participants.length === 0
                }
                variant="primary"
                size="sm"
                className="w-full min-h-[44px]"
              >
                {stats.selected > 0
                  ? `Claim ${stats.selected} Square${
                      stats.selected !== 1 ? "s" : ""
                    }`
                  : "No Squares Selected"}
              </Button>
            </div>
          </div>

          <div className="sb-card p-5">
            <h2 className="text-white font-semibold text-sm mb-3">
              Players
              <span className="ml-2 text-sb-muted font-normal">
                {pool.participants.length}
              </span>
            </h2>
            {pool.participants.length === 0 ? (
              <SectionEmptyState
                emoji="👥"
                title="No players yet"
                description="Share your invite link to get the board filling up."
                compact
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {pool.participants.map((p) => {
                  const count = squares.filter(
                    (s) => s.owner?.id === p.id
                  ).length;
                  return (
                    <li
                      key={p.id}
                      className="flex flex-col gap-1 py-1 border-b border-white/[0.06] last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: p.color ?? "#5B4CF7" }}
                          >
                            {p.initials}
                          </span>
                          <span className="text-sb-secondary text-xs truncate max-w-[100px]">
                            {p.name}
                          </span>
                        </div>
                        <span className="text-sb-muted text-xs shrink-0">
                          {count} sq
                        </span>
                      </div>
                      <p className="text-[10px] text-sb-muted pl-8">
                        Credits remaining:{" "}
                        <span
                          className={
                            p.creditsRemaining > 0
                              ? "text-sb-success/90"
                              : "text-sb-muted"
                          }
                        >
                          {p.creditsRemaining}
                        </span>
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function CopyIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.262c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
      />
    </svg>
  );
}
