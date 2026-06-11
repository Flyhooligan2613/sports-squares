import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Sports Squares",
  description: "Create and join Sports Squares pools with friends.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="font-sans bg-slate-950 text-slate-100 antialiased"
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
