import type { HuddleFeedItem, HuddleFeedSort } from "@/lib/huddle/types";
import { getHuddleFeed as getPickemFeed } from "@/lib/huddle/pickPosts";
import { listSurvivorHuddlePosts } from "@/lib/huddle/survivorPosts";

export async function getUnifiedHuddleFeed(input: {
  sort?: HuddleFeedSort;
  viewerEmail?: string | null;
  limit?: number;
}): Promise<{
  items: HuddleFeedItem[];
  pickOfWeek: Awaited<ReturnType<typeof getPickemFeed>>["pickOfWeek"];
}> {
  const limit = input.limit ?? 30;

  const [pickemFeed, survivorPosts] = await Promise.all([
    getPickemFeed({ ...input, limit }),
    listSurvivorHuddlePosts({ ...input, limit }),
  ]);

  const items: HuddleFeedItem[] = [
    ...pickemFeed.posts.map((post) => ({
      kind: "pickem" as const,
      post,
      publishedAt: post.publishedAt,
    })),
    ...survivorPosts.map((post) => ({
      kind: "survivor" as const,
      post,
      publishedAt: post.publishedAt,
    })),
  ];

  items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  if (input.sort === "most_liked" || input.sort === "trending") {
    items.sort((a, b) => {
      const likesA = a.kind === "pickem" ? a.post.likeCount : a.post.likeCount;
      const likesB = b.kind === "pickem" ? b.post.likeCount : b.post.likeCount;
      if (likesB !== likesA) return likesB - likesA;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }

  if (input.sort === "most_copied") {
    items.sort((a, b) => {
      const copiesA = a.kind === "pickem" ? a.post.copyCount : 0;
      const copiesB = b.kind === "pickem" ? b.post.copyCount : 0;
      if (copiesB !== copiesA) return copiesB - copiesA;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }

  return {
    items: items.slice(0, limit),
    pickOfWeek: pickemFeed.pickOfWeek,
  };
}
