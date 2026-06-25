import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import Footer from "@/components/Footer";
import LandingHero from "@/components/landing/LandingHero";
import LandingTrustStrip from "@/components/landing/LandingTrustStrip";
import LandingCorporateAttribution from "@/components/landing/LandingCorporateAttribution";

const LandingWhySquareBoards = dynamic(
  () => import("@/components/landing/LandingWhySquareBoards")
);
const LandingHowItWorks = dynamic(() => import("@/components/landing/LandingHowItWorks"));
const LandingSupportedSports = dynamic(
  () => import("@/components/landing/LandingSupportedSports")
);
const LandingPlatformFeatures = dynamic(
  () => import("@/components/landing/LandingPlatformFeatures")
);
const LandingWhyPlayersChoose = dynamic(
  () => import("@/components/landing/LandingWhyPlayersChoose")
);
const LandingTrustSecurity = dynamic(
  () => import("@/components/landing/LandingTrustSecurity")
);
const LandingFAQ = dynamic(() => import("@/components/landing/LandingFAQ"));
const LandingFinalCTA = dynamic(() => import("@/components/landing/LandingFinalCTA"));

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/my-games?mode=gameday");
  }

  return (
    <div className="landing-page landing-page-enter min-h-[calc(100vh-3.5rem)] flex flex-col overflow-x-hidden">
      <main className="flex-1">
        <LandingHero />
        <LandingTrustStrip />
        <LandingCorporateAttribution />
        <LandingWhySquareBoards />
        <LandingHowItWorks />
        <LandingSupportedSports />
        <LandingPlatformFeatures />
        <LandingWhyPlayersChoose />
        <LandingTrustSecurity />
        <LandingFAQ />
        <LandingFinalCTA />
      </main>
      <Footer landing />
    </div>
  );
}
