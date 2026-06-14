import {
  computePriority,
  formatMoney,
  parseAmountCents,
  resolveCategory,
  shouldCelebrate,
} from "@/lib/liveActivity/priority";
import type { LiveActivityEvent, LiveActivityInput } from "@/lib/liveActivity/types";

function defaultEmoji(type: LiveActivityInput["type"], tier?: string): string {
  const t = tier?.toLowerCase() ?? "";
  if (t.includes("diamond")) return "💎";
  if (t.includes("legend") || t.includes("immortal")) return "🎖️";
  switch (type) {
    case "quarter_winner":
    case "game_winner":
      return "🟢";
    case "jackpot":
    case "large_payout":
      return "💰";
    case "square_drop":
      return "🎁";
    case "tier_promotion":
      return "🏆";
    case "achievement":
    case "badge":
      return "⭐";
    case "referral":
    case "follower":
    case "new_user":
      return "👥";
    case "pick_card":
    case "trending_pick":
    case "pickem_streak":
      return "🎯";
    case "survivor_shield":
      return "🛡️";
    case "board_filled":
    case "new_board":
    case "game_starting":
    case "game_live":
      return "🏈";
    case "players_online":
      return "🔥";
    case "paid_today":
    case "payouts_processed":
      return "💵";
    default:
      return "✨";
  }
}

function defaultMessage(input: LiveActivityInput): string {
  const user = input.username ?? "A player";
  const money = formatMoney(input.amount);
  const tier = input.tier ?? input.reward;

  switch (input.type) {
    case "quarter_winner":
      return `${user} won ${money ?? "a quarter"} on ${input.game ?? "a live board"}`;
    case "game_winner":
    case "jackpot":
    case "large_payout":
      return `${user} won ${money ?? "big"} on ${input.game ?? "a live board"}`;
    case "square_drop":
      return `${user} opened a ${tier ?? "Mystery"} Drop`;
    case "tier_promotion":
      return `${user} unlocked ${tier ?? "a new tier"}`;
    case "achievement":
    case "badge":
      return `${user} reached ${tier ?? "a new milestone"}`;
    case "referral":
      return `${user} hit a referral milestone`;
    case "follower":
      return `${user} gained new followers on The Huddle`;
    case "pick_card":
      return `${user} published a Pick Card`;
    case "trending_pick":
      return `${user}'s picks are trending on The Huddle`;
    case "new_user":
      return `Welcome ${user} to SquareBoards`;
    case "new_board":
      return `Board #${input.boardIndex ?? "—"} just opened`;
    case "board_filled":
      return `Board #${input.boardIndex ?? "—"} just filled`;
    case "game_starting":
      return `${input.game ?? "A game"} kicks off soon`;
    case "squares_remaining":
      return `Squares still open on ${input.game ?? "live boards"}`;
    case "players_online":
      return `${input.amount ?? "1,000+"} players online`;
    case "paid_today":
      return `${money ?? "$0"} paid out today`;
    case "open_boards":
      return `${input.amount ?? "0"} open boards right now`;
    case "squares_sold":
      return `${input.amount ?? "0"} squares sold today`;
    case "payouts_processed":
      return `${input.amount ?? "0"} payouts processed today`;
    case "game_live":
      return `${input.game ?? "A matchup"} is live now`;
    case "pickem_streak":
      return `${user} hit ${input.amount ?? "6"} straight Pick'em wins`;
    case "survivor_shield":
      return input.message ?? `${user}'s Survivor Shield activated!`;
    case "xp":
      return `${user} earned ${tier ?? "XP"} rewards`;
    default:
      return input.message ?? "Something exciting just happened on SquareBoards";
  }
}

export function buildLiveActivityEvent(
  input: LiveActivityInput,
  id?: string
): LiveActivityEvent {
  const type = input.type;
  const category = input.category ?? resolveCategory(type);
  const amountCents = parseAmountCents(input.amount, input.amountCents);
  const isCelebration = shouldCelebrate({
    type,
    amountCents,
    tier: input.tier,
    isCelebration: input.isCelebration,
  });
  const priority = computePriority(type, {
    amountCents,
    tier: input.tier,
    priority: input.priority,
    isCelebration,
  });
  const emoji = input.emoji ?? defaultEmoji(type, input.tier);
  const message =
    input.message ??
    (input.personalized
      ? personalizeMessage({ ...input, emoji })
      : defaultMessage(input));

  const money = formatMoney(input.amount);
  const celebration =
    input.celebration ??
    (isCelebration
      ? {
          headline: input.type === "square_drop" ? "💎 BIG DROP" : "🏆 BIG WIN",
          title: input.username ?? "A player",
          amount: money,
          subtitle: input.game ?? input.tier ?? input.reward,
        }
      : undefined);

  return {
    id: id ?? `la-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    category,
    emoji,
    message,
    priority,
    isCelebration,
    celebration,
    personalized: Boolean(input.personalized),
    createdAt: new Date().toISOString(),
  };
}

function personalizeMessage(input: LiveActivityInput & { emoji: string }): string {
  const tier = input.tier ?? input.reward;
  const money = formatMoney(input.amount);

  switch (input.type) {
    case "square_drop":
      return `You unlocked ${tier ?? "a"} Drop`;
    case "quarter_winner":
      return `You won ${input.game ? `${input.game}` : "a quarter"}`;
    case "tier_promotion":
    case "achievement":
    case "badge":
      return `You reached ${tier ?? "a new tier"}`;
    case "large_payout":
    case "game_winner":
    case "jackpot":
      return `You earned ${money ?? "a payout"}`;
    default:
      return input.message ?? defaultMessage(input);
  }
}
