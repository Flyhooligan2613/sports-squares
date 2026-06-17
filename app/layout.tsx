import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import NavbarGate from "@/components/NavbarGate";
import NavShell from "@/components/nav/NavShell";
import InstallPrompt from "@/components/InstallPrompt";
import GlobalStaffPortalHint from "@/components/GlobalStaffPortalHint";
import { AnnouncementProvider } from "@/components/announcements/AnnouncementProvider";
import AppAmbientBackdrop from "@/components/sports/AppAmbientBackdrop";
import PwaRegister from "@/components/PwaRegister";
import NativeShellInit from "@/components/NativeShellInit";
import AppOpenSplash from "@/components/AppOpenSplash";
import AppPullToRefresh from "@/components/ui/AppPullToRefresh";
import { APP_OPEN_SPLASH_PENDING_SCRIPT } from "@/lib/pwa/isPwaDisplayMode";
import { buildRootMetadata } from "@/lib/seo/site";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = buildRootMetadata();

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${jakarta.variable}`}>
      <body className="font-sans bg-sb-bg text-white antialiased min-h-screen flex flex-col sb-app-bg">
        <Script id="app-open-splash-pending" strategy="beforeInteractive">
          {APP_OPEN_SPLASH_PENDING_SCRIPT}
        </Script>
        <AppOpenSplash />
        <NavShell>
          <AnnouncementProvider>
            <NavbarGate>
              <AppPullToRefresh>
                <div className="flex-1 flex flex-col relative isolate">
                  <Suspense fallback={null}>
                    <AppAmbientBackdrop />
                  </Suspense>
                  <div className="relative z-[1] flex flex-col flex-1">{children}</div>
                </div>
              </AppPullToRefresh>
            </NavbarGate>
          </AnnouncementProvider>
        </NavShell>
        <InstallPrompt />
        <GlobalStaffPortalHint />
        <PwaRegister />
        <NativeShellInit />
      </body>
    </html>
  );
}
