import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCreationStore } from "@/stores/creationStore";
import {
  getBackgroundList,
  getBackgroundData,
  BACKGROUND_ICONS,
  EXPANSION_BACKGROUND_IDS,
  type BackgroundData,
} from "@/data/srd";
import type { BackgroundId } from "@/types/character";
import type { CustomBackgroundConfig } from "@/types/creation";
import { useTheme, useScrollToTop } from "@/hooks";
import { getCreationThemeOverrides } from "@/utils/creationStepTheme";

import { formatSkillName } from "@/components/compendium";
import CustomBackgroundEditor from "@/components/creation/CustomBackgroundEditor";
import SelectionCard, { ExpansionToggleCard } from "@/components/creation/SelectionCard";
import WizardStepLayout from "@/components/creation/WizardStepLayout";

const CURRENT_STEP = 5;

export default function BackgroundStep() {
  const scrollRef = useScrollToTop();
  const { colors, isDark } = useTheme();
  const themed = getCreationThemeOverrides(colors);
  const router = useRouter();
  const { id: campaignId } = useLocalSearchParams<{ id: string }>();

  const { draft, setTrasfondo, setCustomBackgroundData, saveDraft, loadDraft } = useCreationStore();

  const [selectedBg, setSelectedBg] = useState<BackgroundId | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [customData, setCustomData] = useState<CustomBackgroundConfig | undefined>(undefined);
  const [showExpansions, setShowExpansions] = useState(
    draft?.trasfondo ? EXPANSION_BACKGROUND_IDS.includes(draft.trasfondo) : false,
  );

  const allBackgrounds = getBackgroundList();
  const backgrounds = allBackgrounds.filter((bg) => !EXPANSION_BACKGROUND_IDS.includes(bg.id));
  const expansionBackgrounds = allBackgrounds.filter((bg) => EXPANSION_BACKGROUND_IDS.includes(bg.id));

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        if (!campaignId) return;
        await loadDraft(campaignId);
        const currentDraft = useCreationStore.getState().draft;
        if (currentDraft?.trasfondo) {
          setSelectedBg(currentDraft.trasfondo);
          if (EXPANSION_BACKGROUND_IDS.includes(currentDraft.trasfondo)) {
            setShowExpansions(true);
          }
          if (currentDraft.trasfondo === "personalizada" && currentDraft.customBackgroundData) {
            setCustomData(currentDraft.customBackgroundData);
            setShowDetails(true);
          }
        }
      };
      init();
    }, [campaignId]),
  );

  const currentBgData: BackgroundData | null = selectedBg
    ? selectedBg === "personalizada"
      ? null
      : getBackgroundData(selectedBg)
    : null;

  const isCustomValid = selectedBg === "personalizada" && customData && customData.nombre.trim().length >= 1;
  const canProceed = selectedBg
    ? selectedBg === "personalizada" ? !!isCustomValid : true
    : false;

  const handleSelectBg = (bgId: BackgroundId) => {
    if (selectedBg === bgId) {
      setShowDetails(!showDetails);
    } else {
      setSelectedBg(bgId);
      setShowDetails(true);
    }
  };

  const handleNext = async () => {
    if (!selectedBg) return;
    setTrasfondo(selectedBg);
    if (selectedBg === "personalizada" && customData) {
      setCustomBackgroundData(customData);
    }
    await saveDraft();
    router.push({
      pathname: "/campaigns/[id]/character/create/skills",
      params: { id: campaignId },
    });
  };

  const handleBack = () => {
    if (selectedBg) {
      setTrasfondo(selectedBg);
      if (selectedBg === "personalizada" && customData) {
        setCustomBackgroundData(customData);
      }
    }
    router.back();
  };

  return (
    <WizardStepLayout
      currentStep={CURRENT_STEP}
      title="Trasfondo"
      subtitle="El trasfondo define la historia de tu personaje antes de convertirse en aventurero. Otorga competencias en habilidades, herramientas e idiomas."
      iconName="book-outline"
      nextLabel="Siguiente: Habilidades"
      canProceed={canProceed}
      onNext={handleNext}
      onBack={handleBack}
      scrollRef={scrollRef}
    >
        {/* Background List */}
        <View className="px-5">
          {backgrounds.map((bg) => {
            const isSelected = selectedBg === bg.id;
            const icon = BACKGROUND_ICONS[bg.id] ?? "document-text-outline";
            return (
              <View key={bg.id}>
                <SelectionCard
                  iconName={icon}
                  title={bg.nombre}
                  subtitle={bg.skillProficiencies.map(formatSkillName).join(", ")}
                  isSelected={isSelected}
                  onPress={() => handleSelectBg(bg.id)}
                />

                {/* Expanded details */}
                {isSelected && showDetails && currentBgData && (
                  <BackgroundDetails data={currentBgData} colors={colors} themed={themed} />
                )}
              </View>
            );
          })}

          {/* ── Expansiones (collapsible) ── */}
          {expansionBackgrounds.length > 0 && (
            <>
              <ExpansionToggleCard
                isExpanded={showExpansions}
                onToggle={() => setShowExpansions(!showExpansions)}
                subtitle={`${expansionBackgrounds.length} trasfondos adicionales`}
              />

              {showExpansions &&
                expansionBackgrounds.map((bg) => {
                  const isSelected = selectedBg === bg.id;
                  const icon = BACKGROUND_ICONS[bg.id] ?? "document-text-outline";
                  return (
                    <View key={bg.id}>
                      <SelectionCard
                        iconName={icon}
                        title={bg.nombre}
                        subtitle={bg.skillProficiencies.map(formatSkillName).join(", ")}
                        isSelected={isSelected}
                        onPress={() => handleSelectBg(bg.id)}
                        indented
                      />

                      {/* Expanded details for expansion bg */}
                      {isSelected && showDetails && currentBgData && (
                        <View style={{ marginLeft: 16 }}>
                          <BackgroundDetails data={currentBgData} colors={colors} themed={themed} />
                        </View>
                      )}
                    </View>
                  );
                })}
            </>
          )}

          {/* ── Personalizada ── */}
          {(() => {
            const isSelected = selectedBg === "personalizada";
            return (
              <View>
                <SelectionCard
                  iconName="create-outline"
                  title="Personalizada"
                  subtitle="Crea tu propio trasfondo"
                  isSelected={isSelected}
                  onPress={() => handleSelectBg("personalizada" as BackgroundId)}
                />

                {isSelected && showDetails && (
                  <View style={[styles.detailsCard, themed.detailsCard]}>
                    <CustomBackgroundEditor
                      initialData={customData}
                      onChange={(data) => setCustomData(data)}
                    />
                  </View>
                )}
              </View>
            );
          })()}
        </View>
    </WizardStepLayout>
  );
}

// ─── Background Details (extracted to reduce duplication) ────────────

interface BackgroundDetailsProps {
  data: BackgroundData;
  colors: ReturnType<typeof useTheme>["colors"];
  themed: ReturnType<typeof getCreationThemeOverrides>;
}

function BackgroundDetails({ data, colors, themed }: BackgroundDetailsProps) {
  return (
    <View style={[styles.detailsCard, themed.detailsCard]}>
      <Text style={[styles.detailsDescription, themed.detailsDescription]}>
        {data.descripcion}
      </Text>

      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, themed.detailLabel]}>Habilidades:</Text>
        <Text style={[styles.detailValue, themed.detailValue]}>
          {data.skillProficiencies.map(formatSkillName).join(", ")}
        </Text>
      </View>

      {data.toolProficiencies.length > 0 && (
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, themed.detailLabel]}>Herramientas:</Text>
          <Text style={[styles.detailValue, themed.detailValue]}>
            {data.toolProficiencies.join(", ")}
          </Text>
        </View>
      )}

      {data.extraLanguages > 0 && (
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, themed.detailLabel]}>Idiomas extra:</Text>
          <Text style={[styles.detailValue, themed.detailValue]}>{data.extraLanguages}</Text>
        </View>
      )}

      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, themed.detailLabel]}>Oro inicial:</Text>
        <Text style={[styles.detailValue, themed.detailValue]}>{data.startingGold} po</Text>
      </View>

      <View style={[styles.featureBox, themed.featureBox]}>
        <View style={styles.featureHeader}>
          <Ionicons name="star" size={16} color={colors.accentGold} />
          <Text style={[styles.featureName, themed.featureName]}>{data.featureName}</Text>
        </View>
        <Text style={[styles.featureDesc, themed.featureDesc]}>{data.featureDescription}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, themed.detailLabel]}>Equipo:</Text>
        <Text style={[styles.detailValue, themed.detailValue]}>{data.equipment.join(", ")}</Text>
      </View>
    </View>
  );
}

// ─── Styles (header, footer, detail expansion — cards moved to SelectionCard) ─

const styles = StyleSheet.create({
  detailsCard: {
    backgroundColor: "#101B2E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginTop: -4,
    borderWidth: 1,
    borderColor: "#1E2D42",
  },
  detailsDescription: {
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    color: "#00E5FF",
    fontSize: 13,
    fontWeight: "700",
    minWidth: 110,
  },
  detailValue: {
    color: "#d9d9e6",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  featureBox: {
    backgroundColor: "#101B2E",
    borderRadius: 10,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#1E2D42",
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  featureName: {
    color: "#00E5FF",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
  },
  featureDesc: {
    color: "#CBD5E1",
    fontSize: 13,
    lineHeight: 18,
  },
});
