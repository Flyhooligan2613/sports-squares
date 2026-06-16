/** User agents used by iMessage, SMS link previews, and social crawlers. */
const LINK_PREVIEW_CRAWLER_PATTERNS = [
  /applebot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /slackbot/i,
  /whatsapp/i,
  /googlebot/i,
  /bingbot/i,
  /discordbot/i,
  /telegrambot/i,
  /embedly/i,
  /pinterest/i,
] as const;

export function isLinkPreviewCrawler(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return LINK_PREVIEW_CRAWLER_PATTERNS.some((pattern) => pattern.test(userAgent));
}
