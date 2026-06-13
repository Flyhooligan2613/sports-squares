import { BRAND_NAME } from "@/lib/brand";
import SquareDropPanel from "@/components/player/ecosystem/SquareDropPanel";

export const metadata = {
  title: `The Square Drop | ${BRAND_NAME}`,
  description: "Open your weekly Square Drop — SquareBoards' flagship reward experience.",
};

export default function SquareDropPage() {
  return <SquareDropPanel />;
}
