"use client";

import type { TournamentLiveMap } from "@/lib/tournamentRoyale/types";

interface Props {
  liveMap: TournamentLiveMap;
}

export default function TournamentRoyaleLiveMap({ liveMap }: Props) {
  return (
    <div className="tr-live-map">
      <div className="tr-live-map-header">
        <p className="text-xs uppercase tracking-wider text-blue-400/90 font-bold">Live Tournament Map</p>
        <p className="text-sm text-sb-muted mt-1">The bracket ecosystem — updated as games finish.</p>
      </div>

      <div className="tr-live-map-grid">
        <div className="tr-live-stat">
          <span className="tr-live-stat-value">{liveMap.remainingPerfectBrackets}</span>
          <span className="tr-live-stat-label">Perfect Brackets</span>
        </div>
        <div className="tr-live-stat">
          <span className="tr-live-stat-value">{liveMap.communityAccuracyPct}%</span>
          <span className="tr-live-stat-label">Community Accuracy</span>
        </div>
        <div className="tr-live-stat">
          <span className="tr-live-stat-value">{liveMap.playersActive}</span>
          <span className="tr-live-stat-label">Players Active</span>
        </div>
      </div>

      {liveMap.topPlayers.length > 0 && (
        <div className="tr-live-leaders">
          <p className="text-xs font-bold text-white mb-2">Top Players</p>
          <ul className="space-y-1">
            {liveMap.topPlayers.slice(0, 3).map((p, i) => (
              <li key={p.name} className="flex justify-between text-sm">
                <span className="text-sb-muted">
                  {i + 1}. {p.name}
                </span>
                <span className="text-blue-300 font-semibold">{p.points} pts</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {liveMap.trendingGames.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold text-white mb-2">Trending Games</p>
          <ul className="space-y-1">
            {liveMap.trendingGames.map((game) => (
              <li key={game} className="text-sm text-sb-muted">
                {game}
              </li>
            ))}
          </ul>
        </div>
      )}

      {liveMap.biggestUpset && (
        <p className="tr-live-upset mt-4">
          Biggest Upset: <strong>{liveMap.biggestUpset}</strong>
        </p>
      )}
    </div>
  );
}
