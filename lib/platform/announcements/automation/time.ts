import { PICKEM_EASTERN_TZ } from "@/lib/pickem/config";

export function getEasternDateParts(date: Date): {
  weekday: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: PICKEM_EASTERN_TZ,
    weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number.parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10);

  return {
    weekday: parts.find((p) => p.type === "weekday")?.value ?? "",
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

export function kickoffWeekdayEastern(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PICKEM_EASTERN_TZ,
    weekday: "long",
  }).format(new Date(iso));
}

export function easternDayBounds(
  year: number,
  month: number,
  day: number
): { start: Date; end: Date } {
  // Approximate ET midnight using offset — sufficient for announcement windows.
  const start = new Date(Date.UTC(year, month - 1, day, 5, 0, 0));
  const end = new Date(Date.UTC(year, month - 1, day + 1, 4, 59, 59));
  return { start, end };
}

export function isThanksgivingET(year: number, month: number, day: number): boolean {
  if (month !== 11) return false;
  const date = new Date(year, month - 1, day);
  if (date.getDay() !== 4) return false;
  return day >= 22 && day <= 28;
}

export function isChristmasET(month: number, day: number): boolean {
  return month === 12 && day === 25;
}

export function isNewYearsET(month: number, day: number): boolean {
  return month === 1 && day === 1;
}
