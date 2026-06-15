import PickemHistoryClient from "@/components/pickem/PickemHistoryClient";

export const metadata = {
  title: "History | WNBA Pick'em Royale™",
};

export default function WnbaPickemHistoryPage() {
  return <PickemHistoryClient sport="wnba" />;
}
