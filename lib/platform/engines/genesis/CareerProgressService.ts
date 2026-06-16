import { GENESIS_MISSIONS } from "@/lib/platform/engines/genesis/config";
import type { GenesisCareerProgress, GenesisMissionProgress } from "@/lib/platform/engines/genesis/types";

export function computeCareerProgress(missions: GenesisMissionProgress[]): GenesisCareerProgress {
  const completed = missions.filter((m) => m.status === "completed");
  const xpEarned = completed.reduce((sum, m) => sum + m.xpAwarded, 0);
  const xpTotal = GENESIS_MISSIONS.reduce((sum, def) => sum + def.xpReward, 0);
  const missionsCompleted = completed.length;
  const missionsTotal = GENESIS_MISSIONS.length;
  const progressPct = missionsTotal
    ? Math.round((missionsCompleted / missionsTotal) * 100)
    : 0;

  const nextPending = GENESIS_MISSIONS.find(
    (def) => !completed.some((c) => c.missionId === def.id)
  );

  let rankTitle = "Rookie Competitor";
  if (progressPct >= 100) rankTitle = "Rookie Graduate";
  else if (progressPct >= 75) rankTitle = "Rising Rookie";
  else if (progressPct >= 50) rankTitle = "Active Rookie";
  else if (progressPct >= 25) rankTitle = "Exploring Rookie";

  return {
    rankTitle,
    progressPct,
    nextGoal: nextPending?.title ?? "Rookie Season complete — keep competing!",
    missionsCompleted,
    missionsTotal,
    xpEarned,
    xpTotal,
  };
}
