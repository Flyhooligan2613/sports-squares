"use client";

import HighlightSquareIntroPopup from "@/components/highlight/HighlightSquareIntroPopup";
import { learnHowToPlayHref } from "@/lib/highlight/learnLinks";
import type { EspnSport } from "@/lib/types";

export default function SportGamesIntro({ sport }: { sport: EspnSport }) {
  return <HighlightSquareIntroPopup learnHref={learnHowToPlayHref(sport)} />;
}
