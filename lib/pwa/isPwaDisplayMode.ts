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

/** Inline script — PWA always gets splash; browser uses sessionStorage. */
export const APP_OPEN_SPLASH_PENDING_SCRIPT = `(function(){
  try {
    if (location.pathname.startsWith("/admin")) return;
    var m = window.matchMedia.bind(window);
    var isPwa = m("(display-mode: standalone)").matches
      || m("(display-mode: fullscreen)").matches
      || m("(display-mode: minimal-ui)").matches
      || window.navigator.standalone === true;
    if (isPwa || !sessionStorage.getItem("sb-app-open-splash-seen")) {
      document.documentElement.classList.add("sb-splash-pending");
    }
  } catch (e) {}
})();`;
