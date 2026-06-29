import { redirect } from "next/navigation";

export default function GeoComplianceRedirectPage() {
  redirect("/admin/command-center/geo-operations");
}
