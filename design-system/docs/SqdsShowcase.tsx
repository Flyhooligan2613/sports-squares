"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Chart,
  GlassPanel,
  Input,
  LoadingCard,
  Modal,
  Nav,
  NavTabs,
  Skeleton,
  Spinner,
  Table,
  Toast,
  ToastStack,
  typography,
  spacingScale,
  colorTokens,
  founder,
  motionClasses,
  sqdsIcons,
  CheckCircle2,
  Info,
  AlertTriangle,
} from "@/design-system";

const COLOR_SWATCHES: Array<{ key: keyof typeof colorTokens; label: string; hex: string }> = [
  { key: "primary", label: "Primary", hex: "#5B4CF7" },
  { key: "secondary", label: "Secondary", hex: "#D4D7E5" },
  { key: "accent", label: "Accent", hex: "#7B61FF" },
  { key: "background", label: "Background", hex: "#030712" },
  { key: "surface", label: "Surface", hex: "#081228" },
  { key: "glass", label: "Glass", hex: "rgba(15,23,42,0.72)" },
  { key: "divider", label: "Divider", hex: "rgba(148,163,184,0.12)" },
  { key: "success", label: "Success", hex: "#22E584" },
  { key: "warning", label: "Warning", hex: "#FBBF24" },
  { key: "error", label: "Error", hex: "#F87171" },
  { key: "information", label: "Information", hex: "#3B82F6" },
  { key: "revenueGreen", label: "Revenue Green", hex: "#10B981" },
  { key: "winningGold", label: "Winning Gold", hex: "#F6C453" },
  { key: "executivePurple", label: "Executive Purple", hex: "#7C3AED" },
  { key: "walletBlue", label: "Wallet Blue", hex: "#3B82F6" },
  { key: "riskOrange", label: "Risk Orange", hex: "#F97316" },
];

const BADGE_VARIANTS = [
  "live",
  "winning",
  "locked",
  "pending",
  "review",
  "success",
  "disabled",
  "coming-soon",
  "maintenance",
] as const;

const CARD_VARIANTS = [
  { variant: "stat" as const, title: "Active Contests", value: "1,284", subtitle: "+12% this week" },
  { variant: "contest" as const, title: "Super Bowl Squares", subtitle: "NFL · 100 entries", badge: <Badge variant="live" /> },
  { variant: "player" as const, title: "FlyGoon", subtitle: "Gold Tier · 42 wins" },
  { variant: "revenue" as const, title: "Revenue", value: "$842K", subtitle: "MTD" },
  { variant: "wallet" as const, title: "Wallet Balance", value: "$1,240.00" },
  { variant: "compliance" as const, title: "Geo Compliance", subtitle: "3 states in review" },
  { variant: "alert" as const, title: "Risk Alert", subtitle: "Unusual deposit pattern" },
  { variant: "activity" as const, title: "Recent Activity", subtitle: "Contest joined · 2m ago" },
  { variant: "glass" as const, title: "Glass Card", subtitle: "Frosted surface" },
  { variant: "executive" as const, title: "Executive Summary", subtitle: "Founder Mode" },
];

const TABLE_DATA = [
  { competitor: "FlyGoon", tier: "Gold", contests: 42, winnings: "$2,840" },
  { competitor: "SquareKing", tier: "Platinum", contests: 128, winnings: "$12,400" },
  { competitor: "GridMaster", tier: "Silver", contests: 18, winnings: "$640" },
];

const NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "contests", label: "Contests" },
  { id: "wallet", label: "Wallet" },
];

const DOC_SECTIONS = [
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "spacing", label: "Spacing" },
  { id: "buttons", label: "Buttons" },
  { id: "cards", label: "Cards" },
  { id: "badges", label: "Badges" },
  { id: "inputs", label: "Inputs" },
  { id: "tables", label: "Tables" },
  { id: "charts", label: "Charts" },
  { id: "glass", label: "Glass" },
  { id: "modals", label: "Modals" },
  { id: "toasts", label: "Toasts" },
  { id: "loading", label: "Loading" },
  { id: "motion", label: "Motion" },
  { id: "navigation", label: "Navigation" },
  { id: "icons", label: "Icons" },
  { id: "founder", label: "Founder Mode" },
];

export default function SqdsShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [navActive, setNavActive] = useState("overview");
  const [tabActive, setTabActive] = useState("overview");

  return (
    <>
      <div className="sqds-docs-ambient" aria-hidden>
        <div className="sqds-docs-orb sqds-docs-orb--1" />
        <div className="sqds-docs-orb sqds-docs-orb--2" />
      </div>

      <div className="sqds-docs-inner">
        <header className="sqds-docs-header sqds-animate-fade-in">
          <Badge variant="coming-soon" label="Project Titan 2.5" />
          <h1 className={`${typography.displayXl} sqds-animate-slide-up`} style={{ margin: "16px 0 8px" }}>
            SquareBoards Design System
          </h1>
          <p className={`${typography.body} sqds-text-caption`} style={{ maxWidth: 560 }}>
            SQDS — the canonical design language for SquareBoards. Premium dark mode, glassmorphism,
            and Apple-quality micro-interactions. All new features must import from this package.
          </p>
        </header>

        <div className="sqds-docs-layout">
          <nav className="sqds-sidebar-nav" aria-label="Documentation sections">
            {DOC_SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`}>
                {s.label}
              </a>
            ))}
          </nav>

          <div>
            {/* Colors */}
            <section id="colors" className="sqds-docs-section">
              <h2 className={`sqds-docs-section-title ${typography.heading}`}>Colors</h2>
              <p className={`sqds-docs-section-desc ${typography.caption}`}>
                Semantic color tokens as CSS custom properties. Never hardcode colors in components.
              </p>
              <div className="sqds-docs-grid sqds-docs-grid--4">
                {COLOR_SWATCHES.map((swatch) => (
                  <div key={swatch.key} className="sqds-swatch">
                    <div
                      className="sqds-swatch__chip"
                      style={{ background: colorTokens[swatch.key] }}
                    />
                    <span className="sqds-swatch__name">{swatch.label}</span>
                    <span className="sqds-swatch__hex">{swatch.hex}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Typography */}
            <section id="typography" className="sqds-docs-section">
              <h2 className={`sqds-docs-section-title ${typography.heading}`}>Typography</h2>
              <p className={`sqds-docs-section-desc ${typography.caption}`}>
                Plus Jakarta Sans type scale for display, headings, body, labels, and numbers.
              </p>
              <GlassPanel padding="lg">
                <p className={typography.displayXl}>Display XL</p>
                <p className={typography.displayLarge}>Display Large</p>
                <p className={typography.heading}>Heading</p>
                <p className={typography.subheading}>Subheading</p>
                <p className={typography.body}>Body — Join the Contest and compete with the community.</p>
                <p className={typography.caption}>Caption — Secondary supporting text</p>
                <p className={typography.label}>Label</p>
                <p className={typography.button}>Button Text</p>
                <p className={typography.numbers}>$12,840.00</p>
                <p className={typography.monospace}>const sqds = &quot;SquareBoards&quot;;</p>
              </GlassPanel>
            </section>

            {/* Spacing */}
            <section id="spacing" className="sqds-docs-section">
              <h2 className={`sqds-docs-section-title ${typography.heading}`}>Spacing Scale</h2>
              <p className={`sqds-docs-section-desc ${typography.caption}`}>
                4px base unit — only these values: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
              </p>
              <GlassPanel>
                {spacingScale.map((px) => (
                  <div key={px} className="sqds-spacing-demo" style={{ marginBottom: 12 }}>
                    <div className="sqds-spacing-block" style={{ width: px, height: 24 }} />
                    <span className={typography.caption}>{px}px</span>
                  </div>
                ))}
              </GlassPanel>
            </section>

            {/* Buttons */}
            <section id="buttons" className="sqds-docs-section">
              <h2 className={`sqds-docs-section-title ${typography.heading}`}>Buttons</h2>
              <p className={`sqds-docs-section-desc ${typography.caption}`}>
                Primary, Secondary, Ghost, Danger, Executive, Glass — with loading, success, and disabled states.
              </p>
              <div className="sqds-docs-row" style={{ marginBottom: 16 }}>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="executive">Executive</Button>
                <Button variant="glass">Glass</Button>
              </div>
              <div className="sqds-docs-row">
                <Button variant="primary" loading>
                  Loading
                </Button>
                <Button variant="success">Success</Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
                <Button variant="primary" size="sm">
                  Small
                </Button>
                <Button variant="primary" size="lg">
                  Large
                </Button>
                <Button variant="primary" className="sqds-animate-ripple">
                  Ripple
                </Button>
              </div>
            </section>

            {/* Cards */}
            <section id="cards" className="sqds-docs-section">
              <h2 className={`sqds-docs-section-title ${typography.heading}`}>Cards</h2>
              <p className={`sqds-docs-section-desc ${typography.caption}`}>
                Stat, Contest, Player, Revenue, Wallet, Compliance, Alert, Activity, Glass, Executive.
              </p>
              <div className="sqds-docs-grid sqds-docs-grid--2">
                {CARD_VARIANTS.map((card) => (
                  <Card
                    key={card.variant}
                    variant={card.variant}
                    interactive={card.variant === "contest"}
                    title={card.title}
                    subtitle={card.subtitle}
                    value={"value" in card ? card.value : undefined}
                    badge={"badge" in card ? card.badge : undefined}
                  />
                ))}
              </div>
            </section>

            {/* Badges */}
            <section id="badges" className="sqds-docs-section">
              <h2 className={`sqds-docs-section-title ${typography.heading}`}>Status Badges</h2>
              <p className={`sqds-docs-section-desc ${typography.caption}`}>
                LIVE uses a breathing pulse — never blinking. All status variants included.
              </p>
              <div className="sqds-docs-row">
                {BADGE_VARIANTS.map((v) => (
                  <Badge key={v} variant={v} />
                ))}
              </div>
            </section>

            {/* Inputs */}
            <section id="inputs" className="sqds-docs-section">
              <h2 className={`sqds-docs-section-title ${typography.heading}`}>Inputs</h2>
              <div className="sqds-docs-grid sqds-docs-grid--2">
                <Input label="Email" placeholder="competitor@squareboards.com" hint="We'll never share your email." />
                <Input label="Password" type="password" placeholder="••••••••" error="Password is required" />
              </div>
            </section>

            {/* Tables */}
            <section id="tables" className="sqds-docs-section">
              <h2 className={`sqds-docs-section-title ${typography.heading}`}>Tables</h2>
              <Table
                columns={[
                  { key: "competitor", header: "Competitor" },
                  { key: "tier", header: "Tier" },
                  { key: "contests", header: "Contests" },
                  { key: "winnings", header: "Winnings" },
                ]}
                data={TABLE_DATA}
                getRowKey={(row) => row.competitor}
              />
            </section>

            {/* Charts */}
            <section id="charts" className="sqds-docs-section">
              <h2 className={`sqds-docs-section-title ${typography.heading}`}>Charts</h2>
              <p className={`sqds-docs-section-desc ${typography.caption}`}>
                Placeholder executive charts with consistent visual language.
              </p>
              <div className="sqds-docs-grid sqds-docs-grid--2">
                <Chart variant="executive" title="Executive Overview" subtitle="Platform KPIs" />
                <Chart variant="revenue" title="Revenue" subtitle="Monthly trend" />
                <Chart variant="growth" title="Growth" subtitle="New competitors" />
                <Chart variant="player" title="Player Activity" subtitle="Daily active" />
                <Chart variant="geographic" title="Geographic" subtitle="Regional distribution" />
                <Chart variant="heatmap" title="Heatmap" subtitle="Engagement density" />
              </div>
            </section>

            {/* Glass */}
            <section id="glass" className="sqds-docs-section">
              <h2 className={`sqds-docs-section-title ${typography.heading}`}>Glass Panels</h2>
              <div className="sqds-docs-grid sqds-docs-grid--3">
                <GlassPanel>
                  <p className={typography.subheading}>Standard Glass</p>
                  <p className={typography.caption}>Blur, opacity, border, shadow</p>
                </GlassPanel>
                <GlassPanel glow="purple">
                  <p className={typography.subheading}>Purple Glow</p>
                  <p className={typography.caption}>Accent glow effect</p>
                </GlassPanel>
                <GlassPanel glow="gold">
                  <p className={typography.subheading}>Gold Glow</p>
                  <p className={typography.caption}>Founder highlight</p>
                </GlassPanel>
              </div>
            </section>

            {/* Modals */}
            <section id="modals" className="sqds-docs-section">
              <h2 className={`sqds-docs-section-title ${typography.heading}`}>Modals</h2>
              <Button variant="primary" onClick={() => setModalOpen(true)}>
                Open Modal
              </Button>
              <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Join the Contest">
                <p className={typography.body}>
                  Confirm your entry into Super Bowl Squares. Your wallet will be charged $10.00.
                </p>
              </Modal>
            </section>

            {/* Toasts */}
            <section id="toasts" className="sqds-docs-section">
              <h2 className={`sqds-docs-section-title ${typography.heading}`}>Toasts</h2>
              <div className="sqds-docs-grid sqds-docs-grid--2">
                <Toast title="Contest joined" message="You're in Super Bowl Squares!" variant="success" icon={<CheckCircle2 size={20} color="var(--sqds-color-success)" />} />
                <Toast title="Deposit received" message="$50.00 added to wallet" variant="info" icon={<Info size={20} color="var(--sqds-color-information)" />} />
                <Toast title="Action required" message="Verify your identity" variant="default" />
                <Toast title="Payment failed" message="Please try again" variant="error" icon={<AlertTriangle size={20} color="var(--sqds-color-error)" />} />
              </div>
            </section>

            {/* Loading */}
            <section id="loading" className="sqds-docs-section">
              <h2 className={`sqds-docs-section-title ${typography.heading}`}>Loading States</h2>
              <div className="sqds-docs-grid sqds-docs-grid--3">
                <LoadingCard />
                <GlassPanel>
                  <Spinner />
                  <p className={typography.caption} style={{ marginTop: 12 }}>
                    Spinner
                  </p>
                </GlassPanel>
                <GlassPanel>
                  <Skeleton height={24} width="80%" />
                  <Skeleton height={16} width="60%" style={{ marginTop: 8 }} />
                  <Skeleton height={16} width="90%" style={{ marginTop: 8 }} />
                  <p className={typography.caption} style={{ marginTop: 12 }}>
                    Shimmer skeleton
                  </p>
                </GlassPanel>
              </div>
            </section>

            {/* Motion */}
            <section id="motion" className="sqds-docs-section">
              <h2 className={`sqds-docs-section-title ${typography.heading}`}>Motion Library</h2>
              <p className={`sqds-docs-section-desc ${typography.caption}`}>
                Centralized durations and easings. Respects prefers-reduced-motion.
              </p>
              <div className="sqds-docs-grid sqds-docs-grid--4">
                <GlassPanel className={motionClasses.fadeIn}>
                  <p className={typography.label}>Fade In</p>
                </GlassPanel>
                <GlassPanel className={motionClasses.slideUp}>
                  <p className={typography.label}>Slide Up</p>
                </GlassPanel>
                <GlassPanel className={motionClasses.scaleIn}>
                  <p className={typography.label}>Scale In</p>
                </GlassPanel>
                <GlassPanel className={motionClasses.pulse}>
                  <p className={typography.label}>Pulse</p>
                </GlassPanel>
                <GlassPanel className={motionClasses.glow}>
                  <p className={typography.label}>Glow</p>
                </GlassPanel>
                <GlassPanel className={motionClasses.winning}>
                  <p className={typography.label}>Winning</p>
                </GlassPanel>
                <Button variant="primary" className={motionClasses.ripple}>
                  Ripple
                </Button>
              </div>
            </section>

            {/* Navigation */}
            <section id="navigation" className="sqds-docs-section">
              <h2 className={`sqds-docs-section-title ${typography.heading}`}>Navigation</h2>
              <Nav items={NAV_ITEMS} activeId={navActive} onSelect={setNavActive} />
              <div style={{ marginTop: 24 }}>
                <NavTabs
                  tabs={NAV_ITEMS}
                  activeId={tabActive}
                  onSelect={setTabActive}
                />
              </div>
            </section>

            {/* Icons */}
            <section id="icons" className="sqds-docs-section">
              <h2 className={`sqds-docs-section-title ${typography.heading}`}>Icons</h2>
              <p className={`sqds-docs-section-desc ${typography.caption}`}>
                Curated Lucide icon set for consistent platform usage.
              </p>
              <div className="sqds-icon-grid">
                {Object.entries(sqdsIcons).map(([name, Icon]) => (
                  <div key={name} className="sqds-icon-cell">
                    <Icon size={22} strokeWidth={1.75} />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Founder Mode */}
            <section id="founder" className="sqds-docs-section">
              <h2 className={`sqds-docs-section-title ${typography.heading}`}>Founder Mode</h2>
              <p className={`sqds-docs-section-desc ${typography.caption}`}>
                Premium executive gradients, gold highlights, and subtle effects.
              </p>
              <Card variant="executive" title="Executive Dashboard" subtitle="Founder-only insights">
                <div
                  style={{
                    marginTop: 16,
                    padding: 20,
                    borderRadius: "var(--sqds-radius-md)",
                    background: founder.gradientGold,
                    color: "#030712",
                  }}
                >
                  <p className={typography.subheading} style={{ color: "inherit" }}>
                    Gold Highlight Panel
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "0.8125rem" }}>
                    Revenue up 24% · 12.4K active competitors
                  </p>
                </div>
              </Card>
            </section>
          </div>
        </div>
      </div>

      <ToastStack>
        {/* Static demo toast in corner */}
        <Toast
          title="SQDS loaded"
          message="Design system reference ready"
          variant="info"
          icon={<Info size={18} color="var(--sqds-color-information)" />}
        />
      </ToastStack>
    </>
  );
}
