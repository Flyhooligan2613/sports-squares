import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `FAQ | ${BRAND_NAME}`,
};

const FAQ = [
  {
    q: "How do I buy squares?",
    a: "Browse featured games or enter your pool code, complete secure checkout with Stripe, then use your personal link to pick squares on the board.",
  },
  {
    q: "What is a pool code?",
    a: "A pool code is shared by your host so you can find the right game. Your personal invite link is sent after purchase and lets you claim squares.",
  },
  {
    q: "Can I play on my phone?",
    a: "Yes. SquareBoards is mobile-first. You can also add the app to your home screen for quick access.",
  },
  {
    q: "How are winners determined?",
    a: "Winners are based on the last digit of each team's score at the end of each quarter, matched to your square on the board.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm mb-8 inline-block">
          &larr; Back to home
        </Link>
        <h1 className="text-3xl font-bold text-slate-50 mb-8">FAQ</h1>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="sb-card p-5 sm:p-6">
              <h2 className="text-slate-100 font-semibold mb-2">{item.q}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
