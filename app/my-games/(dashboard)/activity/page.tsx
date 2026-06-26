import type { Metadata } from "next";
import ActivityCenter from "@/components/player/ActivityCenter";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Activity | ${BRAND_NAME}`,
};

export default function ActivityPage() {
  return <ActivityCenter />;
}
