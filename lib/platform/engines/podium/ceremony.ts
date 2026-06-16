import type {
  PodiumCeremony,
  PodiumCeremonyTemplate,
  PodiumContestKind,
  PodiumResolution,
} from "@/lib/platform/engines/podium/types";

function formatPlacementLine(
  template: string,
  player: string,
  contest: string
): string {
  return template.replace("{player}", player).replace("{contest}", contest);
}

/**
 * Podium Ceremony™ — config-driven celebration copy for platform events.
 */
export function buildPodiumCeremony(input: {
  contestKind: PodiumContestKind;
  contestId: string;
  label: string;
  resolution: PodiumResolution;
  templates: PodiumCeremonyTemplate;
  metadata?: Record<string, unknown>;
}): PodiumCeremony {
  const headline = input.templates.headline.replace("{contest}", input.label);

  const placementLines = input.resolution.placements.map((p) => {
    const key =
      p.placement === 1 ? "first" : p.placement === 2 ? "second" : "third";
    return formatPlacementLine(input.templates[key], p.email, input.label);
  });

  const nearPerfectLines = input.resolution.nearPerfect.map((n) =>
    formatPlacementLine(input.templates.nearPerfect, n.email, input.label)
  );

  const summary = [...placementLines, ...nearPerfectLines].join(" ");

  return {
    templateKey: "podium_ceremony",
    headline,
    summary,
    placements: input.resolution.placements,
    nearPerfect: input.resolution.nearPerfect,
    contestKind: input.contestKind,
    contestId: input.contestId,
    label: input.label,
    metadata: input.metadata ?? {},
  };
}
