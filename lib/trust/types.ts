import type { ReactNode } from "react";

export interface TrustCenterSection {
  slug: string;
  icon: string;
  title: string;
  description: string;
  route: string;
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
