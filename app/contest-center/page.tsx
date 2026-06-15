import { redirect } from "next/navigation";

/** Contest Center — canonical name for the live contests hub (Action Center route). */
export default function ContestCenterPage() {
  redirect("/action-center");
}
