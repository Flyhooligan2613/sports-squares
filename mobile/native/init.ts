/**
 * Phase 1 native bridge stub — import from the web app in Phase 2 when
 * Capacitor.isNativePlatform() is true (Status Bar, Splash, Share, Push).
 */
import { App } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";

export async function initNativeShell(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#020617" });
  } catch {
    // Status bar APIs vary by platform.
  }

  try {
    await SplashScreen.hide();
  } catch {
    // Splash may already be hidden.
  }

  App.addListener("appStateChange", ({ isActive }) => {
    if (process.env.NODE_ENV === "development") {
      console.debug("[SquareBoards native]", isActive ? "active" : "background");
    }
  });
}
