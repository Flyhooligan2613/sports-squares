import { redirect } from "next/navigation";

export default function GameDayPage() {
  redirect("/my-games?mode=gameday");
}
