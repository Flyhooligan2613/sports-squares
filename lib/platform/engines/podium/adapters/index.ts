import { registerPodiumAdapter } from "@/lib/platform/engines/podium/registry";
import { pickemSeasonAdapter, pickemWeeklyAdapter } from "@/lib/platform/engines/podium/adapters/pickem";
import { tournamentRoyaleAdapter } from "@/lib/platform/engines/podium/adapters/tournamentRoyale";
import { survivorAdapter } from "@/lib/platform/engines/podium/adapters/survivor";
import { bracketsAdapter } from "@/lib/platform/engines/podium/adapters/brackets";

registerPodiumAdapter(pickemWeeklyAdapter);
registerPodiumAdapter(pickemSeasonAdapter);
registerPodiumAdapter(tournamentRoyaleAdapter);
registerPodiumAdapter(survivorAdapter);
registerPodiumAdapter(bracketsAdapter);
