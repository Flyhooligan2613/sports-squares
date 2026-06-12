import type { Metadata } from "next";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Notifications | ${BRAND_NAME}`,
};

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
        Notifications
      </h1>
      <p className="text-sb-muted mb-8">Board updates, winners, and game-day alerts.</p>
      <LandingGlassCard className="p-8 text-center">
        <p className="text-3xl mb-3">🔔</p>
        <p className="text-white font-semibold mb-1">Activity lives on My Games</p>
        <p className="text-sb-muted text-sm">
          Open My Games for your live activity feed — board filled, numbers assigned,
          quarter winners, and kickoff reminders.
        </p>
      </LandingGlassCard>
    </div>
  );
}
