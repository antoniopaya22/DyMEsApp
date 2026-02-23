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
import { getClassData, getBackgroundData } from "@/data/srd";
import type { EquipmentChoice } from "@/data/srd";
import { useTheme, useScrollToTop } from "@/hooks";
import { getCreationThemeOverrides } from "@/utils/creationStepTheme";

const CURRENT_STEP = 8;

export default function EquipmentStep() {
  const scrollRef = useScrollToTop();
  const { colors, isDark } = useTheme();
  const themed = getCreationThemeOverrides(colors);
  const router = useRouter();

  const { draft, setEquipmentChoices, saveDraft, loadDraft } =
    useCreationStore();

  const [choices, setChoices] = useState<Record<string, string>>({});

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        await loadDraft();
        const currentDraft = useCreationStore.getState().draft;
        if (currentDraft?.equipmentChoices) {
          setChoices({ ...currentDraft.equipmentChoices });
        }
      };
      init();
    }, []),
  );

  const classId = draft?.clase;
  const backgroundId = draft?.trasfondo;
  const classData = classId ? getClassData(classId) : null;
  const backgroundData = backgroundId ? getBackgroundData(backgroundId) : null;

  const equipmentChoices: EquipmentChoice[] = classData?.equipmentChoices ?? [];
  const defaultEquipment: string[] = classData?.defaultEquipment ?? [];
  const backgroundEquipment: string[] = backgroundData?.equipment ?? [];
  const backgroundGold: number = backgroundData?.startingGold ?? 0;

  const isValid = equipmentChoices.every((ec) => !!choices[ec.id]);

  const handleSelect = (choiceId: string, optionId: string) => {
    setChoices((prev) => ({ ...prev, [choiceId]: optionId }));
  };

  const handleNext = async () => {
    if (!isValid) return;
    setEquipmentChoices(choices);
    await saveDraft();
    router.push({
      pathname: "/create/personality",
    });
  };

  const handleBack = () => {
    if (Object.keys(choices).length > 0) {
      setEquipmentChoices(choices);
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
            <Ionicons name="bag-outline" size={40} color={colors.accentRed} />
          </View>
          <Text style={[styles.title, themed.title]}>Equipamiento Inicial</Text>
          <Text style={[styles.subtitle, themed.subtitle]}>
            Elige tu equipamiento de partida según las opciones de tu clase.
            También recibirás equipo de tu trasfondo.
          </Text>
        </View>

        {/* Equipment Choices */}
        {equipmentChoices.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, themed.sectionTitle]}>
              Opciones de Clase
            </Text>

            {equipmentChoices.map((ec) => {
              const selectedOption = choices[ec.id];

              return (
                <View key={ec.id} style={styles.choiceGroup}>
                  <Text style={[styles.choiceLabel, themed.choiceLabel]}>
                    {ec.label}
                  </Text>
                  {ec.options.map((option) => {
                    const isSelected = selectedOption === option.id;

                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.optionCard,
                          themed.card,
                          isSelected && styles.optionCardSelected,
                        ]}
                        onPress={() => handleSelect(ec.id, option.id)}
                      >
                        <View style={styles.optionRow}>
                          <View
                            style={[
                              styles.radio,
                              themed.radio,
                              isSelected && styles.radioSelected,
                            ]}
                          >
                            {isSelected && <View style={styles.radioInner} />}
                          </View>
                          <View style={styles.optionInfo}>
                            <Text
                              style={[
                                styles.optionLabel,
                                themed.textPrimary,
                                isSelected && themed.optionLabelSelected,
                              ]}
                            >
                              {option.label}
                            </Text>
                            <Text
                              style={[styles.optionItems, themed.textSecondary]}
                              numberOfLines={2}
                            >
                              {option.items.join(", ")}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        )}

        {/* Default class equipment */}
        {defaultEquipment.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, themed.sectionTitle]}>
              Equipo Incluido (Clase)
            </Text>
            <View style={[styles.includedCard, themed.card]}>
              {defaultEquipment.map((item, index) => (
                <View key={index} style={styles.includedRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={colors.accentGreen}
                  />
                  <Text style={[styles.includedText, themed.textPrimary]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Background equipment */}
        {(backgroundEquipment.length > 0 || backgroundGold > 0) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, themed.sectionTitle]}>
              Equipo de Trasfondo ({backgroundData?.nombre ?? "Trasfondo"})
            </Text>
            <View style={[styles.includedCard, themed.card]}>
              {backgroundEquipment.map((item, index) => (
                <View key={index} style={styles.includedRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={colors.accentGold}
                  />
                  <Text style={[styles.includedText, themed.textPrimary]}>
                    {item}
                  </Text>
                </View>
              ))}
              {backgroundGold > 0 && (
                <View style={styles.includedRow}>
                  <Ionicons
                    name="cash-outline"
                    size={18}
                    color={colors.accentGold}
                  />
                  <Text style={[styles.includedText, themed.textPrimary]}>
                    {backgroundGold} po (piezas de oro)
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Summary hint */}
        <View style={styles.section}>
          <View style={[styles.hintBox, themed.hintBox]}>
            <Ionicons
              name="information-circle"
              size={20}
              color={colors.accentGold}
            />
            <Text style={[styles.hintText, themed.hintText]}>
              Podrás gestionar tu inventario completo desde la hoja de personaje
              una vez finalizada la creación.
            </Text>
          </View>
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
          <Text style={styles.nextButtonText}>Siguiente: Personalidad</Text>
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
  choiceGroup: {
    marginBottom: 16,
  },
  choiceLabel: {
    color: "#CDC9B2",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
  },
  optionCard: {
    backgroundColor: "#323021",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#514D35",
  },
  optionCardSelected: {
    borderColor: "#8f3d38",
    backgroundColor: "rgba(143,61,56,0.08)",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  radio: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#807953",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  radioSelected: {
    borderColor: "#8f3d38",
  },
  radioInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#8f3d38",
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: "#ffffff", // overridden by themed.optionLabelSelected
  },
  optionItems: {
    color: "#AAA37B",
    fontSize: 13,
    lineHeight: 18,
  },
  includedCard: {
    backgroundColor: "#323021",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#514D35",
  },
  includedRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  includedText: {
    color: "#d9d9e6",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 19,
  },
  hintBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(178,172,136,0.1)",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(178,172,136,0.2)",
  },
  hintText: {
    color: "#d9d9e6",
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 10,
    flex: 1,
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
