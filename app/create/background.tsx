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
import { useCreationStore, TOTAL_STEPS } from "@/stores/creationStore";
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
import { withAlpha } from "@/utils/theme";
import CustomBackgroundEditor from "@/components/creation/CustomBackgroundEditor";

const CURRENT_STEP = 5;

export default function BackgroundStep() {
  const scrollRef = useScrollToTop();
  const { colors, isDark } = useTheme();
  const themed = getCreationThemeOverrides(colors);
  const router = useRouter();

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
        await loadDraft();
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
    }, []),
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
      pathname: "/create/skills",
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

  const progressPercent = (CURRENT_STEP / TOTAL_STEPS) * 100;

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
            <Ionicons name="book-outline" size={40} color={colors.accentRed} />
          </View>
          <Text style={[styles.title, themed.title]}>Trasfondo</Text>
          <Text style={[styles.subtitle, themed.subtitle]}>
            El trasfondo define la historia de tu personaje antes de convertirse
            en aventurero. Otorga competencias en habilidades, herramientas e
            idiomas.
          </Text>
        </View>

        {/* Background List */}
        <View style={styles.section}>
          {backgrounds.map((bg) => {
            const isSelected = selectedBg === bg.id;
            const icon = BACKGROUND_ICONS[bg.id] ?? "📜";
            return (
              <View key={bg.id}>
                <TouchableOpacity
                  style={[
                    styles.bgCard,
                    themed.card,
                    isSelected && styles.bgCardSelected,
                  ]}
                  onPress={() => handleSelectBg(bg.id)}
                >
                  <View style={styles.bgCardRow}>
                    <View
                      style={[
                        styles.bgIcon,
                        themed.cardAlt,
                        isSelected && styles.bgIconSelected,
                      ]}
                    >
                      <Text style={styles.bgIconText}>{icon}</Text>
                    </View>
                    <View style={styles.bgInfo}>
                      <Text
                        style={[
                          styles.bgName,
                          themed.textPrimary,
                          isSelected && themed.bgNameSelected,
                        ]}
                      >
                        {bg.nombre}
                      </Text>
                      <Text
                        style={[styles.bgSkills, themed.bgSkills]}
                        numberOfLines={1}
                      >
                        {bg.skillProficiencies
                          .map((sk) => {
                            const names: Record<string, string> = {
                              perspicacia: "Perspicacia",
                              religion: "Religión",
                              engano: "Engaño",
                              juego_de_manos: "Juego de Manos",
                              sigilo: "Sigilo",
                              atletismo: "Atletismo",
                              intimidacion: "Intimidación",
                              acrobacias: "Acrobacias",
                              interpretacion: "Interpretación",
                              historia: "Historia",
                              persuasion: "Persuasión",
                              percepcion: "Percepción",
                              medicina: "Medicina",
                              naturaleza: "Naturaleza",
                              supervivencia: "Supervivencia",
                              arcanos: "Arcanos",
                              investigacion: "Investigación",
                              trato_con_animales: "Trato con Animales",
                            };
                            return names[sk] ?? sk;
                          })
                          .join(", ")}
                      </Text>
                    </View>
                    <Ionicons
                      name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                      size={24}
                      color={isSelected ? colors.accentRed : colors.textMuted}
                    />
                  </View>
                </TouchableOpacity>

                {/* Expanded details */}
                {isSelected && showDetails && currentBgData && (
                  <View style={[styles.detailsCard, themed.detailsCard]}>
                    <Text
                      style={[
                        styles.detailsDescription,
                        themed.detailsDescription,
                      ]}
                    >
                      {currentBgData.descripcion}
                    </Text>

                    {/* Proficiencies */}
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, themed.detailLabel]}>
                        Habilidades:
                      </Text>
                      <Text style={[styles.detailValue, themed.detailValue]}>
                        {currentBgData.skillProficiencies
                          .map((sk) => {
                            const names: Record<string, string> = {
                              perspicacia: "Perspicacia",
                              religion: "Religión",
                              engano: "Engaño",
                              juego_de_manos: "Juego de Manos",
                              sigilo: "Sigilo",
                              atletismo: "Atletismo",
                              intimidacion: "Intimidación",
                              acrobacias: "Acrobacias",
                              interpretacion: "Interpretación",
                              historia: "Historia",
                              persuasion: "Persuasión",
                              percepcion: "Percepción",
                              medicina: "Medicina",
                              naturaleza: "Naturaleza",
                              supervivencia: "Supervivencia",
                              arcanos: "Arcanos",
                              investigacion: "Investigación",
                              trato_con_animales: "Trato con Animales",
                            };
                            return names[sk] ?? sk;
                          })
                          .join(", ")}
                      </Text>
                    </View>

                    {currentBgData.toolProficiencies.length > 0 && (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, themed.detailLabel]}>
                          Herramientas:
                        </Text>
                        <Text style={[styles.detailValue, themed.detailValue]}>
                          {currentBgData.toolProficiencies.join(", ")}
                        </Text>
                      </View>
                    )}

                    {currentBgData.extraLanguages > 0 && (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, themed.detailLabel]}>
                          Idiomas extra:
                        </Text>
                        <Text style={[styles.detailValue, themed.detailValue]}>
                          {currentBgData.extraLanguages}
                        </Text>
                      </View>
                    )}

                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, themed.detailLabel]}>
                        Oro inicial:
                      </Text>
                      <Text style={[styles.detailValue, themed.detailValue]}>
                        {currentBgData.startingGold} po
                      </Text>
                    </View>

                    {/* Feature */}
                    <View style={[styles.featureBox, themed.featureBox]}>
                      <View style={styles.featureHeader}>
                        <Ionicons
                          name="star"
                          size={16}
                          color={colors.accentGold}
                        />
                        <Text style={[styles.featureName, themed.featureName]}>
                          {currentBgData.featureName}
                        </Text>
                      </View>
                      <Text style={[styles.featureDesc, themed.featureDesc]}>
                        {currentBgData.featureDescription}
                      </Text>
                    </View>

                    {/* Equipment */}
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, themed.detailLabel]}>
                        Equipo:
                      </Text>
                      <Text style={[styles.detailValue, themed.detailValue]}>
                        {currentBgData.equipment.join(", ")}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          {/* ── Expansiones (collapsible) ── */}
          {expansionBackgrounds.length > 0 && (
            <>
              <TouchableOpacity
                style={[
                  styles.bgCard,
                  themed.card,
                  {
                    borderColor: showExpansions
                      ? withAlpha(colors.accentPurple, 0.4)
                      : undefined,
                  },
                ]}
                onPress={() => setShowExpansions(!showExpansions)}
              >
                <View style={styles.bgCardRow}>
                  <View
                    style={[
                      styles.bgIcon,
                      { backgroundColor: withAlpha(colors.accentPurple, 0.15) },
                    ]}
                  >
                    <Text style={styles.bgIconText}>📦</Text>
                  </View>
                  <View style={styles.bgInfo}>
                    <Text
                      style={[styles.bgName, themed.textPrimary]}
                    >
                      Expansiones
                    </Text>
                    <Text style={[styles.bgSkills, themed.bgSkills]}>
                      {expansionBackgrounds.length} trasfondos adicionales
                    </Text>
                  </View>
                  <Ionicons
                    name={showExpansions ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colors.accentPurple}
                  />
                </View>
              </TouchableOpacity>

              {showExpansions &&
                expansionBackgrounds.map((bg) => {
                  const isSelected = selectedBg === bg.id;
                  const icon = BACKGROUND_ICONS[bg.id] ?? "📜";
                  return (
                    <View key={bg.id}>
                      <TouchableOpacity
                        style={[
                          styles.bgCard,
                          themed.card,
                          { marginLeft: 16 },
                          isSelected && {
                            borderColor: withAlpha(colors.accentPurple, 0.4),
                            backgroundColor: withAlpha(colors.accentPurple, 0.08),
                          },
                        ]}
                        onPress={() => handleSelectBg(bg.id)}
                      >
                        <View style={styles.bgCardRow}>
                          <View
                            style={[
                              styles.bgIcon,
                              isSelected
                                ? { backgroundColor: withAlpha(colors.accentPurple, 0.2) }
                                : themed.cardAlt,
                            ]}
                          >
                            <Text style={styles.bgIconText}>{icon}</Text>
                          </View>
                          <View style={styles.bgInfo}>
                            <Text
                              style={[
                                styles.bgName,
                                themed.textPrimary,
                                isSelected && themed.bgNameSelected,
                              ]}
                            >
                              {bg.nombre}
                            </Text>
                            <Text
                              style={[styles.bgSkills, themed.bgSkills]}
                              numberOfLines={1}
                            >
                              {bg.skillProficiencies
                                .map((sk) => {
                                  const names: Record<string, string> = {
                                    perspicacia: "Perspicacia",
                                    religion: "Religión",
                                    engano: "Engaño",
                                    juego_de_manos: "Juego de Manos",
                                    sigilo: "Sigilo",
                                    atletismo: "Atletismo",
                                    intimidacion: "Intimidación",
                                    acrobacias: "Acrobacias",
                                    interpretacion: "Interpretación",
                                    historia: "Historia",
                                    persuasion: "Persuasión",
                                    percepcion: "Percepción",
                                    medicina: "Medicina",
                                    naturaleza: "Naturaleza",
                                    supervivencia: "Supervivencia",
                                    arcanos: "Arcanos",
                                    investigacion: "Investigación",
                                    trato_con_animales: "Trato con Animales",
                                  };
                                  return names[sk] ?? sk;
                                })
                                .join(", ")}
                            </Text>
                          </View>
                          <Ionicons
                            name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                            size={24}
                            color={isSelected ? colors.accentPurple : colors.textMuted}
                          />
                        </View>
                      </TouchableOpacity>

                      {/* Expanded details for expansion bg */}
                      {isSelected && showDetails && currentBgData && (
                        <View
                          style={[
                            styles.detailsCard,
                            themed.detailsCard,
                            { marginLeft: 16 },
                          ]}
                        >
                          <Text
                            style={[
                              styles.detailsDescription,
                              themed.detailsDescription,
                            ]}
                          >
                            {currentBgData.descripcion}
                          </Text>

                          <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, themed.detailLabel]}>
                              Habilidades:
                            </Text>
                            <Text style={[styles.detailValue, themed.detailValue]}>
                              {currentBgData.skillProficiencies
                                .map((sk) => {
                                  const names: Record<string, string> = {
                                    perspicacia: "Perspicacia",
                                    religion: "Religión",
                                    engano: "Engaño",
                                    juego_de_manos: "Juego de Manos",
                                    sigilo: "Sigilo",
                                    atletismo: "Atletismo",
                                    intimidacion: "Intimidación",
                                    acrobacias: "Acrobacias",
                                    interpretacion: "Interpretación",
                                    historia: "Historia",
                                    persuasion: "Persuasión",
                                    percepcion: "Percepción",
                                    medicina: "Medicina",
                                    naturaleza: "Naturaleza",
                                    supervivencia: "Supervivencia",
                                    arcanos: "Arcanos",
                                    investigacion: "Investigación",
                                    trato_con_animales: "Trato con Animales",
                                  };
                                  return names[sk] ?? sk;
                                })
                                .join(", ")}
                            </Text>
                          </View>

                          {currentBgData.toolProficiencies.length > 0 && (
                            <View style={styles.detailRow}>
                              <Text style={[styles.detailLabel, themed.detailLabel]}>
                                Herramientas:
                              </Text>
                              <Text style={[styles.detailValue, themed.detailValue]}>
                                {currentBgData.toolProficiencies.join(", ")}
                              </Text>
                            </View>
                          )}

                          {currentBgData.extraLanguages > 0 && (
                            <View style={styles.detailRow}>
                              <Text style={[styles.detailLabel, themed.detailLabel]}>
                                Idiomas extra:
                              </Text>
                              <Text style={[styles.detailValue, themed.detailValue]}>
                                {currentBgData.extraLanguages}
                              </Text>
                            </View>
                          )}

                          <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, themed.detailLabel]}>
                              Oro inicial:
                            </Text>
                            <Text style={[styles.detailValue, themed.detailValue]}>
                              {currentBgData.startingGold} po
                            </Text>
                          </View>

                          <View style={[styles.featureBox, themed.featureBox]}>
                            <View style={styles.featureHeader}>
                              <Ionicons
                                name="star"
                                size={16}
                                color={colors.accentGold}
                              />
                              <Text style={[styles.featureName, themed.featureName]}>
                                {currentBgData.featureName}
                              </Text>
                            </View>
                            <Text style={[styles.featureDesc, themed.featureDesc]}>
                              {currentBgData.featureDescription}
                            </Text>
                          </View>

                          <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, themed.detailLabel]}>
                              Equipo:
                            </Text>
                            <Text style={[styles.detailValue, themed.detailValue]}>
                              {currentBgData.equipment.join(", ")}
                            </Text>
                          </View>
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
                <TouchableOpacity
                  style={[
                    styles.bgCard,
                    themed.card,
                    isSelected && styles.bgCardSelected,
                  ]}
                  onPress={() => handleSelectBg("personalizada" as BackgroundId)}
                >
                  <View style={styles.bgCardRow}>
                    <View
                      style={[
                        styles.bgIcon,
                        themed.cardAlt,
                        isSelected && styles.bgIconSelected,
                      ]}
                    >
                      <Text style={styles.bgIconText}>✏️</Text>
                    </View>
                    <View style={styles.bgInfo}>
                      <Text
                        style={[
                          styles.bgName,
                          themed.textPrimary,
                          isSelected && themed.bgNameSelected,
                        ]}
                      >
                        Personalizada
                      </Text>
                      <Text
                        style={[styles.bgSkills, themed.bgSkills]}
                        numberOfLines={1}
                      >
                        Crea tu propio trasfondo
                      </Text>
                    </View>
                    <Ionicons
                      name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                      size={24}
                      color={isSelected ? colors.accentRed : colors.textMuted}
                    />
                  </View>
                </TouchableOpacity>

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
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, themed.footer]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !canProceed && [
              styles.nextButtonDisabled,
              themed.nextButtonDisabled,
            ],
          ]}
          onPress={handleNext}
          disabled={!canProceed}
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
    marginBottom: 24,
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
  section: {
    paddingHorizontal: 20,
  },
  bgCard: {
    backgroundColor: "#323021",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#514D35",
    padding: 14,
    marginBottom: 8,
  },
  bgCardSelected: {
    borderColor: "#8f3d38",
    backgroundColor: "rgba(143,61,56,0.08)",
  },
  bgCardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bgIcon: {
    height: 48,
    width: 48,
    borderRadius: 12,
    backgroundColor: "#2E2C1E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  bgIconSelected: {
    backgroundColor: "rgba(143,61,56,0.2)",
  },
  bgIconText: {
    fontSize: 24,
  },
  bgInfo: {
    flex: 1,
  },
  bgName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  bgSkills: {
    color: "#AAA37B",
    fontSize: 13,
  },
  detailsCard: {
    backgroundColor: "#2E2C1E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginTop: -4,
    borderWidth: 1,
    borderColor: "#514D35",
  },
  detailsDescription: {
    color: "#D4D1BD",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    color: "#CDC9B2",
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
    backgroundColor: "#323021",
    borderRadius: 10,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#514D35",
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  featureName: {
    color: "#CDC9B2",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
  },
  featureDesc: {
    color: "#D4D1BD",
    fontSize: 13,
    lineHeight: 18,
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
