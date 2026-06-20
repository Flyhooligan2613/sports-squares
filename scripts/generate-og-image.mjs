/**
 * Generates a static homepage OG PNG at public/og-image.png (1200×630).
 * Run: node scripts/generate-og-image.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outPath = path.join(root, "public", "og-image.png");

const width = 1200;
const height = 630;

const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#030712"/>
      <stop offset="100%" style="stop-color:#0c1830"/>
    </linearGradient>
    <radialGradient id="glow" cx="20%" cy="0%" r="70%">
      <stop offset="0%" style="stop-color:#5B4CF7;stop-opacity:0.45"/>
      <stop offset="100%" style="stop-color:#5B4CF7;stop-opacity:0"/>
    </radialGradient>
    <linearGradient id="cta" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#5B4CF7"/>
      <stop offset="100%" style="stop-color:#7B61FF"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <g transform="translate(72,72)">
    <rect x="0" y="0" width="24" height="24" rx="7" fill="#5B4CF7"/>
    <rect x="32" y="0" width="24" height="24" rx="7" fill="#5B4CF7"/>
    <rect x="64" y="0" width="24" height="24" rx="7" fill="#5B4CF7"/>
    <rect x="96" y="0" width="24" height="24" rx="7" fill="#7B61FF"/>
    <text x="140" y="20" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="28" font-weight="700">SquareBoards™</text>
  </g>
  <rect x="72" y="150" width="1056" height="360" rx="28" fill="#081228" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <text x="120" y="240" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="56" font-weight="700">SquareBoards™</text>
  <text x="120" y="300" fill="#7B61FF" font-family="Arial, sans-serif" font-size="28" font-weight="700">Compete • Build Your Legacy • Win Rewards</text>
  <text x="120" y="350" fill="#94A3B8" font-family="Arial, sans-serif" font-size="24">Premium Multi-Game Competitive Sports Platform</text>
  <rect x="120" y="390" width="140" height="72" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)"/>
  <text x="140" y="420" fill="#94A3B8" font-family="Arial, sans-serif" font-size="14">Games</text>
  <text x="140" y="450" fill="#7B61FF" font-family="Arial, sans-serif" font-size="28" font-weight="700">12+</text>
  <rect x="280" y="390" width="140" height="72" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)"/>
  <text x="300" y="420" fill="#94A3B8" font-family="Arial, sans-serif" font-size="14">Players</text>
  <text x="300" y="450" fill="#34D399" font-family="Arial, sans-serif" font-size="28" font-weight="700">Live</text>
  <rect x="440" y="390" width="140" height="72" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)"/>
  <text x="460" y="420" fill="#94A3B8" font-family="Arial, sans-serif" font-size="14">Rewards</text>
  <text x="460" y="450" fill="#F6C453" font-family="Arial, sans-serif" font-size="28" font-weight="700">Daily</text>
  <rect x="820" y="200" width="260" height="260" rx="32" fill="#0c1830" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
  <text x="900" y="330" font-family="Arial, sans-serif" font-size="72">🎮</text>
  <text x="860" y="390" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="20" font-weight="700">Compete Anywhere</text>
  <text x="72" y="580" fill="#94A3B8" font-family="Arial, sans-serif" font-size="20">Compete. Build Your Legacy.</text>
  <text x="980" y="580" fill="#7B61FF" font-family="Arial, sans-serif" font-size="20" font-weight="700">SquareBoards™</text>
</svg>`;

await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
await sharp(Buffer.from(svg)).png().toFile(outPath);
console.log(`✓ ${outPath} (${width}x${height})`);
