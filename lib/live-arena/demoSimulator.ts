import type { DemoScoreEvent } from "./types";

function td(crowd = 0.75): Partial<DemoScoreEvent> {
  return { kind: "touchdown", crowdLevel: crowd };
}

function fg(crowd = 0.55): Partial<DemoScoreEvent> {
  return { kind: "field-goal", crowdLevel: crowd };
}

/** Full Bills vs Chiefs demo timeline — kickoff through final. */
export const BILLS_CHIEFS_DEMO: DemoScoreEvent[] = [
  { quarter: 1, clock: "15:00", awayScore: 0, homeScore: 0, label: "Kickoff", pauseMs: 2200, kind: "kickoff", crowdLevel: 0.15 },
  { quarter: 1, clock: "11:34", awayScore: 0, homeScore: 0, pauseMs: 1800, kind: "tick", crowdLevel: 0.2 },
  { quarter: 1, clock: "8:22", awayScore: 7, homeScore: 0, label: "Bills TD", pauseMs: 2400, ...td(0.85) },
  { quarter: 1, clock: "4:51", awayScore: 7, homeScore: 3, label: "Chiefs FG", pauseMs: 2200, ...fg(0.5) },
  { quarter: 1, clock: "1:08", awayScore: 7, homeScore: 10, label: "Chiefs TD", pauseMs: 2000, ...td(0.8) },
  { quarter: 2, clock: "14:02", awayScore: 10, homeScore: 10, label: "End Q1", pauseMs: 1600, kind: "quarter-end", crowdLevel: 0.45 },
  { quarter: 2, clock: "10:44", awayScore: 10, homeScore: 10, pauseMs: 2000, kind: "tick", crowdLevel: 0.35 },
  { quarter: 2, clock: "6:17", awayScore: 17, homeScore: 10, label: "Bills TD", pauseMs: 2400, ...td(0.9) },
  { quarter: 2, clock: "2:33", awayScore: 17, homeScore: 17, label: "Chiefs TD", pauseMs: 2200, ...td(0.88) },
  { quarter: 2, clock: "0:00", awayScore: 17, homeScore: 17, label: "Halftime", pauseMs: 2800, kind: "halftime", crowdLevel: 0.25 },
  { quarter: 3, clock: "12:18", awayScore: 17, homeScore: 20, label: "Chiefs FG", pauseMs: 2200, ...fg(0.55) },
  { quarter: 3, clock: "8:41", awayScore: 17, homeScore: 21, label: "Chiefs TD", pauseMs: 2400, ...td(0.82) },
  { quarter: 3, clock: "4:09", awayScore: 24, homeScore: 21, label: "Bills TD", pauseMs: 2400, ...td(0.92) },
  { quarter: 3, clock: "0:52", awayScore: 24, homeScore: 24, label: "Chiefs TD", pauseMs: 2000, ...td(0.88) },
  { quarter: 4, clock: "13:27", awayScore: 24, homeScore: 24, label: "End Q3", pauseMs: 1600, kind: "quarter-end", crowdLevel: 0.5 },
  { quarter: 4, clock: "9:15", awayScore: 27, homeScore: 24, label: "Bills FG", pauseMs: 2400, ...fg(0.6) },
  { quarter: 4, clock: "5:02", awayScore: 27, homeScore: 31, label: "Chiefs TD", pauseMs: 2600, ...td(0.95) },
  { quarter: 4, clock: "1:44", awayScore: 34, homeScore: 31, label: "Bills TD", pauseMs: 2800, ...td(1) },
  { quarter: 4, clock: "0:00", awayScore: 34, homeScore: 31, label: "Final", pauseMs: 4000, kind: "final", crowdLevel: 0.7 },
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

/** Find demo index where score changes to target winning square digits. */
export function findDemoIndexForScore(
  awayScore: number,
  homeScore: number
): number {
  return BILLS_CHIEFS_DEMO.findIndex(
    (e) => e.awayScore === awayScore && e.homeScore === homeScore
  );
}
