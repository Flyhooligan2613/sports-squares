import { redirect } from "next/navigation";

export default function HomeRoutePage() {
  redirect("/my-games?mode=gameday");
}
