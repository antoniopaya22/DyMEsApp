import { useCallback } from "react";
import { useRouter, useLocalSearchParams, useSegments } from "expo-router";

/**
 * Wizard step names matching the file-based route names.
 * Used by `pushStep` to build the correct navigation path.
 */
export type WizardStep =
  | "index"
  | "race"
  | "class"
  | "abilities"
  | "background"
  | "skills"
  | "spells"
  | "equipment"
  | "personality"
  | "appearance"
  | "summary";

interface CreationNavigation {
  /** Campaign ID when in campaign mode, undefined for standalone */
  campaignId: string | undefined;
  /** Whether the wizard is running inside a campaign context */
  isCampaignMode: boolean;
  /** Navigate forward to the given wizard step */
  pushStep: (step: WizardStep) => void;
  /** Navigate back to the previous screen */
  goBack: () => void;
  /** Replace current screen after character creation is complete */
  replaceAfterCreation: (characterId: string) => void;
}

/**
 * Abstracts navigation differences between standalone (`/create/…`) and
 * campaign-scoped (`/campaigns/[id]/character/create/…`) character creation.
 *
 * Auto-detects mode by checking for a campaign `id` param in the route.
 * Every step component uses this instead of building paths directly.
 */
export function useCreationNavigation(): CreationNavigation {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const segments = useSegments();

  const isCampaignMode = (segments as string[]).includes("campaigns") && !!id;
  const campaignId = isCampaignMode ? id : undefined;

  const pushStep = useCallback(
    (step: WizardStep) => {
      if (isCampaignMode) {
        router.push({
          pathname: `/campaigns/[id]/character/create/${step}` as any,
          params: { id: campaignId },
        });
      } else {
        router.push(`/create/${step}` as any);
      }
    },
    [router, isCampaignMode, campaignId],
  );

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const replaceAfterCreation = useCallback(
    (characterId: string) => {
      if (isCampaignMode) {
        router.replace(`/campaigns/${campaignId}/character/sheet` as any);
      } else {
        router.replace(`/character/${characterId}` as any);
      }
    },
    [router, isCampaignMode, campaignId],
  );

  return {
    campaignId,
    isCampaignMode,
    pushStep,
    goBack,
    replaceAfterCreation,
  };
}
