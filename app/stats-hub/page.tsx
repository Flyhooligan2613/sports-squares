import Footer from "@/components/Footer";
import AppMenuBar from "@/components/nav/AppMenuBar";
import StatsHubClient from "@/components/stats-hub/StatsHubClient";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Stats Hub | ${BRAND_NAME}`,
  description: "Team standings across NFL, NCAA Football, NBA, WNBA, MLB, NHL, and soccer.",
};

export default function StatsHubPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppMenuBar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
        <StatsHubClient />
      </main>
      <Footer />
    </div>
  );
}
