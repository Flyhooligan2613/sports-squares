"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  initArenaAudio,
  playArenaSfx,
  setArenaAudioPrefs,
  setCrowdEnergy,
} from "@/lib/live-arena/audio";
import {
  BILLS_CHIEFS_DEMO,
  getDemoPhaseLabel,
  getDemoSfxKind,
} from "@/lib/live-arena/demoSimulator";
import {
  MOCK_CONTESTS,
  MOCK_STATS,
  buildUserSquareMeta,
  getUserSquareIds,
} from "@/lib/live-arena/mockData";
import {
  getWinningSquareMatch,
} from "@/lib/live-arena/squareUtils";
import type {
  BoardRevealPhase,
  DockTab,
  LiveArenaPhase,
  ScoreReactionPhase,
} from "@/lib/live-arena/types";
import ArenaAudioControls from "./ArenaAudioControls";
import ArenaHeader from "./ArenaHeader";
import ContestCarousel from "./ContestCarousel";
import ContestStatusBanner from "./ContestStatusBanner";
import LiveActivityBar from "./LiveActivityBar";
import LiveArenaBoard from "./LiveArenaBoard";
import LiveDock from "./LiveDock";
import MySquaresPanel from "./MySquaresPanel";
import OpeningSequence from "./OpeningSequence";
import SquareDetailOverlay from "./SquareDetailOverlay";
import "./live-arena.css";

const REVEAL_TIMINGS = {
  grid: 400,
  numbers: 2200,
  owned: 3200,
  complete: 3600,
};

export default function LiveArenaExperience() {
  const [phase, setPhase] = useState<LiveArenaPhase>("landing");
  const [contestIndex, setContestIndex] = useState(0);
  const [demoIndex, setDemoIndex] = useState(0);
  const [revealPhase, setRevealPhase] = useState<BoardRevealPhase>("hidden");
  const [selectedSquareId, setSelectedSquareId] = useState<number | null>(null);
  const [scoreFlash, setScoreFlash] = useState(false);
  const [scoreUpdating, setScoreUpdating] = useState(false);
  const [boardReacting, setBoardReacting] = useState(false);
  const [signatureActive, setSignatureActive] = useState(false);
  const [reactionPhase, setReactionPhase] = useState<ScoreReactionPhase>("idle");
  const [dockTab, setDockTab] = useState<DockTab>("games");
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [audioReady, setAudioReady] = useState(false);
  const [hapticPulse, setHapticPulse] = useState(false);
  const timerRef = useRef<number | null>(null);
  const reactionTimers = useRef<number[]>([]);
  const prevWinningRef = useRef<number | null>(null);
  const prevDemoIndexRef = useRef(0);

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

  const winningMatch = useMemo(
    () =>
      getWinningSquareMatch(
        contest.topNumbers,
        contest.sideNumbers,
        homeScore,
        awayScore
      ),
    [contest, homeScore, awayScore]
  );

  const winningSquareId = winningMatch?.squareId ?? null;

  const userIsWinning =
    winningSquareId != null && userSquareIds.includes(winningSquareId);

  const winningPayout =
    userSquares.find((s) => s.squareId === winningSquareId)?.potentialPayout ??
    625;

  const selectedSquare = userSquares.find((s) => s.squareId === selectedSquareId);

  const clearReactionTimers = useCallback(() => {
    reactionTimers.current.forEach((t) => window.clearTimeout(t));
    reactionTimers.current = [];
  }, []);

  const triggerHaptic = useCallback(() => {
    setHapticPulse(true);
    const t = window.setTimeout(() => setHapticPulse(false), 450);
    reactionTimers.current.push(t);
  }, []);

  const runScoreReaction = useCallback(
    (winningChanged: boolean, userWonSquare: boolean) => {
      clearReactionTimers();
      setReactionPhase("score-flash");
      setScoreUpdating(true);
      setScoreFlash(true);

      reactionTimers.current.push(
        window.setTimeout(() => {
          setReactionPhase("board-pause");
          setScoreUpdating(false);
          setScoreFlash(false);
        }, 450)
      );

      reactionTimers.current.push(
        window.setTimeout(() => {
          setBoardReacting(true);
          setReactionPhase("signature");
          if (winningChanged) {
            setSignatureActive(true);
            playArenaSfx("winning-square");
            if (userWonSquare) triggerHaptic();
          }
        }, 750)
      );

      reactionTimers.current.push(
        window.setTimeout(() => {
          setReactionPhase("illuminate");
          setBoardReacting(false);
        }, 2200)
      );

      reactionTimers.current.push(
        window.setTimeout(() => {
          setSignatureActive(false);
          setReactionPhase("idle");
        }, 3200)
      );
    },
    [clearReactionTimers, triggerHaptic]
  );

  const startRevealSequence = useCallback(() => {
    setRevealPhase("grid");
    const timers = [
      window.setTimeout(() => setRevealPhase("numbers"), REVEAL_TIMINGS.numbers),
      window.setTimeout(() => setRevealPhase("owned"), REVEAL_TIMINGS.owned),
      window.setTimeout(() => setRevealPhase("complete"), REVEAL_TIMINGS.complete),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const startDemo = useCallback(async () => {
    if (!audioReady) {
      await initArenaAudio();
      setAudioReady(true);
      setArenaAudioPrefs({ muted, masterVolume: volume });
    }
    setPhase("opening");
    setDemoIndex(0);
    setRevealPhase("hidden");
    setSelectedSquareId(null);
    setSignatureActive(false);
    setReactionPhase("idle");
    prevWinningRef.current = null;
    prevDemoIndexRef.current = 0;
  }, [audioReady, muted, volume]);

  const onOpeningComplete = useCallback(() => {
    setPhase("live");
  }, []);

  useEffect(() => {
    if (phase !== "live" || contest.id !== "bills-chiefs") return;
    return startRevealSequence();
  }, [phase, contest.id, startRevealSequence]);

  const onOpeningGridReady = useCallback(() => {
    setRevealPhase("grid");
  }, []);

  // Audio prefs sync
  useEffect(() => {
    if (!audioReady) return;
    setArenaAudioPrefs({ muted, masterVolume: volume });
  }, [muted, volume, audioReady]);

  // Demo score progression + crowd/sfx
  useEffect(() => {
    if (phase !== "live" || contest.id !== "bills-chiefs") return;

    const event = BILLS_CHIEFS_DEMO[demoIndex];
    if (!event) {
      setPhase("complete");
      return;
    }

    if (audioReady && event.crowdLevel != null) {
      setCrowdEnergy(event.crowdLevel);
    }

    const special = getDemoPhaseLabel(event);

    if (special === "complete") {
      if (audioReady) playArenaSfx("contest-complete");
      triggerHaptic();
      timerRef.current = window.setTimeout(
        () => setPhase("complete"),
        event.pauseMs ?? 3000
      );
      return () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
      };
    }

    if (special === "halftime") {
      if (audioReady) setCrowdEnergy(0.2);
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
        const nextIdx = demoIndex + 1;
        const nextEvent = BILLS_CHIEFS_DEMO[nextIdx];
        const sfx = nextEvent ? getDemoSfxKind(nextEvent) : null;
        if (audioReady && sfx) {
          playArenaSfx(sfx);
          if (sfx === "touchdown") triggerHaptic();
        }
        setDemoIndex(nextIdx);
      } else {
        setPhase("complete");
      }
    }, delay);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [phase, demoIndex, contest.id, audioReady, triggerHaptic]);

  // Score reaction sequence on demo index change
  useEffect(() => {
    if (phase !== "live" || contest.id !== "bills-chiefs") return;
    if (demoIndex === prevDemoIndexRef.current) return;

    const prevEvent = BILLS_CHIEFS_DEMO[prevDemoIndexRef.current];
    const currEvent = BILLS_CHIEFS_DEMO[demoIndex];
    if (!prevEvent || !currEvent) return;

    const scoreChanged =
      prevEvent.awayScore !== currEvent.awayScore ||
      prevEvent.homeScore !== currEvent.homeScore;

    if (!scoreChanged) {
      prevDemoIndexRef.current = demoIndex;
      return;
    }

    const prevMatch = getWinningSquareMatch(
      contest.topNumbers,
      contest.sideNumbers,
      prevEvent.homeScore,
      prevEvent.awayScore
    );
    const currMatch = getWinningSquareMatch(
      contest.topNumbers,
      contest.sideNumbers,
      currEvent.homeScore,
      currEvent.awayScore
    );
    const winningChanged = prevMatch?.squareId !== currMatch?.squareId;
    const userWonSquare =
      currMatch != null && userSquareIds.includes(currMatch.squareId);

    runScoreReaction(winningChanged, userWonSquare);
    prevDemoIndexRef.current = demoIndex;
  }, [demoIndex, phase, contest, userSquareIds, runScoreReaction]);

  // Wallet reward haptic when user starts winning
  useEffect(() => {
    if (phase !== "live" || winningSquareId == null) return;
    if (prevWinningRef.current === winningSquareId) return;
    const wasWinning = prevWinningRef.current != null &&
      userSquareIds.includes(prevWinningRef.current);
    prevWinningRef.current = winningSquareId;

    if (userSquareIds.includes(winningSquareId) && !wasWinning) {
      if (audioReady) playArenaSfx("wallet-reward");
      triggerHaptic();
    }
  }, [winningSquareId, phase, userSquareIds, audioReady, triggerHaptic]);

  useEffect(() => {
    return () => {
      clearReactionTimers();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [clearReactionTimers]);

  const handleSquareSelect = (squareId: number) => {
    if (!userSquareIds.includes(squareId)) return;
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
            Mock data · No wallet or API calls · Tap to enable sound
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "la-root pb-24",
        hapticPulse ? "la-haptic-shake" : "",
      ].join(" ")}
    >
      <div className="la-stadium-bg">
        <div className="la-stadium-spotlight" />
      </div>

      {phase === "opening" && (
        <OpeningSequence
          onComplete={onOpeningComplete}
          onGridReady={onOpeningGridReady}
        />
      )}

      <div className="relative z-[1] max-w-[430px] mx-auto px-4 pt-4 space-y-3">
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
          scoreUpdating={scoreUpdating}
        />

        <ContestStatusBanner
          visible={phase === "live" && revealPhase === "complete"}
          userIsWinning={userIsWinning}
          payout={winningPayout}
          animatePayout={userIsWinning && reactionPhase === "illuminate"}
        />

        <LiveArenaBoard
          contest={contest}
          userSquareIds={userSquareIds}
          winningSquareId={winningSquareId}
          winningMatch={winningMatch}
          selectedSquareId={selectedSquareId}
          revealPhase={
            contest.id !== "bills-chiefs" ? "complete" : revealPhase
          }
          zoomed={selectedSquareId != null}
          signatureActive={signatureActive}
          boardReacting={boardReacting}
          onSquareClick={handleSquareSelect}
        />

        <MySquaresPanel
          squares={userSquares}
          winningSquareId={winningSquareId}
          selectedSquareId={selectedSquareId}
          onSelect={handleSquareSelect}
        />

        <div className="flex items-center justify-between pt-1 gap-2">
          <ArenaAudioControls
            muted={muted}
            volume={volume}
            onMutedChange={setMuted}
            onVolumeChange={setVolume}
          />
          <button
            type="button"
            onClick={startDemo}
            className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors shrink-0"
          >
            ↺ Restart
          </button>
        </div>
      </div>

      {selectedSquare && selectedSquareId != null && (
        <SquareDetailOverlay
          square={selectedSquare}
          isWinning={winningSquareId === selectedSquareId}
          awayScore={awayScore}
          homeScore={homeScore}
          quarter={quarter}
          clock={clock}
          onClose={() => setSelectedSquareId(null)}
        />
      )}

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
    <div className="la-winning-banner la-glass-card p-4 text-center border border-white/10 la-haptic-pulse">
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
