/** @type {import('next-sitemap').IConfig} */
const siteUrl = (process.env.SITE_URL ?? "https://www.squareboards.pro").replace(/\/$/, "");

const STATIC_PATHS = [
  "/",
  "/about",
  "/trust",
  "/support",
  "/contact",
  "/faq",
  "/responsible-gaming",
  "/terms",
  "/privacy",
  "/transparency",
  "/contest-center",
];

const TRUST_SLUGS = [
  "terms-of-service",
  "privacy-policy",
  "refund-policy",
  "cookie-policy",
  "official-contest-rules",
  "responsible-competition",
  "fair-play-policy",
  "identity-verification",
  "fraud-prevention",
  "security",
  "community-guidelines",
  "contact-support",
];

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
  exclude: [
    "/admin/*",
    "/api/*",
    "/my-games/*",
    "/test-supabase",
    "/offline",
    "/connect-sample/*",
  ],
  additionalPaths: async (config) => {
    const { getPublicProfileSlugs } = await import("./lib/seo/sitemapProfiles.mjs");

    const staticEntries = STATIC_PATHS.map((path) => ({
      loc: path,
      changefreq: "weekly",
      priority: path === "/" ? 1.0 : 0.7,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }));

    const trustEntries = TRUST_SLUGS.map((slug) => ({
      loc: `/trust/${slug}`,
      changefreq: "monthly",
      priority: 0.6,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }));

    const slugs = await getPublicProfileSlugs();
    const profileEntries = slugs.map((slug) => ({
      loc: `/profile/${encodeURIComponent(slug)}`,
      changefreq: "weekly",
      priority: 0.6,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }));

    return [...staticEntries, ...trustEntries, ...profileEntries];
  },
};
