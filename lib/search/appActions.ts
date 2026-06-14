import { NAV_SECTIONS } from "@/lib/navigation";
import { PLATFORM_GAMES } from "@/lib/platform/gameTypes";
import type { AppSearchAction } from "@/lib/search/types";

const EXTRA_ACTIONS: AppSearchAction[] = [
  {
    id: "sign-in",
    label: "Sign In",
    subtitle: "Access your boards, picks, and wallet",
    href: "/my-games/login",
    icon: "🔑",
    keywords: ["login", "signin", "account", "auth"],
    group: "Account",
  },
  {
    id: "cash-out",
    label: "Cash Out & Wallet",
    subtitle: "Stripe payouts and winnings",
    href: "/my-games/winnings",
    icon: "💸",
    keywords: ["wallet", "payout", "stripe", "connect", "withdraw", "money"],
    requiresAuth: true,
    group: "Player",
  },
  {
    id: "push-settings",
    label: "Notification Settings",
    subtitle: "Push alerts and daily digest",
    href: "/my-games/profile",
    icon: "🔔",
    keywords: ["push", "notifications", "alerts", "digest"],
    requiresAuth: true,
    group: "Player",
  },
];

function dedupeActions(actions: AppSearchAction[]): AppSearchAction[] {
  const seen = new Set<string>();
  const out: AppSearchAction[] = [];
  for (const action of actions) {
    const key = `${action.href}::${action.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(action);
  }
  return out;
}

export function getAppSearchActions(): AppSearchAction[] {
  const actions: AppSearchAction[] = [];

  for (const game of PLATFORM_GAMES) {
    if (!game.href) continue;
    const nameLower = game.name.toLowerCase();
    actions.push({
      id: `game-${game.id}`,
      label: game.name,
      subtitle: game.description.slice(0, 72),
      href: game.href,
      icon: game.icon,
      keywords: [
        game.id,
        nameLower,
        ...nameLower.split(/\s+/),
        game.id.replace(/-/g, " "),
        "play",
        "game",
      ],
      group: "Games",
    });
  }

  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      actions.push({
        id: `nav-${section.id}-${item.href}`,
        label: item.label,
        href: item.href,
        icon: item.icon,
        keywords: [
          item.label.toLowerCase(),
          section.title.toLowerCase(),
          ...item.label.toLowerCase().split(/\s+/),
        ],
        requiresAuth: item.requiresAuth,
        group: section.title,
      });
    }
  }

  return dedupeActions([...actions, ...EXTRA_ACTIONS]);
}

export function scoreActionMatch(action: AppSearchAction, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return action.group === "Games" ? 2 : 1;

  const label = action.label.toLowerCase();
  if (label === q) return 100;
  if (label.startsWith(q)) return 80;
  if (label.includes(q)) return 60;

  for (const keyword of action.keywords) {
    const kw = keyword.toLowerCase();
    if (kw === q) return 70;
    if (kw.startsWith(q)) return 50;
    if (kw.includes(q)) return 35;
  }

  if (action.subtitle?.toLowerCase().includes(q)) return 25;
  return 0;
}

export function filterAppActions(
  query: string,
  isSignedIn: boolean,
  limit = 8
): AppSearchAction[] {
  const actions = getAppSearchActions().filter(
    (action) => !action.requiresAuth || isSignedIn
  );

  const q = query.trim();
  if (!q) {
    const priority = ["Games", "Main", "Player", "Live & Rankings"];
    return actions
      .sort((a, b) => priority.indexOf(a.group) - priority.indexOf(b.group))
      .slice(0, limit);
  }

  return actions
    .map((action) => ({ action, score: scoreActionMatch(action, q) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ action }) => action);
}
