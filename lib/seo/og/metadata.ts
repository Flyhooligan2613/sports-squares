import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";
import { absoluteUrl } from "@/lib/seo/site";

/** Server-rendered share metadata — OG images are colocated via opengraph-image.tsx. */
export function buildShareMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = absoluteUrl(input.path);

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: input.title,
      description: input.description,
      siteName: BRAND_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
    robots: { index: true, follow: true },
  };
}
