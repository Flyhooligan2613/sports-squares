export function isPwaDisplayMode(): boolean {
  if (typeof window === "undefined") return false;

  const nav = window.navigator as Navigator & { standalone?: boolean };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    nav.standalone === true
  );
}

/** Inline script — splash once per browser session (PWA + web). */
export const APP_OPEN_SPLASH_PENDING_SCRIPT = `(function(){
  try {
    var root = document.documentElement;
    if (location.pathname.startsWith("/admin")) {
      root.classList.add("sb-splash-revealed");
      return;
    }
    if (!sessionStorage.getItem("sb-app-open-splash-seen")) {
      root.classList.add("sb-splash-pending");
    } else {
      root.classList.add("sb-splash-revealed");
    }
  } catch (e) {
    try { document.documentElement.classList.add("sb-splash-revealed"); } catch (e2) {}
  }
})();`;
