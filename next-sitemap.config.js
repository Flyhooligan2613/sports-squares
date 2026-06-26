/** @type {import('next-sitemap').IConfig} */
const siteUrl = (process.env.SITE_URL ?? "https://www.squareboards.pro").replace(/\/$/, "");

const STATIC_PATHS = [
  "/",
  "/home",
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
  "/leaderboards",
  "/game-day",
  "/pickem",
  "/survivor",
  "/tournament-royale",
  "/baseball-pickem",
  "/soccer-predictor",
  "/wnba-pickem",
  "/learn/how-to-play",
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
  "merchant-executive-summary",
  "company-overview",
  "business-model",
  "compliance-risk-management",
];

const MARKETPLACE_SPORT_SLUGS = ["nfl", "ncaaf", "nba", "ncaab", "mlb", "wnba"];

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

    const sportGameEntries = MARKETPLACE_SPORT_SLUGS.map((sport) => ({
      loc: `/games/${sport}`,
      changefreq: "daily",
      priority: 0.85,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }));

    const slugs = await getPublicProfileSlugs();
    const profileEntries = slugs.map((slug) => ({
      loc: `/profile/${encodeURIComponent(slug)}`,
      changefreq: "weekly",
      priority: 0.6,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }));

    return [...staticEntries, ...trustEntries, ...sportGameEntries, ...profileEntries];
  },
};
