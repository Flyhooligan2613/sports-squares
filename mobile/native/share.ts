import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";

/** Share a board or invite link — native share sheet on Capacitor, Web Share API on web. */
export async function shareBoardLink(
  title: string,
  url: string,
  text?: string
): Promise<boolean> {
  const payload = { title, text: text ?? title, url };

  if (Capacitor.isNativePlatform()) {
    try {
      await Share.share({ ...payload, dialogTitle: "Share board" });
      return true;
    } catch {
      return false;
    }
  }

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(payload);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
