import { ImageResponse } from "next/og";
import { getProfileOgData } from "@/lib/seo/profileOgData";
import { BRAND_NAME } from "@/lib/brand";

export const runtime = "nodejs";
export const alt = `${BRAND_NAME} Competitor Profile`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

const COLORS = {
  bg: "#030712",
  surface: "#081228",
  purple: "#5B4CF7",
  glow: "#7B61FF",
  gold: "#F6C453",
  muted: "#94A3B8",
  white: "#FFFFFF",
};

async function loadFont() {
  const response = await fetch(
    "https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91a.woff",
    { next: { revalidate: 86400 } }
  );
  if (!response.ok) return null;
  return response.arrayBuffer();
}

interface ImageProps {
  params: { username: string };
}

export default async function ProfileOpenGraphImage({ params }: ImageProps) {
  const profile = await getProfileOgData(params.username);
  const fontData = await loadFont();

  if (!profile) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: COLORS.bg,
            color: COLORS.muted,
            fontSize: 36,
            fontFamily: fontData ? "Plus Jakarta Sans" : "system-ui",
          }}
        >
          Profile not found
        </div>
      ),
      { ...size, fonts: fontData ? [{ name: "Plus Jakarta Sans", data: fontData, style: "normal" as const, weight: 700 as const }] : undefined }
    );
  }

  const fonts = fontData
    ? [
        { name: "Plus Jakarta Sans", data: fontData, style: "normal" as const, weight: 700 as const },
        { name: "Plus Jakarta Sans", data: fontData, style: "normal" as const, weight: 400 as const },
      ]
    : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `radial-gradient(ellipse 90% 70% at 20% 0%, rgba(91, 76, 247, 0.35), transparent 55%), ${COLORS.bg}`,
          padding: 56,
          fontFamily: fontData ? "Plus Jakarta Sans" : "system-ui",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[COLORS.purple, COLORS.purple, COLORS.purple, COLORS.glow].map((fill, i) => (
              <div
                key={i}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: fill,
                }}
              />
            ))}
          </div>
          <span style={{ color: COLORS.white, fontSize: 28, fontWeight: 700 }}>{BRAND_NAME}</span>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            gap: 48,
            background: `linear-gradient(135deg, rgba(8,18,40,0.95) 0%, rgba(3,7,18,0.98) 100%)`,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 32,
            padding: 48,
            boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: 48,
              background: `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.glow} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 96,
              border: "4px solid rgba(255,255,255,0.12)",
              flexShrink: 0,
            }}
          >
            {profile.avatarEmoji}
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ color: COLORS.white, fontSize: 52, fontWeight: 700, lineHeight: 1.1 }}>
                {profile.displayName}
              </span>
              <span
                style={{
                  color: COLORS.gold,
                  fontSize: 22,
                  fontWeight: 700,
                  padding: "8px 18px",
                  borderRadius: 999,
                  background: "rgba(246, 196, 53, 0.12)",
                  border: "1px solid rgba(246, 196, 53, 0.35)",
                }}
              >
                {profile.tierName}
              </span>
            </div>

            <span style={{ color: COLORS.muted, fontSize: 24 }}>{profile.headline}</span>

            <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "20px 28px",
                  borderRadius: 20,
                  background: "rgba(91, 76, 247, 0.15)",
                  border: "1px solid rgba(91, 76, 247, 0.35)",
                  minWidth: 180,
                }}
              >
                <span style={{ color: COLORS.muted, fontSize: 16, marginBottom: 6 }}>Competitor Score</span>
                <span style={{ color: COLORS.glow, fontSize: 40, fontWeight: 700 }}>
                  {profile.competitorScore.toLocaleString()}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "20px 28px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  minWidth: 180,
                }}
              >
                <span style={{ color: COLORS.muted, fontSize: 16, marginBottom: 6 }}>Rank Title</span>
                <span style={{ color: COLORS.white, fontSize: 28, fontWeight: 700 }}>{profile.rankTitle}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "20px 28px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  minWidth: 200,
                }}
              >
                <span style={{ color: COLORS.muted, fontSize: 16, marginBottom: 6 }}>World Rank</span>
                <span style={{ color: COLORS.white, fontSize: 28, fontWeight: 700 }}>
                  {profile.worldRankLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
