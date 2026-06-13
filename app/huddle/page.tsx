import Footer from "@/components/Footer";
import AppMenuBar from "@/components/nav/AppMenuBar";
import HuddleClient from "@/components/huddle/HuddleClient";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `The Huddle | ${BRAND_NAME}`,
  description: "SquareBoards community pick feed — follow players, copy Sunday picks, build your legacy.",
};

export default function HuddlePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppMenuBar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        <HuddleClient />
      </main>
      <Footer />
    </div>
  );
}
