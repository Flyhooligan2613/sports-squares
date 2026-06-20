import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";

/** Canonical production origin — override via SITE_URL for previews/staging. */
export const SITE_URL =
  process.env.SITE_URL?.replace(/\/$/, "") ?? "https://www.squareboards.pro";

/** Facebook App ID for `fb:app_id` — optional; set FACEBOOK_APP_ID or NEXT_PUBLIC_FACEBOOK_APP_ID. */
export function getFacebookAppId(): string | undefined {
  const id =
    process.env.FACEBOOK_APP_ID?.trim() ||
    process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim();
  return id || undefined;
}

export const SITE_DESCRIPTION =
  "Premium Multi-Game Competitive Sports Platform";

export const SITE_TAGLINE = "Compete • Build Your Legacy • Win Rewards";

/** Public OG asset — must stay reachable at `${SITE_URL}/og-image.png` for link previews. */
export const DEFAULT_OG_IMAGE_PATH = "/og-image.png";

export const DEFAULT_OG_IMAGE = {
  url: DEFAULT_OG_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: `${BRAND_NAME} — ${SITE_TAGLINE}`,
  type: "image/png",
} as const;

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function profilePath(username: string): string {
  return `/profile/${encodeURIComponent(username)}`;
}

export function profileUrl(username: string): string {
  return absoluteUrl(profilePath(username));
}

/** Root layout metadata defaults — extend per-route via generateMetadata. */
export function buildRootMetadata(): Metadata {
  const canonical = SITE_URL;
  const facebookAppId = getFacebookAppId();

  return {
    metadataBase: new URL(canonical),
    title: {
      default: BRAND_NAME,
      template: `%s | ${BRAND_NAME}`,
    },
    description: `${SITE_DESCRIPTION}. ${SITE_TAGLINE}`,
    applicationName: BRAND_NAME,
    keywords: [
      "SquareBoards",
      "competitive sports platform",
      "sports pickem",
      "sports squares",
      "contests",
      "leaderboards",
      "achievements",
    ],
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      siteName: BRAND_NAME,
      title: BRAND_NAME,
      description: `${SITE_DESCRIPTION} ${SITE_TAGLINE}`,
      images: [
        {
          url: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
          width: DEFAULT_OG_IMAGE.width,
          height: DEFAULT_OG_IMAGE.height,
          alt: DEFAULT_OG_IMAGE.alt,
          type: DEFAULT_OG_IMAGE.type,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: BRAND_NAME,
      description: `${SITE_DESCRIPTION} ${SITE_TAGLINE}`,
      images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icons/icon.svg", type: "image/svg+xml" },
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: BRAND_NAME,
    },
    ...(facebookAppId ? { facebook: { appId: facebookAppId } } : {}),
  };
}
