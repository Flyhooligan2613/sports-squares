import { buildLiveActivityEvent } from "@/lib/liveActivity/buildEvent";
import type { LiveActivityEvent, LiveActivityInput } from "@/lib/liveActivity/types";

export function createMockLiveActivitySeed(): LiveActivityEvent[] {
  const inputs: LiveActivityInput[] = [
    {
      type: "quarter_winner",
      username: "Mike",
      amount: 250,
      game: "Chiefs vs Bills",
    },
    {
      type: "tier_promotion",
      username: "Sarah",
      tier: "Gold Tier",
    },
    {
      type: "square_drop",
      username: "James",
      tier: "Diamond Drop",
      isCelebration: true,
    },
    {
      type: "players_online",
      amount: "1,284",
    },
    {
      type: "paid_today",
      amount: 42615,
    },
    {
      type: "board_filled",
      boardIndex: 412,
    },
    {
      type: "achievement",
      username: "Ashley",
      tier: "Contender",
    },
    {
      type: "new_user",
      username: "14 players joined this minute",
      message: "👥 14 players joined this minute",
      emoji: "👥",
    },
    {
      type: "pickem_streak",
      username: "Chris",
      amount: "6",
    },
    {
      type: "payouts_processed",
      amount: "28",
    },
    {
      type: "badge",
      username: "Legend Badge unlocked",
      message: "🎖️ Legend Badge unlocked",
      tier: "Legend",
      isCelebration: true,
    },
    {
      type: "game_live",
      game: "Chiefs vs Bills",
    },
    {
      type: "new_user",
      username: "Isaiah",
    },
    {
      type: "square_drop",
      username: "Diamond Drop claimed",
      message: "💎 Diamond Drop claimed",
      tier: "Diamond",
    },
    {
      type: "quarter_winner",
      username: "Mike",
      amount: 250,
      game: "Cowboys vs Eagles",
    },
    {
      type: "referral",
      username: "Taylor",
      priority: 80,
    },
    {
      type: "open_boards",
      amount: "186",
    },
    {
      type: "squares_sold",
      amount: "3,412",
    },
    {
      type: "jackpot",
      username: "Mike",
      amount: 2500,
      game: "Cowboys vs Eagles",
      isCelebration: true,
    },
  ];

  return inputs.map((input, index) =>
    buildLiveActivityEvent(input, `mock-seed-${index}`)
  );
}

export function createRandomMockLiveActivity(): LiveActivityEvent {
  const extras: LiveActivityInput[] = [
    { type: "board_filled", boardIndex: 300 + Math.floor(Math.random() * 200) },
    { type: "players_online", amount: String(900 + Math.floor(Math.random() * 600)) },
    { type: "game_starting", game: "Sunday Night Football" },
    { type: "trending_pick", username: "Jordan" },
    { type: "follower", username: "Riley" },
    { type: "xp", username: "Casey", tier: "250 XP" },
  ];
  const pick = extras[Math.floor(Math.random() * extras.length)]!;
  return buildLiveActivityEvent(pick);
}
