import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCreationStore } from "@/stores/creationStore";
import type { Appearance } from "@/types/character";
import { useTheme, useScrollToTop, useCreationNavigation } from "@/hooks";
import { getCreationThemeOverrides } from "@/utils/creationStepTheme";
import WizardStepLayout from "@/components/creation/WizardStepLayout";

const CURRENT_STEP = 10;

export default function AppearanceStep() {
  const scrollRef = useScrollToTop();
  const { colors } = useTheme();
  const themed = getCreationThemeOverrides(colors);
  const { campaignId, pushStep, goBack } = useCreationNavigation();

  const { draft, setAppearance, saveDraft, loadDraft } = useCreationStore();

  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [eyeColor, setEyeColor] = useState("");
  const [hairColor, setHairColor] = useState("");
  const [skinColor, setSkinColor] = useState("");
  const [description, setDescription] = useState("");

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        await loadDraft(campaignId);
        const currentDraft = useCreationStore.getState().draft;
        if (currentDraft?.appearance) {
          const a = currentDraft.appearance;
          setAge(a.age ?? "");
          setHeight(a.height ?? "");
          setWeight(a.weight ?? "");
          setEyeColor(a.eyeColor ?? "");
          setHairColor(a.hairColor ?? "");
          setSkinColor(a.skinColor ?? "");
          setDescription(a.description ?? "");
        }
      };
      init();
    }, [campaignId]),
  );

  const buildAppearance = (): Appearance => ({
    age: age.trim() || undefined,
    height: height.trim() || undefined,
    weight: weight.trim() || undefined,
    eyeColor: eyeColor.trim() || undefined,
    hairColor: hairColor.trim() || undefined,
    skinColor: skinColor.trim() || undefined,
    description: description.trim() || undefined,
  });

  const handleNext = async () => {
    setAppearance(buildAppearance());
    await saveDraft();
    pushStep("summary");
  };

  const handleBack = () => {
    setAppearance(buildAppearance());
    goBack();
  };

  const QUICK_COLORS = [
    { label: "Negro", value: "Negro" },
    { label: "Castaño", value: "Castaño" },
    { label: "Rubio", value: "Rubio" },
    { label: "Pelirrojo", value: "Pelirrojo" },
    { label: "Blanco", value: "Blanco" },
    { label: "Gris", value: "Gris" },
    { label: "Azul", value: "Azul" },
    { label: "Verde", value: "Verde" },
  ];

  const QUICK_EYE_COLORS = [
    { label: "Marrón", value: "Marrón" },
    { label: "Azul", value: "Azul" },
    { label: "Verde", value: "Verde" },
    { label: "Gris", value: "Gris" },
    { label: "Avellana", value: "Avellana" },
    { label: "Negro", value: "Negro" },
    { label: "Ámbar", value: "Ámbar" },
    { label: "Rojo", value: "Rojo" },
    { label: "Violeta", value: "Violeta" },
  ];

  return (
    <WizardStepLayout
      currentStep={CURRENT_STEP}
      title="Apariencia"
      subtitle="Describe el aspecto físico de tu personaje. Todos los campos son opcionales — puedes completarlos más adelante desde la hoja de personaje."
      iconName="body-outline"
      nextLabel="Siguiente: Resumen Final"
      canProceed={true}
      onNext={handleNext}
      onBack={handleBack}
      scrollRef={scrollRef}
      keyboardShouldPersistTaps="handled"
    >
      {/* Quick fields in a grid */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, themed.sectionTitle]}>
          Datos Físicos
        </Text>

        <View style={styles.fieldGrid}>
          {/* Age */}
          <View style={styles.fieldHalf}>
            <Text style={[styles.fieldLabel, themed.textPrimary]}>Edad</Text>
            <TextInput
              style={[styles.input, themed.input]}
              placeholder="Ej: 25 años"
              placeholderTextColor={colors.textMuted}
              value={age}
              onChangeText={setAge}
              maxLength={30}
            />
          </View>

          {/* Height */}
          <View style={styles.fieldHalf}>
            <Text style={[styles.fieldLabel, themed.textPrimary]}>Altura</Text>
            <TextInput
              style={[styles.input, themed.input]}
              placeholder="Ej: 1,75 m"
              placeholderTextColor={colors.textMuted}
              value={height}
              onChangeText={setHeight}
              maxLength={30}
            />
          </View>
        </View>

        <View style={styles.fieldGrid}>
          {/* Weight */}
          <View style={styles.fieldHalf}>
            <Text style={[styles.fieldLabel, themed.textPrimary]}>Peso</Text>
            <TextInput
              style={[styles.input, themed.input]}
              placeholder="Ej: 70 kg"
              placeholderTextColor={colors.textMuted}
              value={weight}
              onChangeText={setWeight}
              maxLength={30}
            />
          </View>

          {/* Skin Color */}
          <View style={styles.fieldHalf}>
            <Text style={[styles.fieldLabel, themed.textPrimary]}>Piel</Text>
            <TextInput
              style={[styles.input, themed.input]}
              placeholder="Ej: Clara"
              placeholderTextColor={colors.textMuted}
              value={skinColor}
              onChangeText={setSkinColor}
              maxLength={40}
            />
          </View>
        </View>
      </View>

      {/* Hair Color */}
      <View style={styles.section}>
        <Text style={[styles.fieldLabel, themed.textPrimary]}>
          Color de Pelo
        </Text>
        <TextInput
          style={[styles.input, themed.input]}
          placeholder="Ej: Castaño oscuro"
          placeholderTextColor={colors.textMuted}
          value={hairColor}
          onChangeText={setHairColor}
          maxLength={40}
        />
        <View style={styles.quickRow}>
          {QUICK_COLORS.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[
                styles.quickChip,
                themed.quickChip,
                hairColor === c.value && styles.quickChipSelected,
              ]}
              onPress={() =>
                setHairColor((prev) => (prev === c.value ? "" : c.value))
              }
            >
              <Text
                style={[
                  styles.quickChipText,
                  themed.quickChipText,
                  hairColor === c.value && [
                    styles.quickChipTextSelected,
                    themed.quickChipTextSelected,
                  ],
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Eye Color */}
      <View style={styles.section}>
        <Text style={[styles.fieldLabel, themed.textPrimary]}>
          Color de Ojos
        </Text>
        <TextInput
          style={[styles.input, themed.input]}
          placeholder="Ej: Verde esmeralda"
          placeholderTextColor={colors.textMuted}
          value={eyeColor}
          onChangeText={setEyeColor}
          maxLength={40}
        />
        <View style={styles.quickRow}>
          {QUICK_EYE_COLORS.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[
                styles.quickChip,
                themed.quickChip,
                eyeColor === c.value && styles.quickChipSelected,
              ]}
              onPress={() =>
                setEyeColor((prev) => (prev === c.value ? "" : c.value))
              }
            >
              <Text
                style={[
                  styles.quickChipText,
                  themed.quickChipText,
                  eyeColor === c.value && [
                    styles.quickChipTextSelected,
                    themed.quickChipTextSelected,
                  ],
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, themed.sectionTitle]}>
          Descripción General
        </Text>
        <Text style={[styles.fieldHint, themed.textSecondary]}>
          Describe libremente el aspecto de tu personaje: rasgos distintivos,
          cicatrices, tatuajes, vestimenta habitual, etc.
        </Text>
        <TextInput
          style={[styles.input, styles.textArea, themed.input]}
          placeholder="Ej: Un elfo de porte elegante, con una cicatriz que cruza su mejilla izquierda. Viste una capa gris desgastada por los viajes..."
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          maxLength={1000}
          textAlignVertical="top"
        />
        <Text style={[styles.charCount, themed.textMuted]}>
          {description.length}/1000
        </Text>
      </View>

      {/* Skip hint */}
      <View style={styles.section}>
        <View style={[styles.hintBox, themed.hintBox]}>
          <Ionicons
            name="information-circle"
            size={20}
            color={colors.accentGold}
          />
          <Text style={[styles.hintText, themed.hintText]}>
            Este paso es completamente opcional. Si prefieres, puedes pulsar
            "Siguiente" directamente y rellenar estos datos más adelante.
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
  fieldLabel: {
    color: "#d9d9e6",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  fieldHint: {
    color: "#AAB8C8",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  fieldGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  fieldHalf: {
    flex: 1,
  },
  input: {
    backgroundColor: "#101B2E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E2D42",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#ffffff",
    fontSize: 15,
  },
  textArea: {
    minHeight: 130,
    lineHeight: 22,
    textAlignVertical: "top",
  },
  charCount: {
    color: "#807953",
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  quickChip: {
    backgroundColor: "#101B2E",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#1E2D42",
  },
  quickChipSelected: {
    borderColor: "#00BCD4",
    backgroundColor: "rgba(0,188,212,0.2)",
  },
  quickChipText: {
    color: "#AAB8C8",
    fontSize: 13,
    fontWeight: "600",
  },
  quickChipTextSelected: {
    color: "#ffffff", // overridden by themed.quickChipTextSelected
  },
  hintBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(0,229,255,0.1)", // static: dark-mode default, overridden inline
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0,229,255,0.2)", // static: dark-mode default, overridden inline
  },
  hintText: {
    color: "#d9d9e6",
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 10,
    flex: 1,
  },
});
