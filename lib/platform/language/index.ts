/**
 * Contest Language Engine™ — unified platform copy API.
 * Platform Polish Sprint #002
 *
 * Single source of truth for competition-oriented player-facing language.
 * Designed for future i18n, A/B testing, and admin customization.
 */

export {
  BRANDED_MODULES,
  type BrandedModuleKey,
} from "@/lib/platform/language/brandedModules";

export {
  CONTEST_CTAS,
  CONTEST_CENTER,
  CONTEST_STATUS_LABELS,
  CONTEST_TERMS,
  contestSpotsLeft,
  contestSpotsRemaining,
  type ContestCtaKey,
  type ContestTermKey,
} from "@/lib/platform/language/contestLanguage";

export {
  PLAYER_TERMS,
  PROFILE_LABELS,
  REWARD_LABELS,
  COMMUNITY_LABELS,
  type PlayerTermKey,
} from "@/lib/platform/language/playerLanguage";

export {
  NOTIFICATION_TEMPLATES,
  notificationCopy,
  type NotificationTemplateKey,
} from "@/lib/platform/language/notificationLanguage";

export {
  EMPTY_STATE,
  type EmptyStateKey,
} from "@/lib/platform/language/emptyStateLanguage";

export {
  LOADING_CONTEXTS,
  LOADING_DEFAULT,
  getLoadingMessage,
  getLoadingMessageAt,
  type LoadingContext,
} from "@/lib/platform/language/loadingLanguage";

export {
  SUCCESS_MESSAGES,
  type SuccessMessageKey,
} from "@/lib/platform/language/successLanguage";

export {
  ALIVE_BRAND,
  ALIVE_COPY,
  ALIVE_STAT_LABELS,
  aliveGreeting,
  resolveTimeOfDayGreeting,
} from "@/lib/platform/language/aliveLanguage";

import { BRANDED_MODULES } from "@/lib/platform/language/brandedModules";
import {
  CONTEST_CTAS,
  CONTEST_CENTER,
  CONTEST_STATUS_LABELS,
  CONTEST_TERMS,
} from "@/lib/platform/language/contestLanguage";
import {
  COMMUNITY_LABELS,
  PLAYER_TERMS,
  PROFILE_LABELS,
  REWARD_LABELS,
} from "@/lib/platform/language/playerLanguage";
import { NOTIFICATION_TEMPLATES } from "@/lib/platform/language/notificationLanguage";
import { EMPTY_STATE } from "@/lib/platform/language/emptyStateLanguage";
import {
  LOADING_CONTEXTS,
  LOADING_DEFAULT,
  getLoadingMessage,
} from "@/lib/platform/language/loadingLanguage";
import { SUCCESS_MESSAGES } from "@/lib/platform/language/successLanguage";

/** Unified language bundle — import this or use getContestLanguage(). */
export const CONTEST_LANGUAGE = {
  branded: BRANDED_MODULES,
  contest: CONTEST_TERMS,
  ctas: CONTEST_CTAS,
  center: CONTEST_CENTER,
  status: CONTEST_STATUS_LABELS,
  player: PLAYER_TERMS,
  profile: PROFILE_LABELS,
  rewards: REWARD_LABELS,
  community: COMMUNITY_LABELS,
  notifications: NOTIFICATION_TEMPLATES,
  emptyState: EMPTY_STATE,
  loading: LOADING_CONTEXTS,
  loadingDefault: LOADING_DEFAULT,
  success: SUCCESS_MESSAGES,
} as const;

export type ContestLanguage = typeof CONTEST_LANGUAGE;

/** Access the full language engine. Hook point for future i18n / admin overrides. */
export function getContestLanguage(): ContestLanguage {
  return CONTEST_LANGUAGE;
}
