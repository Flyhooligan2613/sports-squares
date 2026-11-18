import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CELEBRATION_PHASE_MS,
  CELEBRATION_TOTAL_MS,
  getSportBallVisual,
  measureWinningSquareOrigin,
  SPORT_BALL_VISUALS,
} from "./celebrations";
import type { ContestSport } from "./types";

describe("live arena celebration helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps every contest sport mapped to a fly-by visual", () => {
    const sports: ContestSport[] = ["nfl", "nba", "mlb", "pickem"];

    expect(Object.keys(SPORT_BALL_VISUALS).sort()).toEqual([...sports].sort());
    expect(getSportBallVisual("nfl")).toEqual({
      emoji: "🏈",
      label: "Football",
      variant: "nfl",
    });
    expect(getSportBallVisual("nba")).toEqual({
      emoji: "🏀",
      label: "Basketball",
      variant: "nba",
    });
    expect(getSportBallVisual("mlb")).toEqual({
      emoji: "⚾",
      label: "Baseball",
      variant: "mlb",
    });
    expect(getSportBallVisual("pickem")).toEqual({
      emoji: "🏆",
      label: "Trophy",
      variant: "pickem",
    });
  });

  it("derives the total celebration duration from all active phases", () => {
    const total = Object.values(CELEBRATION_PHASE_MS).reduce(
      (sum, duration) => sum + duration,
      0
    );

    expect(CELEBRATION_TOTAL_MS).toBe(total);
    expect(CELEBRATION_PHASE_MS.spin).toBeGreaterThan(
      CELEBRATION_PHASE_MS.burst
    );
  });

  it("measures the center and square size of the marked winning square", () => {
    vi.stubGlobal("document", {
      querySelector: vi.fn(() => ({
        getBoundingClientRect: () => ({
          left: 10,
          top: 20,
          width: 40,
          height: 30,
        }),
      })),
    });

    expect(measureWinningSquareOrigin()).toEqual({
      x: 30,
      y: 35,
      size: 40,
    });
    expect(document.querySelector).toHaveBeenCalledWith(
      '[data-la-winning-square="true"]'
    );
  });

  it("returns null when there is no browser document", () => {
    expect(measureWinningSquareOrigin()).toBeNull();
  });

  it("returns null when the winning square is absent or not measurable", () => {
    vi.stubGlobal("document", {
      querySelector: vi.fn(() => null),
    });
    expect(measureWinningSquareOrigin()).toBeNull();

    vi.stubGlobal("document", {
      querySelector: vi.fn(() => ({
        getBoundingClientRect: () => ({
          left: 10,
          top: 20,
          width: 0,
          height: 30,
        }),
      })),
    });
    expect(measureWinningSquareOrigin()).toBeNull();
  });
});
