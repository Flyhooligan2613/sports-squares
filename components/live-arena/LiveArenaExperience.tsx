"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  BILLS_CHIEFS_DEMO,
  getDemoPhaseLabel,
} from "@/lib/live-arena/demoSimulator";
import {
  MOCK_CONTESTS,
  MOCK_STATS,
  buildUserSquareMeta,
  getUserSquareIds,
} from "@/lib/live-arena/mockData";
import { getWinningSquareId } from "@/lib/live-arena/squareUtils";
import type { DockTab, LiveArenaPhase } from "@/lib/live-arena/types";
import ArenaHeader from "./ArenaHeader";
import ContestCarousel from "./ContestCarousel";
import LiveActivityBar from "./LiveActivityBar";
import LiveArenaBoard from "./LiveArenaBoard";
import LiveDock from "./LiveDock";
import MySquaresPanel from "./MySquaresPanel";
import OpeningSequence from "./OpeningSequence";
import WinningBanner from "./WinningBanner";
import "./live-arena.css";

export default function LiveArenaExperience() {
  const [phase, setPhase] = useState<LiveArenaPhase>("landing");
  const [contestIndex, setContestIndex] = useState(0);
  const [demoIndex, setDemoIndex] = useState(0);
  const [boardRevealed, setBoardRevealed] = useState(false);
  const [selectedSquareId, setSelectedSquareId] = useState<number | null>(null);
  const [scoreFlash, setScoreFlash] = useState(false);
  const [dockTab, setDockTab] = useState<DockTab>("games");
  const [muted, setMuted] = useState(true);
  const [eventLabel, setEventLabel] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const contest = MOCK_CONTESTS[contestIndex];
  const isPrimaryDemo = contest.id === "bills-chiefs" && phase === "live";

  const demoEvent = BILLS_CHIEFS_DEMO[demoIndex] ?? BILLS_CHIEFS_DEMO[0];
  const awayScore = isPrimaryDemo ? demoEvent.awayScore : 17;
  const homeScore = isPrimaryDemo ? demoEvent.homeScore : 21;
  const quarter = isPrimaryDemo ? demoEvent.quarter : 3;
  const clock = isPrimaryDemo ? demoEvent.clock : "8:41";

  const userSquareIds = useMemo(
    () => getUserSquareIds(contest),
    [contest]
  );
  const userSquares = useMemo(
    () => buildUserSquareMeta(contest),
    [contest]
  );

  const winningSquareId = useMemo(
    () =>
      getWinningSquareId(
        contest.topNumbers,
        contest.sideNumbers,
        homeScore,
        awayScore
      ),
    [contest, homeScore, awayScore]
  );

  const userIsWinning =
    winningSquareId != null && userSquareIds.includes(winningSquareId);

  const winningPayout =
    userSquares.find((s) => s.squareId === winningSquareId)?.potentialPayout ??
    625;

  const startDemo = useCallback(() => {
    setPhase("opening");
    setDemoIndex(0);
    setBoardRevealed(false);
    setSelectedSquareId(null);
    setEventLabel(null);
  }, []);

  const onOpeningComplete = useCallback(() => {
    setPhase("live");
    window.setTimeout(() => setBoardRevealed(true), 400);
  }, []);

  // Demo score progression
  useEffect(() => {
    if (phase !== "live" || contest.id !== "bills-chiefs") return;

    const event = BILLS_CHIEFS_DEMO[demoIndex];
    if (!event) {
      setPhase("complete");
      return;
    }

    setEventLabel(event.label ?? null);
    const special = getDemoPhaseLabel(event);

    if (special === "complete") {
      timerRef.current = window.setTimeout(
        () => setPhase("complete"),
        event.pauseMs ?? 3000
      );
      return () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
      };
    }

    if (special === "halftime") {
      setPhase("halftime");
      timerRef.current = window.setTimeout(() => {
        setDemoIndex((i) => i + 1);
        setPhase("live");
      }, event.pauseMs ?? 2800);
      return () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
      };
    }

    const delay = event.pauseMs ?? 2500;
    timerRef.current = window.setTimeout(() => {
      if (demoIndex < BILLS_CHIEFS_DEMO.length - 1) {
        setDemoIndex((i) => i + 1);
        setScoreFlash(true);
        window.setTimeout(() => setScoreFlash(false), 500);
      } else {
        setPhase("complete");
      }
    }, delay);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [phase, demoIndex, contest.id]);

  // Visual haptic on winning square change
  const prevWinningRef = useRef<number | null>(null);
  useEffect(() => {
    if (phase !== "live" || winningSquareId == null) return;
    if (prevWinningRef.current === winningSquareId) return;
    prevWinningRef.current = winningSquareId;
    if (userSquareIds.includes(winningSquareId)) {
      setScoreFlash(true);
      const t = window.setTimeout(() => setScoreFlash(false), 500);
      return () => window.clearTimeout(t);
    }
  }, [winningSquareId, phase, userSquareIds]);

  const handleSquareSelect = (squareId: number) => {
    setSelectedSquareId((prev) => (prev === squareId ? null : squareId));
  };

  if (phase === "landing") {
    return (
      <div className="la-root flex flex-col items-center justify-center min-h-[100dvh] px-6 la-landing-hero">
        <div className="la-stadium-bg" />
        <div className="relative z-[1] text-center max-w-md space-y-6">
          <p className="text-[10px] uppercase tracking-[0.35em] text-blue-400/80 font-semibold">
            Project Legacy™ Prototype
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-br from-white via-blue-100 to-blue-400/80 bg-clip-text text-transparent">
            LIVE ARENA™
          </h1>
          <p className="text-sm text-sb-muted leading-relaxed">
            SquareBoards interactive live contest experience. Cinematic boards,
            real-time scoring, and premium sports technology — front-end demo
            only.
          </p>
          <Button
            onClick={startDemo}
            className="w-full max-w-xs mx-auto shadow-lg shadow-blue-500/20 !bg-gradient-to-r !from-blue-600 !to-blue-500 hover:!from-blue-500 hover:!to-blue-400"
          >
            ENTER LIVE DEMO
          </Button>
          <p className="text-[10px] text-sb-muted/60">
            Mock data · No wallet or API calls
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="la-root pb-24">
      <div className="la-stadium-bg">
        <div className="la-stadium-spotlight" />
      </div>

      {phase === "opening" && (
        <OpeningSequence onComplete={onOpeningComplete} />
      )}

      <div className="relative z-[1] max-w-[430px] mx-auto px-4 pt-4 space-y-4">
        {(phase === "halftime" || phase === "complete") && (
          <PhaseOverlay phase={phase} onRestart={startDemo} />
        )}

        <LiveActivityBar stats={MOCK_STATS} active={phase === "live"} />

        <ContestCarousel
          contests={MOCK_CONTESTS}
          activeIndex={contestIndex}
          onChange={setContestIndex}
        />

        <ArenaHeader
          awayTeam={contest.awayTeam}
          awayAbbr={contest.awayAbbr}
          homeTeam={contest.homeTeam}
          homeAbbr={contest.homeAbbr}
          awayScore={awayScore}
          homeScore={homeScore}
          quarter={quarter}
          clock={clock}
          prizePool={contest.prizePool}
          contestType={contest.contestType}
          scoreFlash={scoreFlash}
        />

        <WinningBanner
          visible={userIsWinning && phase === "live"}
          payout={winningPayout}
          eventLabel={eventLabel}
        />

        <LiveArenaBoard
          contest={contest}
          userSquareIds={userSquareIds}
          winningSquareId={winningSquareId}
          selectedSquareId={selectedSquareId}
          revealed={boardRevealed || contest.id !== "bills-chiefs"}
          zoomed={selectedSquareId != null}
          onSquareClick={handleSquareSelect}
        />

        <MySquaresPanel
          squares={userSquares}
          winningSquareId={winningSquareId}
          selectedSquareId={selectedSquareId}
          onSelect={handleSquareSelect}
        />

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="text-[10px] text-sb-muted hover:text-white transition-colors"
          >
            {muted ? "🔇 Sound off" : "🔊 Sound on"}
          </button>
          <button
            type="button"
            onClick={startDemo}
            className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
          >
            ↺ Restart demo
          </button>
        </div>
      </div>

      <LiveDock active={dockTab} onChange={setDockTab} />
    </div>
  );
}

function PhaseOverlay({
  phase,
  onRestart,
}: {
  phase: "halftime" | "complete";
  onRestart: () => void;
}) {
  const isFinal = phase === "complete";

  return (
    <div className="la-winning-banner la-glass-card p-4 text-center border border-white/10">
      <p className="text-lg font-bold">
        {isFinal ? "🏁 Contest Complete" : "⏸ Halftime"}
      </p>
      <p className="text-xs text-sb-muted mt-1">
        {isFinal
          ? "Demo simulation finished. Bills 34 — Chiefs 31."
          : "Board numbers remain locked. Second half starting…"}
      </p>
      {isFinal && (
        <Button
          size="sm"
          variant="secondary"
          onClick={onRestart}
          className="mt-3 w-full"
        >
          ENTER LIVE DEMO
        </Button>
      )}
    </div>
  );
}
