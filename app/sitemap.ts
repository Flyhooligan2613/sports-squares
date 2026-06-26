import type { MetadataRoute } from "next";
import { ESPN_SPORT_LIST } from "@/lib/espn/sports";
import { getPublicProfileSlugs } from "@/lib/seo/sitemapProfiles";
import { profilePath, SITE_URL } from "@/lib/seo/site";
import { MERCHANT_DOCUMENT_SECTIONS } from "@/lib/trust/merchantDocuments";
import { TRUST_CENTER_SECTIONS } from "@/lib/trust/trustCenterSections";

const STATIC_PATHS: Array<{ path: string; priority: number; changeFrequency?: MetadataRoute.Sitemap[0]["changeFrequency"] }> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/home", priority: 0.95, changeFrequency: "daily" },
  { path: "/about", priority: 0.7 },
  { path: "/support", priority: 0.65 },
  { path: "/contact", priority: 0.65 },
  { path: "/faq", priority: 0.7 },
  { path: "/transparency", priority: 0.7 },
  { path: "/trust", priority: 0.75, changeFrequency: "monthly" },
  { path: "/trust-center", priority: 0.5, changeFrequency: "monthly" },
  { path: "/responsible-gaming", priority: 0.5 },
  { path: "/terms", priority: 0.4, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.4, changeFrequency: "monthly" },
  { path: "/leaderboards", priority: 0.75, changeFrequency: "daily" },
  { path: "/contest-center", priority: 0.8, changeFrequency: "daily" },
  { path: "/game-day", priority: 0.75, changeFrequency: "daily" },
  { path: "/pickem", priority: 0.8, changeFrequency: "daily" },
  { path: "/survivor", priority: 0.75, changeFrequency: "daily" },
  { path: "/tournament-royale", priority: 0.75, changeFrequency: "daily" },
  { path: "/baseball-pickem", priority: 0.75, changeFrequency: "daily" },
  { path: "/soccer-predictor", priority: 0.75, changeFrequency: "daily" },
  { path: "/wnba-pickem", priority: 0.75, changeFrequency: "daily" },
  { path: "/learn/how-to-play", priority: 0.7 },
  { path: "/share/leaderboard/weekly", priority: 0.65, changeFrequency: "daily" },
  { path: "/share/leaderboard/monthly", priority: 0.65, changeFrequency: "daily" },
  { path: "/share/leaderboard/all-time", priority: 0.65, changeFrequency: "weekly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    ...STATIC_PATHS.map(
      ({ path, priority, changeFrequency = "weekly" }) => ({
        url: `${SITE_URL}${path === "/" ? "" : path}`,
        lastModified,
        changeFrequency,
        priority,
      })
    ),
    ...TRUST_CENTER_SECTIONS.map((section) => ({
      url: `${SITE_URL}${section.route}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
    ...MERCHANT_DOCUMENT_SECTIONS.map((section) => ({
      url: `${SITE_URL}/trust/${section.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
    ...ESPN_SPORT_LIST.map((sport) => ({
      url: `${SITE_URL}/games/${sport.id}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),
  ];

  const slugs = await getPublicProfileSlugs();
  const profileEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}${profilePath(slug)}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...profileEntries];
}
