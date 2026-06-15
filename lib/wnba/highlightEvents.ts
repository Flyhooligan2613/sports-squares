import type { SportEventDefinition } from "@/lib/events/types";

/** WNBA Highlight Squares™ moment definitions — registered with Universal Highlight Engine™. */
export const WNBA_HIGHLIGHT_EVENTS: SportEventDefinition[] = [
  {
    id: "wnba.buzzer_beater",
    sportId: "wnba",
    slug: "buzzer_beater",
    label: "Buzzer Beater",
    description: "A game-winning shot at the buzzer electrifies the arena.",
  },
  {
    id: "wnba.triple_double",
    sportId: "wnba",
    slug: "triple_double",
    label: "Triple Double",
    description: "A player records double digits in points, rebounds, and assists.",
  },
  {
    id: "wnba.thirty_point_game",
    sportId: "wnba",
    slug: "thirty_point_game",
    label: "30+ Point Game",
    description: "A competitor pours in 30 or more points in a single game.",
  },
  {
    id: "wnba.comeback_win",
    sportId: "wnba",
    slug: "comeback_win",
    label: "Comeback Victory",
    description: "A team rallies from a double-digit deficit to win.",
  },
  {
    id: "wnba.overtime_thriller",
    sportId: "wnba",
    slug: "overtime_thriller",
    label: "Overtime Thriller",
    description: "Regulation ends tied — the drama continues in overtime.",
  },
  {
    id: "wnba.block_party",
    sportId: "wnba",
    slug: "block_party",
    label: "Block Party",
    description: "A defensive stand with multiple blocks in a single possession sequence.",
  },
  {
    id: "wnba.assist_masterpiece",
    sportId: "wnba",
    slug: "assist_masterpiece",
    label: "Assist Masterpiece",
    description: "A spectacular pass leads to a highlight-reel finish.",
  },
  {
    id: "wnba.commissioners_cup_moment",
    sportId: "wnba",
    slug: "commissioners_cup_moment",
    label: "Commissioner's Cup Moment",
    description: "A pivotal play during Commissioner's Cup competition.",
  },
];
