export interface AppSearchAction {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  icon: string;
  keywords: string[];
  requiresAuth?: boolean;
  group: string;
}

export interface PlayerSearchResult {
  slug: string;
  displayName: string;
  username: string | null;
  playerId: string | null;
  avatarEmoji: string;
  followerCount: number;
}

export type GlobalSearchItem =
  | { kind: "action"; action: AppSearchAction }
  | { kind: "player"; player: PlayerSearchResult };
