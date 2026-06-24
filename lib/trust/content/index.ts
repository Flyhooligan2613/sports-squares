import type { PolicyDocument } from "../types";
import { communityGuidelinesPolicy } from "./communityGuidelines";
import { contactSupportPolicy } from "./contactSupport";
import { cookiePolicy } from "./cookiePolicy";
import { fairPlayPolicy } from "./fairPlayPolicy";
import { fraudPreventionPolicy } from "./fraudPrevention";
import { identityVerificationPolicy } from "./identityVerification";
import { officialContestRules } from "./officialContestRules";
import { privacyPolicy } from "./privacyPolicy";
import { refundPolicy } from "./refundPolicy";
import { responsibleCompetitionPolicy } from "./responsibleCompetition";
import { securityPolicy } from "./security";
import { termsOfServicePolicy } from "./termsOfService";

export const TRUST_POLICY_CONTENT: Record<string, PolicyDocument> = {
  "terms-of-service": termsOfServicePolicy,
  "privacy-policy": privacyPolicy,
  "refund-policy": refundPolicy,
  "official-contest-rules": officialContestRules,
  "responsible-competition": responsibleCompetitionPolicy,
  "fair-play-policy": fairPlayPolicy,
  "identity-verification": identityVerificationPolicy,
  "fraud-prevention": fraudPreventionPolicy,
  security: securityPolicy,
  "cookie-policy": cookiePolicy,
  "community-guidelines": communityGuidelinesPolicy,
  "contact-support": contactSupportPolicy,
};

export function getTrustPolicyContent(slug: string): PolicyDocument | undefined {
  return TRUST_POLICY_CONTENT[slug];
}
