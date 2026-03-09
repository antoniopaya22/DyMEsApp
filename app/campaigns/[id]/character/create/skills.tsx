import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useCreationStore,
  getGrantedSkills,
  getAvailableClassSkills,
  getRequiredSkillCount,
} from "@/stores/creationStore";
import { SKILLS, ABILITY_NAMES, type SkillKey } from "@/types/character";
import { useTheme, useScrollToTop } from "@/hooks";
import { getCreationThemeOverrides } from "@/utils/creationStepTheme";
import { WizardStepLayout } from "@/components/creation";

const CURRENT_STEP = 6;

export default function SkillsStep() {
  const scrollRef = useScrollToTop();
  const { colors, isDark } = useTheme();
  const themed = getCreationThemeOverrides(colors);
  const router = useRouter();
  const { id: campaignId } = useLocalSearchParams<{ id: string }>();

  const { draft, setSkillChoices, saveDraft, loadDraft } = useCreationStore();

  const [selectedSkills, setSelectedSkills] = useState<SkillKey[]>([]);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        if (!campaignId) return;
        await loadDraft(campaignId);
        const currentDraft = useCreationStore.getState().draft;
        if (
          currentDraft?.skillChoices &&
          currentDraft.skillChoices.length > 0
        ) {
          setSelectedSkills([...currentDraft.skillChoices]);
        }
      };
      init();
    }, [campaignId]),
  );

  const classId = draft?.clase;
  const raceId = draft?.raza;
  const backgroundId = draft?.trasfondo;
  const customBgData = draft?.customBackgroundData;

  // Skills already granted by race and background
  const grantedSkills = getGrantedSkills(raceId, backgroundId, customBgData);

  // Skills available to pick from class pool (excluding granted)
  const availableClassSkills: SkillKey[] = classId
    ? getAvailableClassSkills(classId, raceId, backgroundId, customBgData)
    : [];

  // How many skills the player must choose
  const requiredCount = getRequiredSkillCount(classId, raceId);

  const isValid = selectedSkills.length === requiredCount;

  const handleToggleSkill = (skill: SkillKey) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skill)) {
        return prev.filter((s) => s !== skill);
      }
      if (prev.length >= requiredCount) {
        return prev;
      }
      return [...prev, skill];
    });
  };

  const handleNext = async () => {
    if (!isValid) return;
    setSkillChoices(selectedSkills);
    await saveDraft();
    router.push({
      pathname: "/campaigns/[id]/character/create/spells",
      params: { id: campaignId },
    });
  };

  const handleBack = () => {
    if (selectedSkills.length > 0) {
      setSkillChoices(selectedSkills);
    }
    router.back();
  };

  // Group skills by ability
  const skillsByAbility: Record<
    string,
    { key: SkillKey; def: (typeof SKILLS)[SkillKey] }[]
  > = {};
  const allSkillKeys = Object.keys(SKILLS) as SkillKey[];
  for (const key of allSkillKeys) {
    const def = SKILLS[key];
    const abilityName = ABILITY_NAMES[def.habilidad];
    if (!skillsByAbility[abilityName]) {
      skillsByAbility[abilityName] = [];
    }
    skillsByAbility[abilityName].push({ key, def });
  }

  return (
    <WizardStepLayout
      currentStep={CURRENT_STEP}
      title="Competencias en Habilidades"
      subtitle={`Elige ${requiredCount} habilidad${requiredCount !== 1 ? "es" : ""} de la lista de tu clase. Las habilidades ya otorgadas por raza y trasfondo aparecen marcadas.`}
      iconName="school-outline"
      nextLabel="Siguiente: Hechizos"
      canProceed={isValid}
      onNext={handleNext}
      onBack={handleBack}
      scrollRef={scrollRef}
    >
        {/* Selection counter */}
        <View style={styles.counterRow}>
          <View style={[styles.counterBadge, themed.card]}>
            <Text
              style={[styles.counterText, themed.counterText, isValid && [styles.counterTextValid, themed.counterTextValid]]}
            >
              {selectedSkills.length} / {requiredCount} seleccionadas
            </Text>
          </View>
        </View>

        {/* Granted skills */}
        {grantedSkills.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, themed.sectionTitle]}>
              Habilidades Otorgadas (Raza / Trasfondo)
            </Text>
            {grantedSkills.map((sk) => {
              const def = SKILLS[sk];
              return (
                <View key={sk} style={[styles.grantedRow, themed.grantedRow]}>
                  <View style={styles.grantedIcon}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.accentGold}
                    />
                  </View>
                  <View style={styles.skillInfo}>
                    <Text style={[styles.grantedName, themed.grantedName]}>
                      {def.nombre}
                    </Text>
                    <Text style={[styles.skillAbility, themed.textMuted]}>
                      {ABILITY_NAMES[def.habilidad]}
                    </Text>
                  </View>
                  <View style={[styles.grantedBadge, themed.grantedBadge]}>
                    <Text
                      style={[styles.grantedBadgeText, themed.grantedBadgeText]}
                    >
                      Otorgada
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Available class skills */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, themed.sectionTitle]}>
            Habilidades de Clase Disponibles
          </Text>
          {availableClassSkills.length === 0 ? (
            <View style={[styles.emptyState, themed.emptyState]}>
              <Ionicons
                name="information-circle"
                size={24}
                color={colors.textMuted}
              />
              <Text style={[styles.emptyText, themed.emptyText]}>
                No hay habilidades disponibles para elegir. Esto puede ocurrir
                si todas ya fueron otorgadas por raza y trasfondo.
              </Text>
            </View>
          ) : (
            availableClassSkills.map((sk) => {
              const def = SKILLS[sk];
              const isSelected = selectedSkills.includes(sk);
              const isDisabled =
                !isSelected && selectedSkills.length >= requiredCount;

              return (
                <TouchableOpacity
                  key={sk}
                  style={[
                    styles.skillCard,
                    themed.cardElevated,
                    isSelected && themed.chipSelected,
                    isDisabled && styles.skillCardDisabled,
                  ]}
                  onPress={() => handleToggleSkill(sk)}
                  disabled={isDisabled && !isSelected}
                >
                  <View style={styles.skillCardRow}>
                    <View
                      style={[
                        styles.checkbox,
                        themed.checkbox,
                        isSelected && { borderColor: colors.accentRed, backgroundColor: colors.accentRed },
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color={colors.textInverted} />
                      )}
                    </View>
                    <View style={styles.skillInfo}>
                      <Text
                        style={[
                          styles.skillName,
                          themed.textPrimary,
                          isSelected && styles.skillNameSelected,
                        ]}
                      >
                        {def.nombre}
                      </Text>
                      <Text style={[styles.skillAbility, themed.textMuted]}>
                        {ABILITY_NAMES[def.habilidad]}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* All skills reference (collapsed) */}
        <View style={styles.section}>
          <Text style={[styles.refTitle, themed.refTitle]}>
            Referencia: Todas las Habilidades
          </Text>
          {Object.entries(skillsByAbility)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([abilityName, skills]) => (
              <View key={abilityName} style={styles.refGroup}>
                <Text style={[styles.refAbility, themed.textAccent]}>
                  {abilityName}
                </Text>
                <View style={styles.refSkillRow}>
                  {skills.map(({ key, def }) => {
                    const isGranted = grantedSkills.includes(key);
                    const isChosen = selectedSkills.includes(key);
                    return (
                      <View
                        key={key}
                        style={[
                          styles.refBadge,
                          themed.refBadge,
                          (isGranted || isChosen) && themed.chipSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.refBadgeText,
                            themed.refBadgeText,
                            (isGranted || isChosen) && [
                              styles.refBadgeTextActive,
                              themed.refBadgeTextActive,
                            ],
                          ]}
                        >
                          {def.nombre}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
        </View>
    </WizardStepLayout>
  );
}

const styles = StyleSheet.create({
  counterRow: {
    alignItems: "center",
    marginBottom: 20,
  },
  counterBadge: {
    backgroundColor: "#101B2E",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#1E2D42",
  },
  counterText: {
    color: "#00E5FF",
    fontSize: 15,
    fontWeight: "bold",
  },
  counterTextValid: {
    color: "#22c55e",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#d9d9e6",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  grantedRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(128,121,83,0.07)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(128,121,83,0.3)",
  },
  grantedIcon: {
    marginRight: 12,
  },
  grantedName: {
    color: "#807953",
    fontSize: 15,
    fontWeight: "bold",
  },
  grantedBadge: {
    backgroundColor: "rgba(128,121,83,0.15)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  grantedBadgeText: {
    color: "#807953",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  emptyState: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#101B2E",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1E2D42",
  },
  emptyText: {
    color: "#8899AA",
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 10,
    flex: 1,
  },
  skillCard: {
    backgroundColor: "#182338",
    borderRadius: 10,
    padding: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#2A3A52",
  },
  // skillCardSelected → themed.chipSelected
  skillCardDisabled: {
    opacity: 0.4,
  },
  skillCardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    height: 28,
    width: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#807953",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  // checkboxSelected → inline { borderColor: colors.accentRed, backgroundColor: colors.accentRed }
  skillInfo: {
    flex: 1,
  },
  skillName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  skillNameSelected: {
    color: "#ffffff",
  },
  skillAbility: {
    color: "#8899AA",
    fontSize: 13,
  },
  refTitle: {
    color: "#807953",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  refGroup: {
    marginBottom: 10,
  },
  refAbility: {
    color: "#00E5FF",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  refSkillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  refBadge: {
    backgroundColor: "#101B2E",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#1E2D42",
  },
  // refBadgeGranted / refBadgeChosen → themed.chipSelected
  refBadgeText: {
    color: "#807953",
    fontSize: 12,
  },
  refBadgeTextActive: {
    color: "#d9d9e6",
    fontWeight: "600",
  },
});
