import type { ReactNode } from "react";
import { OG_BRAND, OG_COLORS, ogBackground } from "./design";
import { OG_FONT_FAMILY } from "./fonts";

export function OgCanvas({
  children,
  glow = false,
  padding = 48,
}: {
  children: ReactNode;
  glow?: boolean;
  padding?: number;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: ogBackground(glow),
        padding,
        fontFamily: OG_FONT_FAMILY,
      }}
    >
      {children}
    </div>
  );
}

export function OgBrandHeader() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[OG_COLORS.purple, OG_COLORS.purple, OG_COLORS.purple, OG_COLORS.glow].map((fill, i) => (
          <div
            key={i}
            style={{ width: 24, height: 24, borderRadius: 7, background: fill }}
          />
        ))}
      </div>
      <span style={{ color: OG_COLORS.white, fontSize: 26, fontWeight: 700 }}>{OG_BRAND.name}</span>
    </div>
  );
}

export function OgFooter({ tagline = OG_BRAND.footer }: { tagline?: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "auto",
        paddingTop: 20,
      }}
    >
      <span style={{ color: OG_COLORS.muted, fontSize: 20 }}>{tagline}</span>
      <span style={{ color: OG_COLORS.glow, fontSize: 20, fontWeight: 700 }}>{OG_BRAND.name}</span>
    </div>
  );
}

export function OgCard({ children, padding = 36 }: { children: ReactNode; padding?: number }) {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        background: `linear-gradient(135deg, rgba(8,18,40,0.96) 0%, rgba(3,7,18,0.98) 100%)`,
        border: `1px solid ${OG_COLORS.border}`,
        borderRadius: 28,
        padding,
        boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
      }}
    >
      {children}
    </div>
  );
}

export function OgAvatar({ emoji, size = 160 }: { emoji: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.24,
        background: `linear-gradient(135deg, ${OG_COLORS.purple} 0%, ${OG_COLORS.glow} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.48,
        border: "4px solid rgba(255,255,255,0.12)",
        flexShrink: 0,
        boxShadow: `0 0 40px rgba(91, 76, 247, 0.35)`,
      }}
    >
      {emoji}
    </div>
  );
}

export function OgStatPill({
  label,
  value,
  accent = OG_COLORS.glow,
  minWidth = 150,
}: {
  label: string;
  value: string;
  accent?: string;
  minWidth?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "16px 22px",
        borderRadius: 18,
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${OG_COLORS.border}`,
        minWidth,
      }}
    >
      <span style={{ color: OG_COLORS.muted, fontSize: 14, marginBottom: 4 }}>{label}</span>
      <span style={{ color: accent, fontSize: 28, fontWeight: 700 }}>{value}</span>
    </div>
  );
}

export function OgBadgeRow({ badges }: { badges: string[] }) {
  if (!badges.length) return null;
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
      {badges.slice(0, 4).map((badge) => (
        <span
          key={badge}
          style={{
            color: OG_COLORS.gold,
            fontSize: 16,
            fontWeight: 700,
            padding: "6px 14px",
            borderRadius: 999,
            background: "rgba(246, 196, 53, 0.12)",
            border: "1px solid rgba(246, 196, 53, 0.35)",
          }}
        >
          {badge}
        </span>
      ))}
    </div>
  );
}

export function OgTitle({ children, size = 44 }: { children: ReactNode; size?: number }) {
  return (
    <span style={{ color: OG_COLORS.white, fontSize: size, fontWeight: 700, lineHeight: 1.1 }}>
      {children}
    </span>
  );
}

export function OgSubtitle({ children }: { children: ReactNode }) {
  return <span style={{ color: OG_COLORS.muted, fontSize: 22 }}>{children}</span>;
}

export function OgEyebrow({ children, color = OG_COLORS.gold }: { children: ReactNode; color?: string }) {
  return (
    <span
      style={{
        color,
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 10,
      }}
    >
      {children}
    </span>
  );
}

export function OgNotFound({ message = "Not found" }: { message?: string }) {
  return (
    <OgCanvas>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: OG_COLORS.muted,
          fontSize: 32,
        }}
      >
        {message}
      </div>
    </OgCanvas>
  );
}

export function OgCta({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "14px 28px",
        borderRadius: 16,
        background: `linear-gradient(135deg, ${OG_COLORS.purple}, ${OG_COLORS.glow})`,
        color: OG_COLORS.white,
        fontSize: 22,
        fontWeight: 700,
        marginTop: 20,
        boxShadow: "0 8px 32px rgba(91, 76, 247, 0.45)",
      }}
    >
      {label}
    </div>
  );
}
