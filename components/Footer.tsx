import Link from "next/link";
import { Share2, MessageCircle, Mail } from "lucide-react";
import AltivoraCorporateSeal from "@/components/brand/AltivoraCorporateSeal";
import Logo from "@/components/Logo";
import StaffPortalLink from "@/components/StaffPortalLink";
import { BRAND_NAME } from "@/lib/brand";
import { TRUST_CENTER_SECTIONS } from "@/lib/trust/trustCenterSections";

const LINKS = {
  product: [
    { href: "/#why-squareboards", label: "Why SquareBoards" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#platform-features", label: "Features" },
    { href: "/#faq", label: "FAQ" },
    { href: "/support", label: "Support" },
  ],
  legal: [
    { href: "/trust", label: "Trust Center" },
    { href: "/trust/terms-of-service", label: "Terms" },
    { href: "/trust/privacy-policy", label: "Privacy" },
    { href: "/trust/refund-policy", label: "Refund Policy" },
    { href: "/support", label: "Support" },
    { href: "/contact", label: "Contact" },
  ],
  company: [
    { href: "/about", label: "About" },
    { href: "/trust", label: "Trust Center" },
    { href: "/contact", label: "Contact" },
    { href: "/trust/responsible-competition", label: "Responsible Competition" },
  ],
};

const TRUST_CENTER_LINKS = TRUST_CENTER_SECTIONS.map((section) => ({
  href: section.route,
  label: section.title,
}));

export default function Footer({ landing = false }: { landing?: boolean }) {
  return (
    <footer
      className={[
        "mt-auto",
        landing ? "landing-footer" : "border-t border-white/[0.06] bg-sb-bg",
      ].join(" ")}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        {landing ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
              <div className="col-span-2 md:col-span-1">
                <Logo href="/" className="mb-4" />
                <p className="text-sb-muted text-sm leading-relaxed max-w-xs">
                  The premium multi-game competitive sports platform — fair contests,
                  secure wallet, and live experiences.
                </p>
                <div className="flex gap-3 mt-5">
                  <a
                    href="mailto:support@squareboards.pro"
                    className="w-11 h-11 rounded-xl bg-sb-surface/80 border border-white/10 flex items-center justify-center text-sb-muted hover:text-sb-glow hover:border-sb-purple/30 transition-all duration-200"
                    aria-label="Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <FooterColumn title="Platform" links={LINKS.product} />
              <FooterColumn title="Legal" links={LINKS.legal} />
              <FooterColumn title="Trust Center" links={TRUST_CENTER_LINKS} />
            </div>
            <div className="landing-footer-corporate mb-8 pb-8 border-b border-white/[0.06]">
              <AltivoraCorporateSeal compact />
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Logo href="/" className="mb-4" />
              <p className="text-sb-muted text-sm leading-relaxed max-w-xs">
                The automated sports squares marketplace — pick a game, buy
                squares, and play.
              </p>
              <div className="flex gap-3 mt-5">
                <a
                  href="mailto:support@squareboards.pro"
                  className="w-11 h-11 rounded-xl bg-sb-surface/80 border border-white/10 flex items-center justify-center text-sb-muted hover:text-sb-glow hover:border-sb-purple/30 transition-all duration-200"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <span
                  className="w-11 h-11 rounded-xl bg-sb-surface/80 border border-white/10 flex items-center justify-center text-sb-muted/50 cursor-default"
                  aria-hidden
                >
                  <Share2 className="w-4 h-4" />
                </span>
                <span
                  className="w-11 h-11 rounded-xl bg-sb-surface/80 border border-white/10 flex items-center justify-center text-sb-muted/50 cursor-default"
                  aria-hidden
                >
                  <MessageCircle className="w-4 h-4" />
                </span>
              </div>
            </div>
            <FooterColumn title="Play" links={LINKS.product} />
            <FooterColumn title="Company" links={LINKS.company} />
            <FooterColumn title="Trust Center" links={TRUST_CENTER_LINKS} />
          </div>
        )}

        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-sb-muted">
          <p>&copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:justify-end">
            <p>Compete responsibly. Must comply with local laws.</p>
            <StaffPortalLink />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  titleNote,
  links,
}: {
  title: string;
  titleNote?: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-xs mb-4">
        {titleNote ? (
          <>
            <span className="text-white font-semibold">{title}</span>
            <span className="text-[10px] italic text-sb-muted font-normal ml-1">
              {titleNote}
            </span>
          </>
        ) : (
          <span className="text-white font-semibold uppercase tracking-wider">
            {title}
          </span>
        )}
      </p>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sb-muted hover:text-white text-sm transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

