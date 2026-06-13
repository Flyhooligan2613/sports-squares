import PickemHistoryClient from "@/components/pickem/PickemHistoryClient";

export const metadata = {
  title: "History | MLB Pick'em",
};

export default function BaseballPickemHistoryPage() {
  return <PickemHistoryClient sport="mlb" />;
}
