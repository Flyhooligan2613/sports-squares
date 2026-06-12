import type { AnnouncementUpsertInput } from "@/lib/platform/announcements/types";
import type { AutomationSlot, AutomationSlotId } from "@/lib/platform/announcements/automation/detectSlots";

interface TemplateVariant {
  displayType: AnnouncementUpsertInput["displayType"];
  audience: AnnouncementUpsertInput["audience"];
  frequency: AnnouncementUpsertInput["frequency"];
  priority: number;
  dismissible: boolean;
}

const VARIANTS: Record<AutomationSlotId, TemplateVariant[]> = {
  nfl_week_open: [
    { displayType: "welcome_popup", audience: "all", frequency: "once", priority: 90, dismissible: true },
    { displayType: "top_banner", audience: "all", frequency: "daily", priority: 85, dismissible: true },
    { displayType: "scrolling_ticker", audience: "all", frequency: "daily", priority: 80, dismissible: false },
    { displayType: "notification_card", audience: "pickem_players", frequency: "daily", priority: 75, dismissible: false },
    { displayType: "floating_toast", audience: "new_players", frequency: "once", priority: 70, dismissible: true },
  ],
  thursday_night: [
    { displayType: "live_event_banner", audience: "all", frequency: "daily", priority: 95, dismissible: true },
    { displayType: "top_banner", audience: "pickem_players", frequency: "daily", priority: 88, dismissible: true },
    { displayType: "scrolling_ticker", audience: "all", frequency: "daily", priority: 82, dismissible: false },
  ],
  sunday_gameday: [
    { displayType: "live_event_banner", audience: "all", frequency: "daily", priority: 96, dismissible: true },
    { displayType: "top_banner", audience: "all", frequency: "daily", priority: 90, dismissible: true },
    { displayType: "notification_card", audience: "returning_players", frequency: "daily", priority: 85, dismissible: false },
    { displayType: "scrolling_ticker", audience: "all", frequency: "daily", priority: 80, dismissible: false },
  ],
  monday_tiebreaker: [
    { displayType: "live_event_banner", audience: "pickem_players", frequency: "daily", priority: 98, dismissible: true },
    { displayType: "welcome_popup", audience: "pickem_players", frequency: "once", priority: 95, dismissible: true },
    { displayType: "top_banner", audience: "pickem_players", frequency: "daily", priority: 92, dismissible: true },
    { displayType: "notification_card", audience: "pickem_players", frequency: "daily", priority: 88, dismissible: false },
  ],
  super_bowl: [
    { displayType: "homepage_hero", audience: "all", frequency: "daily", priority: 100, dismissible: false },
    { displayType: "welcome_popup", audience: "all", frequency: "once", priority: 98, dismissible: true },
    { displayType: "live_event_banner", audience: "all", frequency: "daily", priority: 96, dismissible: true },
    { displayType: "scrolling_ticker", audience: "all", frequency: "daily", priority: 90, dismissible: false },
  ],
  holiday: [
    { displayType: "top_banner", audience: "all", frequency: "daily", priority: 88, dismissible: true },
    { displayType: "scrolling_ticker", audience: "all", frequency: "daily", priority: 84, dismissible: false },
    { displayType: "notification_card", audience: "returning_players", frequency: "daily", priority: 80, dismissible: false },
  ],
  pickem_feature: [
    { displayType: "homepage_hero", audience: "anonymous", frequency: "weekly", priority: 60, dismissible: false },
  ],
};

function copyForSlot(slot: AutomationSlot, variant: TemplateVariant): {
  title: string;
  subtitle: string;
  buttonText: string;
  destinationHref: string;
} {
  const week = slot.meta.weekLabel ?? slot.weekLabel;
  const away = slot.meta.away ?? "";
  const home = slot.meta.home ?? "";
  const holiday = slot.meta.holiday ?? "";
  const matchup = away && home ? `${away} @ ${home}` : "";

  switch (slot.id) {
    case "nfl_week_open":
      return {
        title: `${week} Pick'em is open`,
        subtitle: "Make your picks before kickoff — every tier, every pool, fully automated.",
        buttonText: "Play Pick'em",
        destinationHref: "/pickem/week",
      };
    case "thursday_night":
      return {
        title: "Thursday Night Football",
        subtitle: matchup
          ? `${matchup} · ${week} picks lock at kickoff`
          : `${week} — TNF picks lock at kickoff`,
        buttonText: "View picks",
        destinationHref: "/pickem/week",
      };
    case "sunday_gameday":
      return {
        title: "Sunday Game Day is live",
        subtitle: `${week} · Track your picks in real time as games finish`,
        buttonText: "Live picks",
        destinationHref: "/pickem/week",
      };
    case "monday_tiebreaker":
      return {
        title: "Championship Tiebreaker active",
        subtitle: matchup
          ? `${week} · Predict MNF combined score — ${matchup}`
          : `${week} · Predict Monday Night combined score to win`,
        buttonText: "Enter prediction",
        destinationHref: "/pickem/tiebreaker",
      };
    case "super_bowl":
      return {
        title: "Super Bowl Pick'em",
        subtitle: "The biggest week of the season — pick the champion, compete worldwide.",
        buttonText: "Play Super Bowl week",
        destinationHref: "/pickem/week",
      };
    case "holiday":
      return {
        title: `Happy ${holiday} from SquareBoards`,
        subtitle: `${week} is live — squares and pick'em running all weekend.`,
        buttonText: "Play now",
        destinationHref: "/",
      };
    default:
      return {
        title: "SquareBoards Pick'em",
        subtitle: "Automated football pools — no commissioner required.",
        buttonText: "Learn more",
        destinationHref: "/pickem",
      };
  }
}

export function buildAutomatedAnnouncements(
  slot: AutomationSlot
): Array<AnnouncementUpsertInput & { automationKey: string }> {
  const variants = VARIANTS[slot.id] ?? [];

  return variants.map((variant) => {
    const copy = copyForSlot(slot, variant);
    const automationKey = `auto:${slot.id}:${slot.seasonKey}:${variant.displayType}`;

    return {
      automationKey,
      title: copy.title,
      subtitle: copy.subtitle,
      buttonText: copy.buttonText,
      destinationHref: copy.destinationHref,
      displayType: variant.displayType,
      category: slot.category,
      audience: variant.audience,
      priority: variant.priority,
      dismissible: variant.dismissible,
      frequency: variant.frequency,
      startsAt: slot.startsAt.toISOString(),
      endsAt: slot.endsAt.toISOString(),
      active: true,
    };
  });
}
