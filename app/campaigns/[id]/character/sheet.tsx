/**
 * Campaign Character Sheet Screen
 *
 * Thin wrapper around `CharacterSheetBase` with:
 * - Compact header (CompactHeader)
 * - Campaign-aware character loading (resolves campaignId → personajeId)
 * - No swipe gestures or HeaderScrollProvider
 */

import { useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import { useCampaignStore } from "@/stores/campaignStore";

import {
  CharacterSheetBase,
  CompactHeader,
} from "@/components/character/sheet";
import type { TabId } from "@/components/character/sheet";

export default function CampaignCharacterSheetScreen() {
  const { id: campaignId, tab } = useLocalSearchParams<{
    id: string;
    tab?: TabId;
  }>();
  const { getCampaignById, setActiveCampaign, touchCampaign } =
    useCampaignStore();

  const onFocus = useCallback(
    (loadCharacter: (id: string) => void) => {
      const campaign = getCampaignById(campaignId);
      if (campaign) {
        setActiveCampaign(campaign.id);
        touchCampaign(campaign.id);
        if (campaign.personajeId) {
          loadCharacter(campaign.personajeId);
        }
      }
    },
    [campaignId, getCampaignById, setActiveCampaign, touchCampaign],
  );

  return (
    <CharacterSheetBase
      onFocus={onFocus}
      initialTab={tab}
      tabParam={tab}
      renderHeader={(props) => <CompactHeader {...props} />}
    />
  );
}
