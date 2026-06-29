import type { LocationCheckDemo } from "./types";

export const MOCK_LOCATION_DEMOS: LocationCheckDemo[] = [
  {
    id: "loc-fl",
    label: "Florida competitor",
    location: "Miami, FL 33101",
    result: "permitted",
    message:
      "Welcome back. Paid contests, wallet, and full platform features are available in your jurisdiction.",
  },
  {
    id: "loc-tx",
    label: "Texas prospect",
    location: "Austin, TX 78701",
    result: "waitlist",
    message:
      "SquareBoards is not yet available for paid contests in Texas. Join the waitlist to be notified at launch.",
  },
  {
    id: "loc-ca",
    label: "California prospect",
    location: "Los Angeles, CA 90001",
    result: "waitlist",
    message:
      "California is under regulatory review. Account creation and community features are available — paid contests are not.",
  },
  {
    id: "loc-ut",
    label: "Utah visitor",
    location: "Salt Lake City, UT 84101",
    result: "restricted",
    message:
      "SquareBoards is not available in your location. You may browse public content but cannot join paid contests.",
  },
  {
    id: "loc-ny",
    label: "New York competitor",
    location: "New York, NY 10001",
    result: "permitted",
    message:
      "Full platform access confirmed. Enhanced KYC applies for prize pools above platform thresholds.",
  },
];
