/**
 * Branded module names — consistent ™ usage where established.
 * Platform Polish Sprint #002 — Contest Language Engine™
 */

export const BRANDED_MODULES = {
  sportsSquares: "Sports Squares™",
  pickemRoyale: "Pick'em Royale™",
  wnbaPickemRoyale: "WNBA Pick'em Royale™",
  womensSportsHub: "Women's Sports Hub™",
  survivorX: "Survivor X™",
  tournamentRoyale: "Tournament Royale™",
  rewards: "Rewards™",
  marketplace: "Marketplace™",
  legacy: "Legacy™",
  hallOfFame: "Hall of Fame™",
  theHuddle: "The Huddle™",
  home: "Home™",
  contestCenter: "Contest Center™",
} as const;

export type BrandedModuleKey = keyof typeof BRANDED_MODULES;
