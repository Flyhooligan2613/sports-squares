import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import Logo from "@/components/Logo";

export const metadata = {
  title: `About | ${BRAND_NAME}`,
};

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <Logo href="/" className="mb-8" />
        <h1 className="text-3xl font-bold text-slate-50 mb-6">About {BRAND_NAME}</h1>
        <div className="space-y-4 text-slate-400 text-sm sm:text-base leading-relaxed">
          <p>
            {BRAND_NAME} is a modern sports squares platform built for players
            who want a premium, mobile-first experience — from buying squares
            to tracking live scores and quarter winners.
          </p>
          <p>
            We combine secure Stripe payments, instant invite links, and ESPN
            live score sync so you can focus on the game, not spreadsheets.
          </p>
        </div>
        <Link href="/" className="inline-block mt-8 text-indigo-400 hover:text-indigo-300 text-sm font-medium">
          &larr; Back to home
        </Link>
      </main>
    </div>
  );
}
