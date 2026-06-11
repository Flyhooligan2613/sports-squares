/**
 * Generates PNG PWA icons from the SVG source.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "icons");
const svgPath = join(outDir, "icon.svg");

if (!existsSync(svgPath)) {
  console.error("Missing icon.svg");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

async function main() {
  let sharp;
  try {
    const require = createRequire(import.meta.url);
    sharp = require("sharp");
  } catch {
    console.warn("sharp not installed — copying SVG as fallback icons.");
    const svg = readFileSync(svgPath);
    writeFileSync(join(outDir, "icon-192.png"), svg);
    writeFileSync(join(outDir, "icon-512.png"), svg);
    return;
  }

  const svg = readFileSync(svgPath);
  for (const size of [192, 512]) {
    const png = await sharp(svg).resize(size, size).png().toBuffer();
    writeFileSync(join(outDir, `icon-${size}.png`), png);
    console.log(`Wrote icon-${size}.png`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
