import type { MetadataRoute } from "next";
import { getPublicProfileSlugs } from "@/lib/seo/sitemapProfiles";
import { profilePath, SITE_URL } from "@/lib/seo/site";

const STATIC_PATHS: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/about", priority: 0.7 },
  { path: "/faq", priority: 0.7 },
  { path: "/responsible-gaming", priority: 0.6 },
  { path: "/terms", priority: 0.5 },
  { path: "/privacy", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, priority }) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
  }));

  const slugs = await getPublicProfileSlugs();
  const profileEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}${profilePath(slug)}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...profileEntries];
}
