import sharp from "sharp";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "platform-announcements";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function resolveMimeType(file: File): string {
  if (file.type && ALLOWED.has(file.type)) return file.type;
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function extensionForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  return "webp";
}

async function optimizeImage(input: Buffer, mime: string): Promise<{ buffer: Buffer; contentType: string }> {
  const meta = await sharp(input, {
    failOn: "none",
    limitInputPixels: 4096 * 4096,
  }).metadata();

  const width = meta.width ?? 1080;
  const height = meta.height ?? 1350;
  const isLandscape = width >= height;

  const buffer = await sharp(input, { failOn: "none", limitInputPixels: 4096 * 4096 })
    .rotate()
    .resize({
      width: isLandscape ? 1920 : 1080,
      height: isLandscape ? 1080 : 1350,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toBuffer();

  return { buffer, contentType: "image/webp" };
}

export async function uploadAnnouncementImage(file: File): Promise<{
  publicUrl: string;
  width: number;
  height: number;
}> {
  const mime = resolveMimeType(file);

  if (!ALLOWED.has(mime)) {
    throw new Error("Unsupported format. Use JPG, PNG, or WEBP.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 10 MB or smaller.");
  }

  const input = Buffer.from(await file.arrayBuffer());
  let output: Buffer;
  let contentType: string;

  try {
    const optimized = await optimizeImage(input, mime);
    output = optimized.buffer;
    contentType = optimized.contentType;
  } catch {
    output = input;
    contentType = mime;
  }

  const outMeta = await sharp(output, { failOn: "none" }).metadata().catch(() => ({
    width: undefined,
    height: undefined,
  }));

  const ext = extensionForMime(contentType);
  const filename = `${randomUUID()}.${ext}`;
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage.from(BUCKET).upload(filename, output, {
    contentType,
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    if (error.message.toLowerCase().includes("bucket")) {
      throw new Error(
        "Storage bucket missing. Run migration 030_announcement_studio.sql in Supabase SQL Editor."
      );
    }
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);

  return {
    publicUrl: data.publicUrl,
    width: outMeta.width ?? 1080,
    height: outMeta.height ?? 1350,
  };
}
