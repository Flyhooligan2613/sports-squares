import sharp from "sharp";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "platform-announcements";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadAnnouncementImage(file: File): Promise<{
  publicUrl: string;
  width: number;
  height: number;
}> {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Unsupported format. Use JPG, PNG, or WEBP.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 10 MB or smaller.");
  }

  const input = Buffer.from(await file.arrayBuffer());
  const image = sharp(input, { failOn: "none" });
  const metadata = await image.metadata();

  const width = metadata.width ?? 1080;
  const height = metadata.height ?? 1350;
  const isLandscape = width >= height;

  const optimized = await image
    .rotate()
    .resize({
      width: isLandscape ? 1920 : 1080,
      height: isLandscape ? 1080 : 1350,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toBuffer();

  const outMeta = await sharp(optimized).metadata();
  const filename = `${randomUUID()}.webp`;
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage.from(BUCKET).upload(filename, optimized, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);

  return {
    publicUrl: data.publicUrl,
    width: outMeta.width ?? width,
    height: outMeta.height ?? height,
  };
}
