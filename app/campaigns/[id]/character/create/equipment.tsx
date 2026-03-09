import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCreationStore } from "@/stores/creationStore";
import { getClassData, getBackgroundData } from "@/data/srd";
import type { EquipmentChoice } from "@/data/srd";
import { useTheme, useScrollToTop } from "@/hooks";
import { getCreationThemeOverrides } from "@/utils/creationStepTheme";
import WizardStepLayout from "@/components/creation/WizardStepLayout";

const CURRENT_STEP = 8;

export default function EquipmentStep() {
  const scrollRef = useScrollToTop();
  const { colors, isDark } = useTheme();
  const themed = getCreationThemeOverrides(colors);
  const router = useRouter();
  const { id: campaignId } = useLocalSearchParams<{ id: string }>();

  const { draft, setEquipmentChoices, saveDraft, loadDraft } =
    useCreationStore();

  const [choices, setChoices] = useState<Record<string, string>>({});

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        if (!campaignId) return;
        await loadDraft(campaignId);
        const currentDraft = useCreationStore.getState().draft;
        if (currentDraft?.equipmentChoices) {
          setChoices({ ...currentDraft.equipmentChoices });
        }
      };
      init();
    }, [campaignId]),
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
      pathname: "/campaigns/[id]/character/create/personality",
      params: { id: campaignId },
    });
  };

  const handleBack = () => {
    if (Object.keys(choices).length > 0) {
      setEquipmentChoices(choices);
    }
    router.back();
  };

  return (
    <WizardStepLayout
      currentStep={CURRENT_STEP}
      title="Equipamiento Inicial"
      subtitle="Elige tu equipamiento de partida según las opciones de tu clase. También recibirás equipo de tu trasfondo."
      iconName="bag-outline"
      nextLabel="Siguiente: Personalidad"
      canProceed={isValid}
      onNext={handleNext}
      onBack={handleBack}
      scrollRef={scrollRef}
    >
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
                          themed.cardElevated,
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
            <View style={[styles.includedCard, themed.cardElevated]}>
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
            <View style={[styles.includedCard, themed.cardElevated]}>
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
    </WizardStepLayout>
  );
}

const styles = StyleSheet.create({
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
    color: "#00E5FF",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
  },
  optionCard: {
    backgroundColor: "#182338",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2A3A52",
  },
  optionCardSelected: {
    borderColor: "#00BCD4",
    backgroundColor: "rgba(0,188,212,0.08)",
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
    borderColor: "#00BCD4",
  },
  radioInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#00BCD4",
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
    color: "#8899AA",
    fontSize: 13,
    lineHeight: 18,
  },
  includedCard: {
    backgroundColor: "#182338",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2A3A52",
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
    backgroundColor: "rgba(0,229,255,0.1)",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0,229,255,0.2)",
  },
  hintText: {
    color: "#d9d9e6",
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 10,
    flex: 1,
  },
});
