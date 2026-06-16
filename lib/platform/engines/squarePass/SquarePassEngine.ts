import { runCampaignScheduler } from "./CampaignScheduler";
import {
  activateCampaign,
  createCampaign,
  createPromoCode,
  getCampaign,
  listAllCampaigns,
  listPromoCodes,
  updateCampaignById,
} from "./PromotionService";
import { applyReferral, ensurePersonalReferralCode, getMyReferral, syncReferralQualification } from "./ReferralService";
import { processSignupBonuses, redeemPromoCode } from "./RedemptionService";
import { fetchSquarePassAnalytics } from "./adapters/analyticsAdapter";
import type {
  ApplyReferralInput,
  CreateCampaignInput,
  CreateCodeInput,
  RedeemCodeInput,
} from "./types";

/** SquarePassEngine™ — Dynamic Promotion & Referral orchestrator. */
export const SquarePassEngine = {
  redeemCode: (input: RedeemCodeInput) => redeemPromoCode(input),
  getMyReferral: (email: string) => getMyReferral(email),
  applyReferral: (input: ApplyReferralInput) => applyReferral(input),
  processSignupBonuses: (email: string) => processSignupBonuses(email),
  ensurePersonalCode: (email: string) => ensurePersonalReferralCode(email),
  syncReferralQualification: (refereeEmail: string) => syncReferralQualification(refereeEmail),
  runScheduler: () => runCampaignScheduler(),

  createCampaign: (input: CreateCampaignInput) => createCampaign(input),
  updateCampaign: (id: string, patch: Partial<CreateCampaignInput> & { active?: boolean }) =>
    updateCampaignById(id, patch),
  getCampaign: (id: string) => getCampaign(id),
  listCampaigns: (activeOnly?: boolean) => listAllCampaigns(activeOnly),
  setCampaignActive: (id: string, active: boolean) => activateCampaign(id, active),
  createCode: (input: CreateCodeInput) => createPromoCode(input),
  listCodes: (campaignId: string) => listPromoCodes(campaignId),
  getAnalytics: () => fetchSquarePassAnalytics(),
};

export type SquarePassEngineType = typeof SquarePassEngine;
