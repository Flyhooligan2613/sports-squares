/**
 * Native shell init — status bar, splash, deep links, share bridge.
 */
import { App } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { shareBoardLink } from "./share";

declare global {
  interface Window {
    squareboards?: {
      shareBoardLink: typeof shareBoardLink;
    };
  }
}

function navigateToSquareBoardsUrl(rawUrl: string): void {
  try {
    const parsed = new URL(rawUrl);
    if (!parsed.hostname.endsWith("squareboards.pro")) return;
    const target = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    if (window.location.pathname + window.location.search + window.location.hash !== target) {
      window.location.assign(target);
    }
  } catch {
    // Ignore malformed URLs.
  }
}

export async function initNativeShell(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  document.documentElement.classList.add("sb-native-shell");

  window.squareboards = {
    ...window.squareboards,
    shareBoardLink,
  };

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

  App.addListener("appUrlOpen", ({ url }) => {
    if (url) navigateToSquareBoardsUrl(url);
  });

  try {
    const launch = await App.getLaunchUrl();
    if (launch?.url) navigateToSquareBoardsUrl(launch.url);
  } catch {
    // No cold-start deep link.
  }

  App.addListener("appStateChange", ({ isActive }) => {
    if (process.env.NODE_ENV === "development") {
      console.debug("[SquareBoards native]", isActive ? "active" : "background");
    }
  });
}

export { shareBoardLink };
