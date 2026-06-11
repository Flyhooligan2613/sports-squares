import { Mail } from "lucide-react";
import PageShell from "@/components/ui/PageShell";
import { Card } from "@/components/ui/Card";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Contact | ${BRAND_NAME}`,
};

export default function ContactPage() {
  return (
    <PageShell title="Contact" showLogo={false}>
      <Card variant="glass" className="p-6 sm:p-8 not-prose">
        <p className="text-sb-muted text-sm leading-relaxed mb-6">
          Questions about your pool, purchase, or invite link? Reach out and
          we&apos;ll get back to you as soon as we can.
        </p>
        <a
          href="mailto:support@squareboards.pro"
          className="inline-flex items-center gap-2 text-sb-glow hover:text-white font-medium text-sm transition-colors"
        >
          <Mail className="w-4 h-4" />
          support@squareboards.pro
        </a>
      </Card>
    </PageShell>
  );
}
