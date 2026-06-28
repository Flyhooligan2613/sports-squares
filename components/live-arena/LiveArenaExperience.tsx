"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getSquareDisplayNumber } from "@/lib/engines/squareDisplay";
import {
  initArenaAudio,
  playArenaSfx,
  setArenaAudioPrefs,
  setCrowdEnergy,
} from "@/lib/live-arena/audio";
import {
  BILLS_CHIEFS_DEMO,
  findDemoIndexByCelebration,
  findDemoIndexByKind,
  findDemoIndexForScore,
  getDemoPhaseLabel,
  getDemoSfxKind,
} from "@/lib/live-arena/demoSimulator";
import {
  CELEBRATION_PHASE_MS,
  getCelebrationPhaseSequence,
  pickMysteryWinner,
} from "@/lib/live-arena/celebrations";
import {
  HAPTIC_CLASS,
  HAPTIC_DURATION_MS,
  type HapticIntensity,
} from "@/lib/live-arena/motion";
import {
  MOCK_CENTER_STATS,
  MOCK_CONTEST_SUMMARIES,
  MOCK_CONTESTS,
  MOCK_STATS,
  buildUserSquareMeta,
  getUserSquareIds,
} from "@/lib/live-arena/mockData";
import { getWinningSquareMatch } from "@/lib/live-arena/squareUtils";
import type {
  BoardRevealPhase,
  CelebrationPhase,
  DockTab,
  LiveArenaPhase,
  ScoreReactionPhase,
  WinCelebrationKind,
  WinCelebrationState,
} from "@/lib/live-arena/types";
import ArenaAudioControls from "./ArenaAudioControls";
import ArenaHeader from "./ArenaHeader";
import ContestCenterDashboard from "./ContestCenterDashboard";
import ContestStatusBanner from "./ContestStatusBanner";
import DevDemoPanel, { type DevDemoActions } from "./DevDemoPanel";
import FloatingContestInfo from "./FloatingContestInfo";
import LiveActivityBar from "./LiveActivityBar";
import LiveArenaBoard from "./LiveArenaBoard";
import LiveDock from "./LiveDock";
import MySquaresPanel from "./MySquaresPanel";
import OpeningSequence from "./OpeningSequence";
import SquareDetailOverlay from "./SquareDetailOverlay";
import WinCelebration from "./WinCelebration";
import "./live-arena.css";

const IDLE_CELEBRATION: WinCelebrationState = {
  active: false,
  kind: null,
  phase: "idle",
  winningSquareId: null,
  payout: 0,
};

function getCloseSquareIds(userIds: number[], winningId: number): number[] {
  const winRow = Math.floor(winningId / 10);
  const winCol = winningId % 10;
  return userIds.filter((id) => {
    const r = Math.floor(id / 10);
    const c = id % 10;
    return Math.abs(r - winRow) <= 1 && Math.abs(c - winCol) <= 1;
  });
}

function getConfettiOrigin(row: number, col: number): { x: number; y: number } {
  return {
    x: 18 + (col + 0.5) * 6.4,
    y: 22 + (row + 0.5) * 5.6,
  };
}

const REVEAL_TIMINGS = {
  grid: 400,
  numbers: 2200,
  owned: 3200,
  complete: 3600,
};

export default function LiveArenaExperience() {
  const searchParams = useSearchParams();
  const devFromUrl = searchParams.get("dev") === "1";

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
  const [hapticClass, setHapticClass] = useState("");
  const [boardTension, setBoardTension] = useState(false);
  const [celebration, setCelebration] = useState<WinCelebrationState>(IDLE_CELEBRATION);
  const [devOpen, setDevOpen] = useState(devFromUrl);
  const [devNotification, setDevNotification] = useState(false);
  const [demoPaused, setDemoPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  const reactionTimers = useRef<number[]>([]);
  const prevWinningRef = useRef<number | null>(null);
  const prevDemoIndexRef = useRef(0);
  const cornerTaps = useRef(0);
  const cornerTimer = useRef<number | null>(null);

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

  const winningDisplayNumber = useMemo(() => {
    if (winningSquareId == null) return "—";
    const num = getSquareDisplayNumber(winningSquareId, contest.innerNumbers);
    return num != null ? `#${num}` : `#${winningSquareId + 1}`;
  }, [winningSquareId, contest.innerNumbers]);

  const userIsWinning =
    winningSquareId != null && userSquareIds.includes(winningSquareId);

  const winningPayout =
    userSquares.find((s) => s.squareId === winningSquareId)?.potentialPayout ??
    625;

  const selectedSquare = userSquares.find((s) => s.squareId === selectedSquareId);

  const closeSquareIds = useMemo(() => {
    if (celebration.kind !== "mystery-square" || winningSquareId == null) return [];
    return getCloseSquareIds(userSquareIds, winningSquareId);
  }, [celebration.kind, winningSquareId, userSquareIds]);

  const confettiOrigin = useMemo(() => {
    if (winningMatch == null) return { x: 50, y: 45 };
    return getConfettiOrigin(winningMatch.row, winningMatch.col);
  }, [winningMatch]);

  const clearCelebration = useCallback(() => {
    setCelebration(IDLE_CELEBRATION);
    setSignatureActive(false);
    setBoardReacting(false);
    setReactionPhase("idle");
  }, []);

  const clearReactionTimers = useCallback(() => {
    reactionTimers.current.forEach((t) => window.clearTimeout(t));
    reactionTimers.current = [];
  }, []);

  const triggerHaptic = useCallback((intensity: HapticIntensity = "medium") => {
    setHapticClass(HAPTIC_CLASS[intensity]);
    const t = window.setTimeout(
      () => setHapticClass(""),
      HAPTIC_DURATION_MS[intensity]
    );
    reactionTimers.current.push(t);
  }, []);

  const scheduleCelebrationPhase = useCallback(
    (
      startMs: number,
      phase: CelebrationPhase,
      onEnter?: () => void
    ): number => {
      reactionTimers.current.push(
        window.setTimeout(() => {
          setCelebration((prev) => ({ ...prev, phase }));
          onEnter?.();
        }, startMs)
      );
      return startMs;
    },
    []
  );

  const startWinCelebration = useCallback(
    (
      kind: WinCelebrationKind,
      squareId: number,
      payout: number,
      poolLine?: "row" | "col"
    ) => {
      clearReactionTimers();
      setBoardTension(false);

      const maskedWinner =
        kind === "mystery-square" ? pickMysteryWinner(squareId) : undefined;

      setReactionPhase("score-flash");
      setScoreUpdating(true);
      setScoreFlash(true);
      triggerHaptic("heavy");
      if (audioReady) playArenaSfx("score-tick");

      reactionTimers.current.push(
        window.setTimeout(() => {
          setScoreUpdating(false);
          setScoreFlash(false);
          setReactionPhase("board-pause");
        }, 450)
      );

      reactionTimers.current.push(
        window.setTimeout(() => {
          setCelebration({
            active: true,
            kind,
            phase: "anticipation",
            winningSquareId: squareId,
            payout,
            maskedWinner,
            poolLine,
          });
          setSignatureActive(true);
          setBoardReacting(true);
          setReactionPhase("signature");
          if (audioReady) {
            playArenaSfx("anticipation-drone");
            playArenaSfx("winning-square");
            setCrowdEnergy(kind === "mystery-square" ? 0.75 : 0.95);
          }
          triggerHaptic(kind === "user-square" || kind === "quarter-pool" ? "heavy" : "medium");
        }, 750)
      );

      const phases = getCelebrationPhaseSequence(kind);
      let cursor = 750 + CELEBRATION_PHASE_MS.anticipation;

      for (const phase of phases) {
        if (phase === "anticipation") continue;

        const phaseMs = CELEBRATION_PHASE_MS[phase];
        const at = cursor;

        scheduleCelebrationPhase(at, phase, () => {
          if (!audioReady) return;
          if (phase === "pool-highlight") playArenaSfx("small-win-chime");
          if (phase === "spin") playArenaSfx("prize-spin");
          if (phase === "burst") {
            playArenaSfx("prize-burst");
            playArenaSfx("confetti-shimmer");
            triggerHaptic("heavy");
          }
          if (phase === "banner") {
            playArenaSfx(
              kind === "mystery-square" ? "small-win-chime" : "big-win-fanfare"
            );
            if (kind === "user-square" || kind === "quarter-pool") {
              playArenaSfx("wallet-reward");
            }
          }
          if (phase === "complete") {
            setSignatureActive(false);
            setBoardReacting(false);
            setReactionPhase("idle");
            window.setTimeout(() => clearCelebration(), 500);
          }
        });

        cursor += phaseMs;
      }
    },
    [
      audioReady,
      clearCelebration,
      clearReactionTimers,
      scheduleCelebrationPhase,
      triggerHaptic,
    ]
  );

  const ensureAudio = useCallback(async () => {
    if (audioReady) return;
    await initArenaAudio();
    setAudioReady(true);
    setArenaAudioPrefs({ muted, masterVolume: volume });
  }, [audioReady, muted, volume]);

  const runScoreReaction = useCallback(
    (winningChanged: boolean, userWonSquare: boolean) => {
      clearReactionTimers();
      setReactionPhase("score-flash");
      setScoreUpdating(true);
      setScoreFlash(true);
      triggerHaptic(winningChanged ? "heavy" : "light");

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
            if (userWonSquare) triggerHaptic("medium");
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

  const enterDashboard = useCallback(async () => {
    await ensureAudio();
    setPhase("dashboard");
    setDemoIndex(0);
    setRevealPhase("hidden");
    setSelectedSquareId(null);
    setSignatureActive(false);
    setReactionPhase("idle");
    setDemoPaused(false);
    setCelebration(IDLE_CELEBRATION);
    setBoardTension(false);
    prevWinningRef.current = null;
    prevDemoIndexRef.current = 0;
  }, [ensureAudio]);

  const joinContest = useCallback(async () => {
    await ensureAudio();
    setPhase("opening");
    setDemoIndex(0);
    setRevealPhase("hidden");
    setSelectedSquareId(null);
    setSignatureActive(false);
    setReactionPhase("idle");
    setDemoPaused(false);
    setCelebration(IDLE_CELEBRATION);
    setBoardTension(false);
    prevWinningRef.current = null;
    prevDemoIndexRef.current = 0;
  }, [ensureAudio]);

  const onOpeningComplete = useCallback(() => {
    setPhase("live");
  }, []);

  const jumpToDemoIndex = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= BILLS_CHIEFS_DEMO.length) return;
      setDemoPaused(true);
      if (phase !== "live") {
        setContestIndex(0);
        setPhase("live");
        setRevealPhase("complete");
      }
      setDemoIndex(idx);
      const event = BILLS_CHIEFS_DEMO[idx];
      const sfx = event ? getDemoSfxKind(event) : null;
      if (audioReady && sfx) playArenaSfx(sfx);
    },
    [audioReady, phase]
  );

  const triggerCelebrationAtIndex = useCallback(
    (idx: number, forcedKind?: WinCelebrationKind) => {
      const event = BILLS_CHIEFS_DEMO[idx];
      if (!event) return;
      jumpToDemoIndex(idx);
      const match = getWinningSquareMatch(
        contest.topNumbers,
        contest.sideNumbers,
        event.homeScore,
        event.awayScore
      );
      if (!match) return;
      const kind =
        forcedKind ??
        event.celebration ??
        (userSquareIds.includes(match.squareId) ? "user-square" : "mystery-square");
      const poolLine =
        kind === "quarter-pool" ? ("row" as const) : undefined;
      const payout =
        userSquares.find((s) => s.squareId === match.squareId)?.potentialPayout ??
        625;
      window.setTimeout(
        () => startWinCelebration(kind, match.squareId, payout, poolLine),
        120
      );
    },
    [contest, jumpToDemoIndex, startWinCelebration, userSquareIds, userSquares]
  );

  const devActions: DevDemoActions = useMemo(
    () => ({
      triggerTouchdown: () => jumpToDemoIndex(findDemoIndexByKind("touchdown")),
      triggerFieldGoal: () => jumpToDemoIndex(findDemoIndexByKind("field-goal")),
      triggerSafety: () => {
        if (audioReady) playArenaSfx("safety");
        triggerHaptic("heavy");
      },
      triggerQuarterEnd: () =>
        jumpToDemoIndex(findDemoIndexByKind("quarter-end")),
      triggerHalftime: () => {
        jumpToDemoIndex(findDemoIndexByKind("halftime"));
        setPhase("halftime");
      },
      triggerFinal: () => {
        jumpToDemoIndex(findDemoIndexByKind("final"));
        setPhase("complete");
      },
      triggerWalletReward: () => {
        if (audioReady) playArenaSfx("wallet-reward");
        triggerHaptic("medium");
      },
      triggerWinningSquare: () => {
        const userId = userSquareIds[2] ?? userSquareIds[0];
        if (userId == null) return;
        const row = Math.floor(userId / 10);
        const col = userId % 10;
        const away = contest.sideNumbers[row] ?? 0;
        const home = contest.topNumbers[col] ?? 0;
        const idx = findDemoIndexForScore(away, home);
        if (idx >= 0) jumpToDemoIndex(idx);
        else runScoreReaction(true, true);
      },
      triggerLosingSquare: () => {
        jumpToDemoIndex(findDemoIndexForScore(17, 21));
        runScoreReaction(true, false);
      },
      triggerNotification: () => {
        if (audioReady) playArenaSfx("notification");
        triggerHaptic("light");
        setDevNotification(true);
        window.setTimeout(() => setDevNotification(false), 2500);
      },
      triggerYouWinSquare: () =>
        triggerCelebrationAtIndex(findDemoIndexByCelebration("user-square")),
      triggerMysteryWinner: () =>
        triggerCelebrationAtIndex(findDemoIndexByCelebration("mystery-square")),
      triggerQuarterPoolWin: () =>
        triggerCelebrationAtIndex(findDemoIndexByCelebration("quarter-pool")),
    }),
    [
      audioReady,
      contest,
      jumpToDemoIndex,
      runScoreReaction,
      triggerCelebrationAtIndex,
      triggerHaptic,
      userSquareIds,
    ]
  );

  const handleCornerTap = useCallback(() => {
    cornerTaps.current += 1;
    if (cornerTimer.current) window.clearTimeout(cornerTimer.current);
    if (cornerTaps.current >= 3) {
      cornerTaps.current = 0;
      setDevOpen((o) => !o);
      return;
    }
    cornerTimer.current = window.setTimeout(() => {
      cornerTaps.current = 0;
    }, 600);
  }, []);

  useEffect(() => {
    if (phase !== "live" || contest.id !== "bills-chiefs") return;
    return startRevealSequence();
  }, [phase, contest.id, startRevealSequence]);

  const onOpeningGridReady = useCallback(() => {
    setRevealPhase("grid");
  }, []);

  useEffect(() => {
    if (!audioReady) return;
    setArenaAudioPrefs({ muted, masterVolume: volume });
  }, [muted, volume, audioReady]);

  useEffect(() => {
    if (phase !== "live" || contest.id !== "bills-chiefs" || demoPaused) return;

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
      triggerHaptic("heavy");
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
    const nextIdx = demoIndex + 1;
    const nextEvent = BILLS_CHIEFS_DEMO[nextIdx];
    const scoreWillChange =
      nextEvent != null &&
      (event.awayScore !== nextEvent.awayScore ||
        event.homeScore !== nextEvent.homeScore);

    let tensionTimer: number | null = null;
    if (scoreWillChange && delay > 500) {
      tensionTimer = window.setTimeout(() => setBoardTension(true), delay - 450);
    }

    timerRef.current = window.setTimeout(() => {
      setBoardTension(false);
      if (demoIndex < BILLS_CHIEFS_DEMO.length - 1) {
        const sfx = nextEvent ? getDemoSfxKind(nextEvent) : null;
        if (audioReady && sfx) {
          playArenaSfx(sfx);
          if (sfx === "touchdown") triggerHaptic("heavy");
          else if (sfx === "field-goal") triggerHaptic("light");
        }
        setDemoIndex(nextIdx);
      } else {
        setPhase("complete");
      }
    }, delay);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (tensionTimer != null) window.clearTimeout(tensionTimer);
    };
  }, [phase, demoIndex, contest.id, audioReady, triggerHaptic, demoPaused]);

  useEffect(() => {
    if (phase !== "live" || contest.id !== "bills-chiefs") return;
    if (demoIndex === prevDemoIndexRef.current) return;

    const prevEvent = BILLS_CHIEFS_DEMO[prevDemoIndexRef.current];
    const currEvent = BILLS_CHIEFS_DEMO[demoIndex];
    if (!prevEvent || !currEvent) return;

    if (demoPaused) {
      prevDemoIndexRef.current = demoIndex;
      return;
    }

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

    if (currEvent.celebration && currMatch && winningChanged) {
      const poolLine =
        currEvent.celebration === "quarter-pool" ? ("row" as const) : undefined;
      const payout =
        userSquares.find((s) => s.squareId === currMatch.squareId)
          ?.potentialPayout ?? 625;
      startWinCelebration(
        currEvent.celebration,
        currMatch.squareId,
        payout,
        poolLine
      );
    } else {
      runScoreReaction(winningChanged, userWonSquare);
    }

    prevDemoIndexRef.current = demoIndex;
  }, [
    demoIndex,
    phase,
    contest,
    userSquareIds,
    userSquares,
    runScoreReaction,
    startWinCelebration,
    demoPaused,
  ]);

  useEffect(() => {
    if (phase !== "live" || winningSquareId == null) return;
    if (prevWinningRef.current === winningSquareId) return;
    const wasWinning =
      prevWinningRef.current != null &&
      userSquareIds.includes(prevWinningRef.current);
    prevWinningRef.current = winningSquareId;

    if (userSquareIds.includes(winningSquareId) && !wasWinning && !celebration.active) {
      if (audioReady) playArenaSfx("wallet-reward");
      triggerHaptic("medium");
    }
  }, [winningSquareId, phase, userSquareIds, audioReady, triggerHaptic, celebration.active]);

  useEffect(() => {
    return () => {
      clearReactionTimers();
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (cornerTimer.current) window.clearTimeout(cornerTimer.current);
    };
  }, [clearReactionTimers]);

  const handleSquareSelect = (squareId: number) => {
    if (!userSquareIds.includes(squareId)) return;
    setSelectedSquareId((prev) => (prev === squareId ? null : squareId));
    triggerHaptic("light");
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
            onClick={enterDashboard}
            className="w-full max-w-xs mx-auto shadow-lg shadow-blue-500/20 !bg-gradient-to-r !from-blue-600 !to-blue-500 hover:!from-blue-500 hover:!to-blue-400 min-h-[48px]"
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

  if (phase === "dashboard") {
    return (
      <div className="la-root pb-24 min-h-[100dvh]">
        <div className="la-stadium-bg">
          <div className="la-stadium-spotlight" />
        </div>
        <div className="relative z-[1] max-w-[430px] mx-auto px-4 pt-4 space-y-4">
          <header className="text-center space-y-1 pb-2">
            <p className="text-[10px] uppercase tracking-[0.35em] text-blue-400/80 font-semibold">
              Contest Center
            </p>
            <h1 className="text-xl font-bold tracking-tight">LIVE ARENA™</h1>
          </header>
          <ContestCenterDashboard
            stats={MOCK_CENTER_STATS}
            contests={MOCK_CONTEST_SUMMARIES}
            activeIndex={contestIndex}
            onChange={setContestIndex}
            onJoinContest={joinContest}
          />
          <ArenaAudioControls
            muted={muted}
            volume={volume}
            onMutedChange={setMuted}
            onVolumeChange={setVolume}
          />
        </div>
        <LiveDock active={dockTab} onChange={setDockTab} />
        <button
          type="button"
          className="la-dev-corner-hit"
          onClick={handleCornerTap}
          aria-label="Developer access"
        />
        <DevDemoPanel
          open={devOpen}
          onClose={() => setDevOpen(false)}
          actions={devActions}
        />
      </div>
    );
  }

  return (
    <div className={["la-root pb-24", hapticClass].filter(Boolean).join(" ")}>
      <div className="la-stadium-bg">
        <div className="la-stadium-spotlight" />
      </div>

      {phase === "opening" && (
        <OpeningSequence
          onComplete={onOpeningComplete}
          onGridReady={onOpeningGridReady}
          contestName={`${contest.awayTeam} vs ${contest.homeTeam}`}
        />
      )}

      <div className="relative z-[1] max-w-[430px] mx-auto px-4 pt-4 space-y-3">
        {(phase === "halftime" || phase === "complete") && (
          <PhaseOverlay phase={phase} onRestart={enterDashboard} />
        )}

        {devNotification && (
          <div className="la-dev-toast la-glass-card p-2 text-center text-xs font-semibold text-blue-300">
            Demo notification triggered
          </div>
        )}

        <LiveActivityBar stats={MOCK_STATS} active={phase === "live"} />

        <FloatingContestInfo
          contest={contest}
          quarter={quarter}
          clock={clock}
          winningDisplayNumber={winningDisplayNumber}
          potentialPrize={winningPayout}
          visible={phase === "live" && revealPhase === "complete"}
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
          hapticClass={hapticClass}
          onLongPress={() => setDevOpen(true)}
        />

        <ContestStatusBanner
          visible={
            (phase === "live" && revealPhase === "complete") || devNotification
          }
          userIsWinning={devNotification ? true : userIsWinning}
          payout={winningPayout}
          animatePayout={
            (userIsWinning &&
              (reactionPhase === "illuminate" ||
                celebration.phase === "banner")) ||
            devNotification
          }
        />

        <div className="relative">
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
            boardBreathing={phase === "live" && revealPhase === "complete"}
            boardTension={boardTension}
            celebrationPhase={celebration.phase}
            celebrationKind={celebration.kind}
            poolLine={celebration.poolLine ?? null}
            closeSquareIds={closeSquareIds}
            onSquareClick={handleSquareSelect}
          />

          <WinCelebration
            active={celebration.active}
            kind={celebration.kind}
            phase={celebration.phase}
            payout={celebration.payout}
            maskedWinner={celebration.maskedWinner}
            confettiOrigin={confettiOrigin}
          />
        </div>

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
            onClick={enterDashboard}
            className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors shrink-0 min-h-[44px] px-2"
          >
            ← Contests
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

      <button
        type="button"
        className="la-dev-corner-hit"
        onClick={handleCornerTap}
        aria-label="Developer access"
      />

      <DevDemoPanel
        open={devOpen}
        onClose={() => setDevOpen(false)}
        actions={devActions}
      />
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
          className="mt-3 w-full min-h-[44px]"
        >
          Back to Contest Center
        </Button>
      )}
    </div>
  );
}
