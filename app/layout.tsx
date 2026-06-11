import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import InstallPrompt from "@/components/InstallPrompt";
import PwaRegister from "@/components/PwaRegister";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: BRAND_NAME,
  description:
    "Buy sports squares online — secure checkout, live scores, and instant access to your board.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND_NAME,
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-sans bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col">{children}</div>
        <InstallPrompt />
        <PwaRegister />
      </body>
    </html>
  );
}
