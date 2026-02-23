import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useCreationStore,
  TOTAL_STEPS,
  getGrantedSkills,
  getAvailableClassSkills,
  getRequiredSkillCount,
} from "@/stores/creationStore";
import { SKILLS, ABILITY_NAMES, type SkillKey } from "@/types/character";
import { useTheme, useScrollToTop } from "@/hooks";
import { getCreationThemeOverrides } from "@/utils/creationStepTheme";

const CURRENT_STEP = 6;

export default function SkillsStep() {
  const scrollRef = useScrollToTop();
  const { colors, isDark } = useTheme();
  const themed = getCreationThemeOverrides(colors);
  const router = useRouter();

  const { draft, setSkillChoices, saveDraft, loadDraft } = useCreationStore();

  const [selectedSkills, setSelectedSkills] = useState<SkillKey[]>([]);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        await loadDraft();
        const currentDraft = useCreationStore.getState().draft;
        if (
          currentDraft?.skillChoices &&
          currentDraft.skillChoices.length > 0
        ) {
          setSelectedSkills([...currentDraft.skillChoices]);
        }
      };
      init();
    }, []),
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
      pathname: "/create/spells",
    });
  };

  const handleBack = () => {
    if (selectedSkills.length > 0) {
      setSkillChoices(selectedSkills);
    }
    router.back();
  };

  const progressPercent = (CURRENT_STEP / TOTAL_STEPS) * 100;

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
    <View style={[styles.container, themed.container]}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={[styles.backButton, themed.backButton]}
              onPress={handleBack}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={[styles.stepText, themed.stepText]}>
              Paso {CURRENT_STEP} de {TOTAL_STEPS}
            </Text>
            <View style={{ height: 40, width: 40 }} />
          </View>
          <View style={[styles.progressBar, themed.progressBar]}>
            <View
              style={[styles.progressFill, { width: `${progressPercent}%` }]}
            />
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="school-outline"
              size={40}
              color={colors.accentRed}
            />
          </View>
          <Text style={[styles.title, themed.title]}>
            Competencias en Habilidades
          </Text>
          <Text style={[styles.subtitle, themed.subtitle]}>
            Elige {requiredCount} habilidad{requiredCount !== 1 ? "es" : ""} de
            la lista de tu clase. Las habilidades ya otorgadas por raza y
            trasfondo aparecen marcadas.
          </Text>
        </View>

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
                      color={colors.accentGreen}
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
                    themed.card,
                    isSelected && styles.skillCardSelected,
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
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="white" />
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
                          isGranted && styles.refBadgeGranted,
                          isChosen && styles.refBadgeChosen,
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
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, themed.footer]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !isValid && [styles.nextButtonDisabled, themed.nextButtonDisabled],
          ]}
          onPress={handleNext}
          disabled={!isValid}
        >
          <Text style={styles.nextButtonText}>Siguiente: Habilidades</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#272519",
  },
  scroll: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#2E2C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    color: "#AAA37B",
    fontSize: 14,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#2E2C1E",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8f3d38",
    borderRadius: 3,
  },
  titleSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  iconCircle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: "rgba(143,61,56,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#AAA37B",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  counterRow: {
    alignItems: "center",
    marginBottom: 20,
  },
  counterBadge: {
    backgroundColor: "#323021",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#514D35",
  },
  counterText: {
    color: "#CDC9B2",
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
    backgroundColor: "rgba(34,197,94,0.07)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.3)",
  },
  grantedIcon: {
    marginRight: 12,
  },
  grantedName: {
    color: "#22c55e",
    fontSize: 15,
    fontWeight: "bold",
  },
  grantedBadge: {
    backgroundColor: "rgba(34,197,94,0.15)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  grantedBadgeText: {
    color: "#22c55e",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  emptyState: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#323021",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#514D35",
  },
  emptyText: {
    color: "#AAA37B",
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 10,
    flex: 1,
  },
  skillCard: {
    backgroundColor: "#323021",
    borderRadius: 10,
    padding: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#514D35",
  },
  skillCardSelected: {
    borderColor: "#8f3d38",
    backgroundColor: "rgba(143,61,56,0.08)",
  },
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
  checkboxSelected: {
    borderColor: "#8f3d38",
    backgroundColor: "#8f3d38",
  },
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
    color: "#AAA37B",
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
    color: "#CDC9B2",
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
    backgroundColor: "#2E2C1E",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#514D35",
  },
  refBadgeGranted: {
    borderColor: "rgba(34,197,94,0.4)",
    backgroundColor: "rgba(34,197,94,0.1)",
  },
  refBadgeChosen: {
    borderColor: "rgba(143,61,56,0.5)",
    backgroundColor: "rgba(143,61,56,0.15)",
  },
  refBadgeText: {
    color: "#807953",
    fontSize: 12,
  },
  refBadgeTextActive: {
    color: "#d9d9e6",
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#514D35",
  },
  nextButton: {
    backgroundColor: "#8f3d38",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#423E2B",
    opacity: 0.5,
  },
  nextButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
});
