import type { Metadata } from "next";
import OpsLayout from "@/components/operations/shell/OpsLayout";
import "@/components/operations/operations.css";
import { OPS_APP_NAME, OPS_APP_SHORT } from "@/lib/operations/constants";

export const metadata: Metadata = {
  title: {
    default: OPS_APP_NAME,
    template: `%s · ${OPS_APP_SHORT}`,
  },
  description: "SquareBoards enterprise operations platform — Project Titan.",
  robots: { index: false, follow: false },
};

export default function OperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OpsLayout>{children}</OpsLayout>;
}
