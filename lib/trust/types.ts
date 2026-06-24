import type { ReactNode } from "react";
import type { TrustLucideIconName } from "./trustIcons";

export type TrustPolicyStatus = "current" | "active" | "updated";

export type TrustCenterCategoryId = "policies" | "competition" | "security" | "support";

export interface TrustCenterSection {
  slug: string;
  lucideIcon: TrustLucideIconName;
  title: string;
  description: string;
  route: string;
  status: TrustPolicyStatus;
  categoryId: TrustCenterCategoryId;
}

export interface TrustCenterCategory {
  id: TrustCenterCategoryId;
  title: string;
  lucideIcon: TrustLucideIconName;
}

export interface PolicySubsection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  numbered?: string[];
}

export interface PolicySection {
  heading: string;
  subsections: PolicySubsection[];
}

export interface PolicyDocument {
  sections: PolicySection[];
  /** Optional footer note rendered below the policy body. */
  footerNote?: ReactNode;
}
