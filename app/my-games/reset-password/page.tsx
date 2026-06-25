import type { Metadata } from "next";
import PlayerResetPasswordForm from "@/components/player/PlayerResetPasswordForm";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `New Password | ${BRAND_NAME}`,
  description: "Set a new password for your SquareBoards account.",
};

export default function ResetPasswordPage() {
  return <PlayerResetPasswordForm />;
}
