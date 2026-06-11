import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import InstallPrompt from "@/components/InstallPrompt";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "Sports Squares",
  description:
    "Create and join NFL, NCAA, and NBA sports squares pools online.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sports Squares",
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
    <html lang="en">
      <body className="font-sans bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col">{children}</div>
        <InstallPrompt />
        <PwaRegister />
      </body>
    </html>
  );
}
