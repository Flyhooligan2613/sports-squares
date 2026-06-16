import {
  fetchCampaignById,
  insertCampaign,
  insertCode,
  listCampaigns,
  listCodesForCampaign,
  updateCampaign,
} from "./repository";
import type { CreateCampaignInput, CreateCodeInput, SquarePassCampaign, SquarePassCode } from "./types";

export async function createCampaign(input: CreateCampaignInput): Promise<SquarePassCampaign> {
  return insertCampaign(input);
}

export async function updateCampaignById(
  id: string,
  patch: Partial<CreateCampaignInput> & { active?: boolean }
): Promise<SquarePassCampaign> {
  return updateCampaign(id, patch);
}

export async function getCampaign(id: string): Promise<SquarePassCampaign | null> {
  return fetchCampaignById(id);
}

export async function listAllCampaigns(activeOnly = false): Promise<SquarePassCampaign[]> {
  return listCampaigns(activeOnly);
}

export async function activateCampaign(id: string, active: boolean): Promise<SquarePassCampaign> {
  return updateCampaign(id, { active });
}

export async function createPromoCode(input: CreateCodeInput): Promise<SquarePassCode> {
  const campaign = await fetchCampaignById(input.campaignId);
  if (!campaign) throw new Error("Campaign not found.");
  return insertCode(input);
}

export async function listPromoCodes(campaignId: string): Promise<SquarePassCode[]> {
  return listCodesForCampaign(campaignId);
}

export function isCampaignCurrentlyActive(campaign: SquarePassCampaign): boolean {
  if (!campaign.active) return false;
  const now = new Date();
  if (campaign.startsAt && new Date(campaign.startsAt) > now) return false;
  if (campaign.endsAt && new Date(campaign.endsAt) < now) return false;
  if (
    campaign.totalRedemptionLimit != null &&
    campaign.totalRedemptions >= campaign.totalRedemptionLimit
  ) {
    return false;
  }
  return true;
}
