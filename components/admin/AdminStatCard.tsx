import type { LucideIcon } from "lucide-react";
import KpiCard from "@/components/ui/KpiCard";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  accent?: "purple" | "success" | "gold" | "muted";
  icon?: LucideIcon;
  delay?: number;
}

export default function AdminStatCard(props: AdminStatCardProps) {
  return <KpiCard {...props} />;
}
