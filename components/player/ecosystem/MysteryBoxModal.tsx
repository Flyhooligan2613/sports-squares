"use client";

import WeeklyRewardDropExperience from "@/components/player/ecosystem/WeeklyRewardDropExperience";
import type { DropBoxType } from "@/lib/platform/ecosystem/weeklyRewardDropTypes";

interface MysteryBoxModalProps {
  open: boolean;
  boxType?: DropBoxType;
  onClose: () => void;
  onOpened: () => void;
}

/** @deprecated Use WeeklyRewardDropExperience directly */
export default function MysteryBoxModal(props: MysteryBoxModalProps) {
  return <WeeklyRewardDropExperience {...props} />;
}
