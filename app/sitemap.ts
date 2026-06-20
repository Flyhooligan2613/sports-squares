import type { MetadataRoute } from "next";
import { getPublicProfileSlugs } from "@/lib/seo/sitemapProfiles";
import { profilePath, SITE_URL } from "@/lib/seo/site";

const STATIC_PATHS: Array<{ path: string; priority: number; changeFrequency?: MetadataRoute.Sitemap[0]["changeFrequency"] }> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/home", priority: 0.95, changeFrequency: "daily" },
  { path: "/faq", priority: 0.7 },
  { path: "/transparency", priority: 0.7 },
  { path: "/responsible-gaming", priority: 0.6 },
  { path: "/terms", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.5, changeFrequency: "monthly" },
  { path: "/leaderboards", priority: 0.75, changeFrequency: "daily" },
  { path: "/contest-center", priority: 0.8, changeFrequency: "daily" },
  { path: "/share/leaderboard/weekly", priority: 0.65, changeFrequency: "daily" },
  { path: "/share/leaderboard/monthly", priority: 0.65, changeFrequency: "daily" },
  { path: "/share/leaderboard/all-time", priority: 0.65, changeFrequency: "weekly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(
    ({ path, priority, changeFrequency = "weekly" }) => ({
      url: `${SITE_URL}${path === "/" ? "" : path}`,
      lastModified,
      changeFrequency,
      priority,
    })
  );

  const slugs = await getPublicProfileSlugs();
  const profileEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}${profilePath(slug)}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...profileEntries];
}
