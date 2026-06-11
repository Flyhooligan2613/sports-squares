import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "public/hero/hero-source.png");
const out = path.join(root, "public/hero/hero-showcase.png");

const { width, height } = await sharp(src).metadata();

// Crop to scoreboard + squares board + stadium crowd only.
// Excludes mockup nav, left headline/CTAs, right stats card, bottom info bar.
const left = Math.round(width * 0.24);
const top = Math.round(height * 0.1);
const cropWidth = Math.round(width * 0.52);
const cropHeight = Math.round(height * 0.72);

await sharp(src)
  .extract({ left, top, width: cropWidth, height: cropHeight })
  .png({ quality: 92, compressionLevel: 9 })
  .toFile(out);

console.log(
  `Cropped ${width}x${height} → ${cropWidth}x${cropHeight} (left ${left}, top ${top})`,
);
