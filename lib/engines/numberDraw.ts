import { shuffleDigits, shuffleInnerSquareNumbers } from "@/lib/utils";

export function generateBoardNumbers(): {
  topNumbers: number[];
  sideNumbers: number[];
  innerNumbers: number[];
} {
  return {
    topNumbers: shuffleDigits(),
    sideNumbers: shuffleDigits(),
    innerNumbers: shuffleInnerSquareNumbers(),
  };
}
