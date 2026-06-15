import type { Metadata } from "next";
import ActionCenter from "@/components/action-center/ActionCenter";
import { BRAND_NAME } from "@/lib/brand";
import { PLATFORM_IDENTITY, PLATFORM_TERMS } from "@/lib/platform/legacy/competitiveLanguage";

export const metadata: Metadata = {
  title: `${PLATFORM_TERMS.contestCenter} | ${BRAND_NAME}`,
  description: `${PLATFORM_IDENTITY.tagline} Discover live contests, join with friends, and compete across every sport — updated automatically.`,
};

export default function ActionCenterPage() {
  return <ActionCenter />;
}
