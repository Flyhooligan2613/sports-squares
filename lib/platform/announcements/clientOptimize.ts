const MAX_LANDSCAPE = { width: 1920, height: 1080 };
const MAX_PORTRAIT = { width: 1080, height: 1350 };

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image file."));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image compression failed."))),
      type,
      quality
    );
  });
}

export async function optimizeAnnouncementImageClient(
  file: File
): Promise<{ blob: Blob; contentType: string }> {
  const img = await loadImageElement(file);
  const isLandscape = img.naturalWidth >= img.naturalHeight;
  const max = isLandscape ? MAX_LANDSCAPE : MAX_PORTRAIT;
  const scale = Math.min(1, max.width / img.naturalWidth, max.height / img.naturalHeight);
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare image for upload.");

  ctx.drawImage(img, 0, 0, width, height);

  try {
    const webp = await canvasToBlob(canvas, "image/webp", 0.85);
    return { blob: webp, contentType: "image/webp" };
  } catch {
    const jpeg = await canvasToBlob(canvas, "image/jpeg", 0.88);
    return { blob: jpeg, contentType: "image/jpeg" };
  }
}
