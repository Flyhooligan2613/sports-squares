export const SUPPORT_CATEGORIES = [
  {
    id: "technical",
    label: "Technical Issue",
    description: "App errors, login problems, or broken pages.",
  },
  {
    id: "payment",
    label: "Payment Question",
    description: "Checkout, payouts, or Stripe Connect setup.",
  },
  {
    id: "gameplay",
    label: "Gameplay Question",
    description: "How SquareBoards, Pick'em, or boards work.",
  },
  {
    id: "bug",
    label: "Bug Report",
    description: "Something isn't working as expected.",
  },
  {
    id: "feedback",
    label: "General Feedback",
    description: "Ideas and overall experience.",
  },
  {
    id: "feature",
    label: "Feature Request",
    description: "Suggest a new platform capability.",
  },
] as const;

export type SupportCategoryId = (typeof SUPPORT_CATEGORIES)[number]["id"];

export function getSupportCategory(id: string) {
  return SUPPORT_CATEGORIES.find((c) => c.id === id);
}
