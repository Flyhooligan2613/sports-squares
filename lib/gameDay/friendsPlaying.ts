import type { GameDayFriendActivity, HomeFriendsPanel } from "@/lib/gameDay/types";

export interface NewFollowerRow {
  id: string;
  username: string;
  avatarEmoji: string;
  followedAt: string;
}

export function buildHomeFriendsPanel(input: {
  friendsPlayingToday: number;
  playersOnline: number;
  newestFollowers: NewFollowerRow[];
  friendActivity: GameDayFriendActivity[];
}): HomeFriendsPanel {
  return {
    friendsPlayingToday: input.friendsPlayingToday,
    communityOnline: input.playersOnline,
    newestFollowers: input.newestFollowers.map((f) => ({
      id: f.id,
      name: f.username,
      emoji: f.avatarEmoji || "👤",
      at: f.followedAt,
      href: "/huddle",
    })),
    friendHighlights: input.friendActivity,
  };
}
