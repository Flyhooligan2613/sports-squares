import { GENESIS_DAILY_MOTIVATION } from "@/lib/platform/engines/genesis/config";

function hashEmailDay(email: string, date = new Date()): number {
  const key = `${email.toLowerCase()}:${date.toISOString().slice(0, 10)}`;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getDailyMotivation(email: string, date = new Date()): string {
  const index = hashEmailDay(email, date) % GENESIS_DAILY_MOTIVATION.length;
  return GENESIS_DAILY_MOTIVATION[index] ?? GENESIS_DAILY_MOTIVATION[0];
}
