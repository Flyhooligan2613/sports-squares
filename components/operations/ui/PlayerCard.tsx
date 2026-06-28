import type { OpsPlayer } from "@/lib/operations/types";

interface PlayerCardProps {
  player: OpsPlayer;
  className?: string;
}

const STATUS_CLASS: Record<OpsPlayer["status"], string> = {
  active: "ops-badge-success",
  restricted: "ops-badge-warning",
  pending: "ops-badge-muted",
};

export default function PlayerCard({ player, className = "" }: PlayerCardProps) {
  return (
    <article className={`ops-glass-card ops-player-card ${className}`}>
      <div className="ops-player-card-header">
        <div className="ops-player-avatar" aria-hidden="true">
          {player.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="ops-player-info">
          <h4 className="ops-player-name">{player.username}</h4>
          <p className="ops-player-meta">
            {player.tier} · {player.region}
          </p>
        </div>
        <span className={`ops-badge ${STATUS_CLASS[player.status]}`}>
          {player.status}
        </span>
      </div>
      <div className="ops-player-card-footer">
        <span className="ops-player-balance">{player.balance}</span>
        <span className="ops-player-active">{player.lastActive}</span>
      </div>
    </article>
  );
}
