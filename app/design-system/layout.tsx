import type { Metadata } from "next";
import "@/design-system/sqds.css";

export const metadata: Metadata = {
  title: "SquareBoards Design System (SQDS)",
  description: "Internal design system reference — Project Titan Sprint 2.5.",
  robots: { index: false, follow: false },
};

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="sqds-root sqds-docs">{children}</div>;
}
