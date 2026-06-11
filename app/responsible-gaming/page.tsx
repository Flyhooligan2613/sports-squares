import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Responsible Gaming | ${BRAND_NAME}`,
};

export default function ResponsibleGamingPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm mb-8 inline-block">
          &larr; Back to home
        </Link>
        <h1 className="text-3xl font-bold text-slate-50 mb-6">
          Responsible Gaming
        </h1>
        <div className="space-y-4 text-slate-400 text-sm sm:text-base leading-relaxed">
          <p>
            {BRAND_NAME} is intended for entertainment among friends, bars,
            fundraisers, and community groups. Only participate if it is legal
            in your jurisdiction.
          </p>
          <p>
            Set limits, play for fun, and never wager more than you can afford
            to lose. Pool hosts are responsible for local compliance and payout
            rules.
          </p>
          <p>
            If you or someone you know needs help with gambling-related issues,
            contact the National Council on Problem Gambling at 1-800-522-4700
            (US).
          </p>
        </div>
      </main>
    </div>
  );
}
