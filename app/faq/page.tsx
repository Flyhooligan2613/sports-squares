import PageShell from "@/components/ui/PageShell";
import { Card } from "@/components/ui/Card";
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
    <PageShell title="FAQ" showLogo={false}>
      <div className="space-y-4 not-prose">
        {FAQ.map((item) => (
          <Card key={item.q} variant="glass" className="p-5 sm:p-6">
            <h2 className="text-white font-semibold mb-2">{item.q}</h2>
            <p className="text-sb-muted text-sm leading-relaxed">{item.a}</p>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
