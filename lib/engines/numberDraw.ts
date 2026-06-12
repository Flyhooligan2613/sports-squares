import { shuffleDigits } from "@/lib/utils";

export function generateBoardNumbers(): {
  topNumbers: number[];
  sideNumbers: number[];
} {
  return {
    topNumbers: shuffleDigits(),
    sideNumbers: shuffleDigits(),
  };
}
