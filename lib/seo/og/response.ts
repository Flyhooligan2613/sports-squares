import type { ReactElement } from "react";
import { ImageResponse } from "next/og";
import { OG_SIZE } from "./types";
import { OG_REVALIDATE } from "./design";
import { loadOgFonts } from "./fonts";
import { renderNotFoundCard } from "./cards";

export { OG_SIZE, OG_REVALIDATE };

export async function createOgImageResponse(element: ReactElement) {
  const fonts = await loadOgFonts();
  return new ImageResponse(element, { ...OG_SIZE, fonts });
}

export async function createNotFoundOgImage(message = "Not found") {
  return createOgImageResponse(renderNotFoundCard(message) as ReactElement);
}

/** Standard exports for colocated opengraph-image.tsx routes. */
export const ogImageConfig = {
  runtime: "nodejs" as const,
  alt: "SquareBoards",
  size: OG_SIZE,
  contentType: "image/png" as const,
  revalidate: OG_REVALIDATE,
};
