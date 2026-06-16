import { isCampaignCurrentlyActive } from "./PromotionService";
import { listAutoActivateCampaigns, updateCampaign } from "./repository";

/** Auto-activate/deactivate campaigns based on date windows and admin auto_activate flag. */
export async function runCampaignScheduler(): Promise<{ activated: number; deactivated: number }> {
  const campaigns = await listAutoActivateCampaigns();
  let activated = 0;
  let deactivated = 0;

  for (const campaign of campaigns) {
    const shouldBeActive = isCampaignCurrentlyActive({ ...campaign, active: true });
    if (shouldBeActive && !campaign.active) {
      await updateCampaign(campaign.id, { active: true });
      activated += 1;
    } else if (!shouldBeActive && campaign.active) {
      await updateCampaign(campaign.id, { active: false });
      deactivated += 1;
    }
  }

  return { activated, deactivated };
}
