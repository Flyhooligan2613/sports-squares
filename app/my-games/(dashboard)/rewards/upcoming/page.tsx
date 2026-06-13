import { BRAND_NAME } from "@/lib/brand";
import UpcomingRewardsPanel from "@/components/player/ecosystem/UpcomingRewardsPanel";

export const metadata = {
  title: `Upcoming Rewards | ${BRAND_NAME}`,
};

export default function UpcomingRewardsPage() {
  return <UpcomingRewardsPanel />;
}
