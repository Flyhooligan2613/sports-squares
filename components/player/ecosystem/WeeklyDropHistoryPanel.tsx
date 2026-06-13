"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import WeeklyRewardDropExperience from "@/components/player/ecosystem/WeeklyRewardDropExperience";
import type { DropBoxType, WeeklyDropRecord } from "@/lib/platform/ecosystem/weeklyRewardDropTypes";
import { BOX_VISUALS, RARITY_COLORS } from "@/lib/platform/ecosystem/weeklyRewardDropTypes";

export default function WeeklyDropHistoryPanel() {
  const [history, setHistory] = useState<WeeklyDropRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [replay, setReplay] = useState<{ boxType: DropBoxType; rewards: WeeklyDropRecord["rewards"] } | null>(null);

  useEffect(() => {
    void fetch("/api/ecosystem/weekly-drop", { credentials: "include" })
      .then((res) => res.json())
      .then((json: { history?: WeeklyDropRecord[] }) => setHistory(json.history ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LandingGlassCard className="p-5 text-sm text-sb-muted animate-pulse">Loading drop history…</LandingGlassCard>;
  }

  return (
    <>
      <LandingGlassCard className="p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Reward Drop History</h3>
        {!history.length ? (
          <p className="text-sm text-sb-muted">Your weekly drops are saved forever — open your first drop to get started.</p>
        ) : (
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {history.map((drop) => {
              const box = BOX_VISUALS[drop.boxType];
              return (
                <li key={drop.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap justify-between gap-2 mb-2">
                    <div>
                      <p className="text-white font-medium">
                        {box.emoji} {box.label}
                      </p>
                      <p className="text-xs text-sb-muted">
                        {drop.openedAt ? new Date(drop.openedAt).toLocaleDateString() : "—"} · Week {drop.weekKey}
                      </p>
                    </div>
                    <p className="text-sm text-sb-purple-light font-semibold">
                      ${(drop.totalValueCents / 100).toFixed(0)} value
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {drop.rewards.map((r) => (
                      <span
                        key={r.id}
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${RARITY_COLORS[r.rarity].text}`}
                        style={{ borderColor: RARITY_COLORS[r.rarity].border }}
                      >
                        {r.icon} {r.label}
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setReplay({ boxType: drop.boxType, rewards: drop.rewards })}
                  >
                    Replay animation
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </LandingGlassCard>

      {replay ? (
        <WeeklyRewardDropExperience
          open
          boxType={replay.boxType}
          replayRewards={replay.rewards}
          replayOnly
          onClose={() => setReplay(null)}
          onOpened={() => undefined}
        />
      ) : null}
    </>
  );
}
