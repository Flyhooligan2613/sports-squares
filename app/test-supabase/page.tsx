import { redirect } from "next/navigation";
import TestSupabaseClient from "./TestSupabaseClient";

export default function TestSupabasePage() {
  if (process.env.NODE_ENV === "production") {
    redirect("/");
  }

  return <TestSupabaseClient />;
}
