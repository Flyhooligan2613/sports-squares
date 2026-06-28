import type { StateMapPath } from "./types";

/** Rounded-rect path for schematic US map — lightweight, 60fps-friendly */
function boxPath(x: number, y: number, w: number, h: number, r = 2.5): string {
  return [
    `M${x + r},${y}`,
    `H${x + w - r}`,
    `Q${x + w},${y} ${x + w},${y + r}`,
    `V${y + h - r}`,
    `Q${x + w},${y + h} ${x + w - r},${y + h}`,
    `H${x + r}`,
    `Q${x},${y + h} ${x},${y + h - r}`,
    `V${y + r}`,
    `Q${x},${y} ${x + r},${y}`,
    "Z",
  ].join(" ");
}

type Box = [number, number, number, number];

const LAYOUT: Record<string, Box> = {
  AK: [80, 480, 95, 70],
  HI: [280, 520, 50, 30],
  WA: [120, 60, 55, 45],
  OR: [115, 110, 55, 50],
  CA: [90, 165, 55, 120],
  NV: [145, 165, 45, 85],
  ID: [165, 95, 50, 95],
  MT: [210, 55, 75, 55],
  WY: [215, 115, 70, 55],
  UT: [175, 195, 45, 55],
  AZ: [165, 255, 55, 65],
  CO: [225, 195, 55, 55],
  NM: [205, 255, 55, 60],
  ND: [340, 55, 55, 45],
  SD: [340, 105, 55, 45],
  NE: [340, 155, 70, 45],
  KS: [340, 205, 70, 45],
  OK: [340, 255, 70, 45],
  TX: [305, 305, 95, 95],
  MN: [395, 55, 55, 65],
  IA: [395, 130, 55, 45],
  MO: [395, 180, 55, 55],
  AR: [395, 240, 55, 45],
  LA: [395, 290, 55, 45],
  WI: [430, 85, 45, 55],
  IL: [430, 145, 40, 70],
  MS: [430, 220, 40, 70],
  MI: [475, 75, 45, 75],
  IN: [475, 155, 35, 55],
  AL: [475, 215, 40, 55],
  OH: [515, 145, 40, 55],
  TN: [475, 175, 55, 40],
  KY: [510, 175, 40, 35],
  WV: [545, 165, 30, 40],
  GA: [515, 220, 45, 55],
  FL: [520, 280, 55, 85],
  SC: [545, 215, 35, 40],
  NC: [545, 175, 45, 40],
  VA: [555, 155, 40, 35],
  PA: [555, 125, 45, 35],
  NY: [575, 95, 45, 45],
  VT: [595, 75, 20, 35],
  NH: [615, 75, 20, 35],
  ME: [635, 55, 35, 55],
  MA: [615, 105, 25, 20],
  RI: [635, 110, 12, 12],
  CT: [615, 125, 18, 15],
  NJ: [585, 135, 18, 25],
  DE: [575, 155, 12, 15],
  MD: [565, 155, 18, 20],
  DC: [568, 175, 8, 8],
};

const NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

export const US_MAP_VIEWBOX = "0 0 680 560";

export const US_MAP_PATHS: StateMapPath[] = Object.entries(LAYOUT).map(
  ([id, [x, y, w, h]]) => ({
    id,
    name: NAMES[id] ?? id,
    path: boxPath(x, y, w, h),
    labelX: x + w / 2,
    labelY: y + h / 2,
  }),
);

export function getStatePath(id: string): StateMapPath | undefined {
  return US_MAP_PATHS.find((s) => s.id === id);
}
