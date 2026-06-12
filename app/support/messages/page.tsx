import type { Metadata } from "next";
import AppMenuBar from "@/components/nav/AppMenuBar";
import MessageCenter from "@/components/support/MessageCenter";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Message Center | ${BRAND_NAME}`,
};

export default function MessageCenterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppMenuBar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 sb-page-enter">
        <p className="text-sb-glow text-xs font-bold uppercase tracking-[0.22em] mb-3">
          Support
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Message Center</h1>
        <p className="text-sb-muted mb-8">
          Send messages, report payment issues, and ask game questions.
        </p>
        <MessageCenter />
      </main>
    </div>
  );
}
