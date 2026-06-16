"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { GENESIS_MISSIONS } from "@/lib/platform/engines/genesis";
import { useGenesis } from "@/components/genesis/GenesisProvider";

export default function MissionCenterPanel() {
  const { progress, loading } = useGenesis();

  if (loading || !progress?.rookieSeason.active) return null;

  const completed = new Set(
    progress.missions.filter((m) => m.status === "completed").map((m) => m.missionId)
  );

  return (
    <section id="genesis-missions" className="scroll-mt-24">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
        Mission Center
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {GENESIS_MISSIONS.map((def, index) => {
          const row = progress.missions.find((m) => m.missionId === def.id);
          const done = row?.status === "completed" || completed.has(def.id);
          const locked = def.unlockAfter?.some((id) => !completed.has(id));

          return (
            <LandingGlassCard
              key={def.id}
              className={[
                "p-4 admin-stat-enter",
                done ? "border-emerald-500/30" : locked ? "opacity-60" : "",
              ].join(" ")}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden>
                  {def.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{def.title}</p>
                  <p className="text-xs text-sb-muted mt-0.5">{def.description}</p>
                  <p className="text-[10px] text-sb-glow mt-2">
                    {def.rewards.map((r) => r.label).join(" · ")}
                  </p>
                </div>
                {done ? (
                  <span className="text-emerald-400 text-sm shrink-0" aria-label="Completed">
                    ✓
                  </span>
                ) : locked ? (
                  <span className="text-xs text-sb-muted shrink-0">Locked</span>
                ) : null}
              </div>
            </LandingGlassCard>
          );
        })}
      </div>
    </section>
  );
}
