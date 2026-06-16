import type {
  PodiumContestResult,
  PodiumOutcome,
} from "@/lib/platform/engines/podium/types";
import { orchestratePodium } from "@/lib/platform/engines/podium/orchestrator";

/** Ensure built-in adapters are registered on first import. */
import "@/lib/platform/engines/podium/adapters";

/**
 * PodiumEngine™ — Core Platform Engine for ranked competition finishes.
 * Any contest registers an adapter; orchestration handles payouts, ceremony, and rewards.
 */
class PodiumEngineService {
  async process(input: PodiumContestResult): Promise<PodiumOutcome> {
    return orchestratePodium({ contestResult: input });
  }
}

export const PodiumEngine = new PodiumEngineService();

/** Directive alias for contest resolution sites. */
export const processContestPodium = (
  input: PodiumContestResult
): Promise<PodiumOutcome> => PodiumEngine.process(input);
