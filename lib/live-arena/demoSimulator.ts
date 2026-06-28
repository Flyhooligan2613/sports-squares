import type { DemoScoreEvent } from "./types";

/** Full Bills vs Chiefs demo timeline — kickoff through final. */
export const BILLS_CHIEFS_DEMO: DemoScoreEvent[] = [
  { quarter: 1, clock: "15:00", awayScore: 0, homeScore: 0, label: "Kickoff", pauseMs: 2200 },
  { quarter: 1, clock: "11:34", awayScore: 0, homeScore: 0, pauseMs: 1800 },
  { quarter: 1, clock: "8:22", awayScore: 7, homeScore: 0, label: "Bills TD", pauseMs: 2400 },
  { quarter: 1, clock: "4:51", awayScore: 7, homeScore: 3, label: "Chiefs FG", pauseMs: 2200 },
  { quarter: 1, clock: "1:08", awayScore: 7, homeScore: 10, label: "Chiefs TD", pauseMs: 2000 },
  { quarter: 2, clock: "14:02", awayScore: 10, homeScore: 10, label: "End Q1", pauseMs: 1600 },
  { quarter: 2, clock: "10:44", awayScore: 10, homeScore: 10, pauseMs: 2000 },
  { quarter: 2, clock: "6:17", awayScore: 17, homeScore: 10, label: "Bills TD", pauseMs: 2400 },
  { quarter: 2, clock: "2:33", awayScore: 17, homeScore: 17, label: "Chiefs TD", pauseMs: 2200 },
  { quarter: 2, clock: "0:00", awayScore: 17, homeScore: 17, label: "Halftime", pauseMs: 2800 },
  { quarter: 3, clock: "12:18", awayScore: 17, homeScore: 20, label: "Chiefs FG", pauseMs: 2200 },
  { quarter: 3, clock: "8:41", awayScore: 17, homeScore: 21, label: "Chiefs TD", pauseMs: 2400 },
  { quarter: 3, clock: "4:09", awayScore: 24, homeScore: 21, label: "Bills TD", pauseMs: 2400 },
  { quarter: 3, clock: "0:52", awayScore: 24, homeScore: 24, label: "Chiefs TD", pauseMs: 2000 },
  { quarter: 4, clock: "13:27", awayScore: 24, homeScore: 24, label: "End Q3", pauseMs: 1600 },
  { quarter: 4, clock: "9:15", awayScore: 27, homeScore: 24, label: "Bills FG", pauseMs: 2400 },
  { quarter: 4, clock: "5:02", awayScore: 27, homeScore: 31, label: "Chiefs TD", pauseMs: 2600 },
  { quarter: 4, clock: "1:44", awayScore: 34, homeScore: 31, label: "Bills TD", pauseMs: 2800 },
  { quarter: 4, clock: "0:00", awayScore: 34, homeScore: 31, label: "Final", pauseMs: 4000 },
];

export function getDemoPhaseLabel(event: DemoScoreEvent): string | null {
  if (event.label === "Halftime") return "halftime";
  if (event.label === "Final") return "complete";
  if (event.label?.startsWith("End Q")) return "quarter-break";
  return null;
}
