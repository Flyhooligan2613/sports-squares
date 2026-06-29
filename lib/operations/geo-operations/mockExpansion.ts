import { MOCK_GEO_OPS_STATES } from "./mockStates";
import type { ExpansionScore } from "./types";

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

export const MOCK_EXPANSION_SCORES: ExpansionScore[] = MOCK_GEO_OPS_STATES.map(
  (state) => {
    const h = hashCode(state.id);
    const waitlistGrowth = state.waitlist
      ? Math.min(100, 30 + (state.waitlist.interestScore ?? 0) / 2)
      : Math.min(100, 10 + (h % 40));
    const referralInterest = Math.min(100, 20 + (state.referralCount % 500) / 5);
    const traffic = Math.min(100, 25 + (state.population / 500_000) + (h % 30));
    const signups = Math.min(100, 15 + (state.registeredPlayers / 1000) + (h % 25));
    const engagement = Math.min(100, 20 + (state.activePlayers / 500) + (h % 20));
    const supportDemand = Math.max(5, 100 - state.supportTickets * 2);
    const revenuePotential = Math.min(
      100,
      30 + state.population / 400_000 + (h % 35),
    );

    const raw =
      waitlistGrowth * 0.2 +
      referralInterest * 0.12 +
      traffic * 0.15 +
      signups * 0.13 +
      engagement * 0.15 +
      supportDemand * 0.05 +
      revenuePotential * 0.2;

    const score = Math.round(Math.min(100, Math.max(0, raw)));
    const trend: ExpansionScore["trend"] =
      score >= 75 ? "up" : score >= 45 ? "stable" : "down";

    return {
      stateId: state.id,
      stateName: state.name,
      score,
      waitlistGrowth: Math.round(waitlistGrowth),
      referralInterest: Math.round(referralInterest),
      traffic: Math.round(traffic),
      signups: Math.round(signups),
      engagement: Math.round(engagement),
      supportDemand: Math.round(supportDemand),
      revenuePotential: Math.round(revenuePotential),
      trend,
    };
  },
).sort((a, b) => b.score - a.score);

export function getTopExpansionStates(limit = 10): ExpansionScore[] {
  return MOCK_EXPANSION_SCORES.slice(0, limit);
}
