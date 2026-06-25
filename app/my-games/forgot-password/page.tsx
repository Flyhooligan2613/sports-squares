import type { Metadata } from "next";
import PlayerForgotPasswordForm from "@/components/player/PlayerForgotPasswordForm";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Reset Password | ${BRAND_NAME}`,
  description: "Reset your SquareBoards account password.",
};

export default function ForgotPasswordPage() {
  return <PlayerForgotPasswordForm />;
}
