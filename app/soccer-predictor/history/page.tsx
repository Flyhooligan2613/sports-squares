import PickemHistoryClient from "@/components/pickem/PickemHistoryClient";

export const metadata = {
  title: "My Profile | Football Pick'em Royale™",
};

export default function SoccerPredictorHistoryPage() {
  return <PickemHistoryClient sport="soccer" />;
}
