const JAKARTA_BOLD =
  "https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91a.woff";

export async function loadOgFonts() {
  try {
    const response = await fetch(JAKARTA_BOLD, { next: { revalidate: 86400 } });
    if (!response.ok) return undefined;

    const fontData = await response.arrayBuffer();
    return [
      { name: "Plus Jakarta Sans", data: fontData, style: "normal" as const, weight: 700 as const },
      { name: "Plus Jakarta Sans", data: fontData, style: "normal" as const, weight: 400 as const },
    ];
  } catch {
    return undefined;
  }
}

export const OG_FONT_FAMILY = "Plus Jakarta Sans, system-ui, sans-serif";
