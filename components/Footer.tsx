import Link from "next/link";
import { Share2, MessageCircle, Mail } from "lucide-react";
import Logo from "@/components/Logo";
import StaffPortalLink from "@/components/StaffPortalLink";
import { BRAND_NAME } from "@/lib/brand";

const LINKS = {
  product: [
    { href: "/#marketplace", label: "Browse Games" },
    { href: "/#pools", label: "Open Boards" },
    { href: "/#join", label: "Invite Link" },
    { href: "/support", label: "Support" },
    { href: "/transparency", label: "Transparency" },
    { href: "/faq", label: "FAQ" },
  ],
  company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/responsible-gaming", label: "Responsible Gaming" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
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
          <FooterColumn title="Legal" links={LINKS.legal} />
        </div>

        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-sb-muted">
          <p>&copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:justify-end">
            <p>Play responsibly. Must comply with local laws.</p>
            <StaffPortalLink />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
        {title}
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

