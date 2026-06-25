import { Gift } from "lucide-react";
import type { PhoneScreenId } from "@/lib/landing/blackLabelContent";

interface LandingPhoneScreenProps {
  screen: PhoneScreenId;
}

export default function LandingPhoneScreen({ screen }: LandingPhoneScreenProps) {
  switch (screen) {
    case "wallet":
      return <WalletScreen />;
    case "board":
      return <BoardScreen />;
    case "rewards":
      return <RewardsScreen />;
    case "leaderboards":
      return <LeaderboardsScreen />;
    case "profile":
      return <ProfileScreen />;
    default:
      return <WalletScreen />;
  }
}

function WalletScreen() {
  return (
    <div className="landing-mock-screen">
      <p className="landing-mock-kicker">SquareWallet™</p>
      <p className="landing-mock-balance">$248.50</p>
      <p className="landing-mock-sub">Available balance</p>
      <div className="landing-mock-row">
        <span className="landing-mock-pill landing-mock-pill-accent">Add Funds</span>
        <span className="landing-mock-pill">Withdraw</span>
      </div>
      <div className="landing-mock-list">
        <MockListItem title="Contest entry — NFL" amount="-$25.00" />
        <MockListItem title="Quarter win — Chiefs vs Bills" amount="+$125.00" highlight />
        <MockListItem title="Weekly reward" amount="+$10.00" />
      </div>
    </div>
  );
}

function BoardScreen() {
  const cells = Array.from({ length: 25 }, (_, i) => ({
    claimed: i % 4 === 0 || i % 7 === 2,
    highlight: i === 12,
  }));

  return (
    <div className="landing-mock-screen">
      <p className="landing-mock-kicker">Contest Board</p>
      <p className="landing-mock-title">Select Your Square</p>
      <div className="landing-mock-mini-board">
        {cells.map((cell, i) => (
          <span
            key={i}
            className={[
              "landing-mock-cell",
              cell.claimed ? "landing-mock-cell-claimed" : "",
              cell.highlight ? "landing-mock-cell-highlight" : "",
            ].join(" ")}
          />
        ))}
      </div>
      <p className="landing-mock-sub">Tap an open square to claim</p>
    </div>
  );
}

function RewardsScreen() {
  return (
    <div className="landing-mock-screen">
      <p className="landing-mock-kicker">Rewards</p>
      <p className="landing-mock-title">Weekly Reward Drop</p>
      <div className="landing-mock-reward-card">
        <span className="landing-mock-reward-icon">
          <Gift className="w-4 h-4 text-sb-glow" strokeWidth={2} />
        </span>
        <div>
          <strong>+$15 Platform Credit</strong>
          <p>Claim before Sunday midnight</p>
        </div>
      </div>
      <div className="landing-mock-list">
        <MockListItem title="Streak bonus" amount="Active" />
        <MockListItem title="Achievements" amount="12 unlocked" />
      </div>
    </div>
  );
}

function LeaderboardsScreen() {
  return (
    <div className="landing-mock-screen">
      <p className="landing-mock-kicker">Leaderboards</p>
      <p className="landing-mock-title">Season Rankings</p>
      <div className="landing-mock-leaderboard">
        <LeaderRow rank={1} name="Jordan K." score="2,840 XP" />
        <LeaderRow rank={2} name="Alex M." score="2,610 XP" highlight />
        <LeaderRow rank={3} name="Sam R." score="2,455 XP" />
        <LeaderRow rank={4} name="Chris T." score="2,301 XP" />
      </div>
    </div>
  );
}

function ProfileScreen() {
  return (
    <div className="landing-mock-screen">
      <div className="landing-mock-avatar" aria-hidden />
      <p className="landing-mock-title text-center">Competitor_247</p>
      <p className="landing-mock-sub text-center">Gold Tier · 47 contests</p>
      <div className="landing-mock-stats landing-mock-stats-profile">
        <div><strong>18</strong><span>Wins</span></div>
        <div><strong>12</strong><span>Badges</span></div>
        <div><strong>94%</strong><span>Trust</span></div>
      </div>
      <div className="landing-mock-list">
        <MockListItem title="Competition History" amount="View" />
        <MockListItem title="Legacy Profile" amount="Public" />
      </div>
    </div>
  );
}

function MockListItem({
  title,
  amount,
  highlight = false,
}: {
  title: string;
  amount: string;
  highlight?: boolean;
}) {
  return (
    <div className="landing-mock-list-item">
      <span>{title}</span>
      <span className={highlight ? "text-emerald-400" : ""}>{amount}</span>
    </div>
  );
}

function LeaderRow({
  rank,
  name,
  score,
  highlight = false,
}: {
  rank: number;
  name: string;
  score: string;
  highlight?: boolean;
}) {
  return (
    <div className={["landing-mock-leader-row", highlight ? "landing-mock-leader-highlight" : ""].join(" ")}>
      <span className="landing-mock-rank">{rank}</span>
      <span className="landing-mock-name">{name}</span>
      <span className="landing-mock-score">{score}</span>
    </div>
  );
}
