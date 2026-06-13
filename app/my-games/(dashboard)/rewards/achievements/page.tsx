import { BRAND_NAME } from "@/lib/brand";
import AchievementsPanel from "@/components/player/ecosystem/AchievementsPanel";

export const metadata = {
  title: `Achievements | Rewards | ${BRAND_NAME}`,
};

export default function AchievementsPage() {
  return <AchievementsPanel />;
}
