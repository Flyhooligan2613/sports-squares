import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { ALTIVORA_LABS_LOGO } from "@/components/brand/AltivoraCorporateSeal";
import Logo from "@/components/Logo";
import StaffPortalLink from "@/components/StaffPortalLink";

const LANDING_FOOTER = {
  company: [
    { href: "/about", label: "About Altivora" },
    { href: "/", label: "SquareBoards" },
    { href: "#", label: "Careers", comingSoon: true },
  ],
  resources: [
    { href: "/faq", label: "FAQ" },
    { href: "/huddle", label: "Community" },
    { href: "/support", label: "Support" },
    { href: "/contact", label: "Contact" },
  ],
  trustCenter: [
    { href: "/trust/terms-of-service", label: "Terms" },
    { href: "/trust/privacy-policy", label: "Privacy" },
    { href: "/trust/refund-policy", label: "Refund Policy" },
    { href: "/trust/official-contest-rules", label: "Contest Rules" },
    { href: "/trust/responsible-competition", label: "Responsible Competition" },
    { href: "/trust/fraud-prevention", label: "Fraud Prevention" },
    { href: "/trust/security", label: "Security" },
  ],
} as const;

const DEFAULT_LINKS = {
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
          <div className="landing-footer-grid mb-12">
            <FooterColumn title="Company" links={LANDING_FOOTER.company} />
            <FooterColumn title="Resources" links={LANDING_FOOTER.resources} />
            <FooterColumn title="Trust Center" links={LANDING_FOOTER.trustCenter} />
            <div className="landing-footer-corporate-block">
              <p className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
                Corporate
              </p>
              <Image
                src={ALTIVORA_LABS_LOGO}
                alt="ALTIVORA LABS"
                width={58}
                height={58}
                className="landing-footer-corporate-logo mb-3"
              />
              <p className="text-sm font-semibold text-white mb-1">ALTIVORA LABS LLC</p>
              <p className="text-sm text-sb-muted mb-2">Engineering Trust Through Software</p>
              <p className="text-xs text-sb-muted">Established 2026 · Florida, USA</p>
              <a
                href="mailto:support@squareboards.pro"
                className="landing-footer-email mt-4 inline-flex items-center gap-2 text-sm text-sb-muted hover:text-white transition-colors duration-[280ms]"
                aria-label="Email support"
              >
                <Mail className="w-4 h-4" />
                support@squareboards.pro
              </a>
            </div>
          </div>
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
                  className="w-11 h-11 rounded-xl bg-sb-surface/80 border border-white/10 flex items-center justify-center text-sb-muted hover:text-sb-glow hover:border-sb-purple/30 transition-all duration-[280ms]"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
            <FooterColumn title="Play" links={DEFAULT_LINKS.product} />
            <FooterColumn title="Company" links={DEFAULT_LINKS.company} />
            <FooterColumn title="Legal" links={DEFAULT_LINKS.legal} />
          </div>
        )}

        {landing ? (
          <div className="landing-footer-brand-row mb-8 pb-8 border-b border-white/[0.06]">
            <Logo href="/" className="mb-3" />
            <p className="text-sb-muted text-sm leading-relaxed max-w-md">
              The premium multi-game competitive sports platform — fair contests,
              secure wallet, and live experiences.
            </p>
          </div>
        ) : null}

        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-sb-muted">
          <p>
            {landing
              ? "© 2026 ALTIVORA LABS LLC | SquareBoards™ | All Rights Reserved"
              : `© ${new Date().getFullYear()} SquareBoards. All rights reserved.`}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:justify-end">
            <p>Compete responsibly. Must comply with local laws.</p>
            <StaffPortalLink />
          </div>
        </div>
      </div>
    </footer>
  );
}

type FooterLink = {
  href: string;
  label: string;
  comingSoon?: boolean;
};

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly FooterLink[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            {link.comingSoon ? (
              <span className="text-sb-muted/70 text-sm cursor-default">
                {link.label}{" "}
                <span className="text-[10px] italic">(Coming Soon)</span>
              </span>
            ) : (
              <Link
                href={link.href}
                className="text-sb-muted hover:text-white text-sm transition-colors duration-[280ms]"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
