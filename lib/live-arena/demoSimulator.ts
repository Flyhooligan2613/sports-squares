import type { DemoScoreEvent, WinCelebrationKind } from "./types";

function td(crowd = 0.75): Partial<DemoScoreEvent> {
  return { kind: "touchdown", crowdLevel: crowd };
}

function fg(crowd = 0.55): Partial<DemoScoreEvent> {
  return { kind: "field-goal", crowdLevel: crowd };
}

/**
 * Bills vs Chiefs demo — scripted celebration beats at ~30s / ~60s / ~90s
 * from live phase start (cumulative pauseMs tuned).
 */
export const BILLS_CHIEFS_DEMO: DemoScoreEvent[] = [
  { quarter: 1, clock: "15:00", awayScore: 0, homeScore: 0, label: "Kickoff", pauseMs: 4000, kind: "kickoff", crowdLevel: 0.15 },
  { quarter: 1, clock: "12:44", awayScore: 0, homeScore: 0, pauseMs: 3500, kind: "tick", crowdLevel: 0.2 },
  { quarter: 1, clock: "10:18", awayScore: 0, homeScore: 3, label: "Chiefs FG", pauseMs: 3800, ...fg(0.45) },
  { quarter: 1, clock: "7:52", awayScore: 0, homeScore: 3, pauseMs: 3500, kind: "tick", crowdLevel: 0.25 },
  { quarter: 1, clock: "5:31", awayScore: 7, homeScore: 3, label: "Bills TD", pauseMs: 4000, ...td(0.75) },
  { quarter: 1, clock: "3:08", awayScore: 7, homeScore: 3, pauseMs: 3800, kind: "tick", crowdLevel: 0.3 },
  { quarter: 1, clock: "1:44", awayScore: 7, homeScore: 10, label: "Chiefs TD", pauseMs: 4000, ...td(0.8) },
  { quarter: 1, clock: "0:22", awayScore: 7, homeScore: 10, pauseMs: 4000, kind: "tick", crowdLevel: 0.35 },
  /* ~30s cumulative — user owns winning square (2-6 → square #9) */
  {
    quarter: 2,
    clock: "14:55",
    awayScore: 2,
    homeScore: 6,
    label: "Chiefs TD",
    pauseMs: 3200,
    ...td(0.92),
    celebration: "user-square",
  },
  { quarter: 2, clock: "11:20", awayScore: 2, homeScore: 6, pauseMs: 5000, kind: "tick", crowdLevel: 0.4 },
  { quarter: 2, clock: "9:04", awayScore: 5, homeScore: 6, label: "Bills FG", pauseMs: 4800, ...fg(0.5) },
  { quarter: 2, clock: "6:41", awayScore: 5, homeScore: 6, pauseMs: 4800, kind: "tick", crowdLevel: 0.42 },
  { quarter: 2, clock: "4:18", awayScore: 5, homeScore: 10, label: "Chiefs TD", pauseMs: 5000, ...td(0.78) },
  { quarter: 2, clock: "2:55", awayScore: 5, homeScore: 10, pauseMs: 6600, kind: "tick", crowdLevel: 0.44 },
  /* ~60s cumulative — mystery winner (4-2 → square #8) */
  {
    quarter: 2,
    clock: "1:12",
    awayScore: 4,
    homeScore: 2,
    label: "Bills TD",
    pauseMs: 3200,
    ...td(0.85),
    celebration: "mystery-square",
  },
  { quarter: 2, clock: "0:48", awayScore: 4, homeScore: 2, pauseMs: 13500, kind: "tick", crowdLevel: 0.46 },
  { quarter: 2, clock: "0:24", awayScore: 4, homeScore: 5, label: "Chiefs FG", pauseMs: 13500, ...fg(0.48) },
  /* ~90s cumulative — quarter pool line win (8-9 → user square #13, display #47) */
  {
    quarter: 2,
    clock: "0:00",
    awayScore: 8,
    homeScore: 9,
    label: "End Q2",
    pauseMs: 6800,
    kind: "quarter-end",
    crowdLevel: 0.65,
    celebration: "quarter-pool",
  },
  { quarter: 3, clock: "12:18", awayScore: 9, homeScore: 8, pauseMs: 2000, kind: "tick", crowdLevel: 0.35 },
  { quarter: 3, clock: "8:41", awayScore: 9, homeScore: 11, label: "Chiefs TD", pauseMs: 2400, ...td(0.72) },
  { quarter: 3, clock: "4:09", awayScore: 16, homeScore: 11, label: "Bills TD", pauseMs: 2400, ...td(0.88) },
  { quarter: 3, clock: "0:52", awayScore: 16, homeScore: 18, label: "Chiefs TD", pauseMs: 2000, ...td(0.82) },
  { quarter: 4, clock: "13:27", awayScore: 16, homeScore: 18, label: "End Q3", pauseMs: 1600, kind: "quarter-end", crowdLevel: 0.5 },
  { quarter: 4, clock: "9:15", awayScore: 19, homeScore: 18, label: "Bills FG", pauseMs: 2400, ...fg(0.6) },
  { quarter: 4, clock: "5:02", awayScore: 19, homeScore: 25, label: "Chiefs TD", pauseMs: 2600, ...td(0.92) },
  { quarter: 4, clock: "1:44", awayScore: 26, homeScore: 25, label: "Bills TD", pauseMs: 2800, ...td(0.98) },
  { quarter: 4, clock: "0:00", awayScore: 26, homeScore: 25, label: "Final", pauseMs: 4000, kind: "final", crowdLevel: 0.7 },
];

export function getDemoPhaseLabel(event: DemoScoreEvent): string | null {
  if (event.label === "Halftime") return "halftime";
  if (event.label === "Final") return "complete";
  if (event.label?.startsWith("End Q")) return "quarter-break";
  return null;
}

export function getDemoSfxKind(
  event: DemoScoreEvent
): "touchdown" | "field-goal" | "safety" | "quarter-end" | "contest-complete" | null {
  if (event.kind === "touchdown") return "touchdown";
  if (event.kind === "field-goal") return "field-goal";
  if (event.kind === "safety") return "safety";
  if (event.kind === "quarter-end") return "quarter-end";
  if (event.kind === "final") return "contest-complete";
  return null;
}

/** Find first demo index matching a kind (for dev panel jumps). */
export function findDemoIndexByKind(kind: DemoScoreEvent["kind"]): number {
  return BILLS_CHIEFS_DEMO.findIndex((e) => e.kind === kind);
}

/** Find first demo index with a scripted celebration beat. */
export function findDemoIndexByCelebration(
  celebration: WinCelebrationKind
): number {
  return BILLS_CHIEFS_DEMO.findIndex((e) => e.celebration === celebration);
}

/** Find demo index where score changes to target winning square digits. */
export function findDemoIndexForScore(
  awayScore: number,
  homeScore: number
): number {
  return BILLS_CHIEFS_DEMO.findIndex(
    (e) => e.awayScore === awayScore && e.homeScore === homeScore
  );
}

/** Cumulative ms from live start until event index is reached. */
export function getDemoCumulativeMs(index: number): number {
  let total = 0;
  for (let i = 0; i < index && i < BILLS_CHIEFS_DEMO.length; i++) {
    total += BILLS_CHIEFS_DEMO[i]?.pauseMs ?? 2500;
  }
  return total;
}
