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
import { getBackgroundData, generateRandomPersonality } from "@/data/srd";
import {
  ALIGNMENT_NAMES,
  type Alignment,
  type Personality,
} from "@/types/character";
import { useTheme, useScrollToTop, useCreationNavigation } from "@/hooks";
import { getCreationThemeOverrides } from "@/utils/creationStepTheme";
import WizardStepLayout from "@/components/creation/WizardStepLayout";

const CURRENT_STEP = 9;

const ALIGNMENT_KEYS: Alignment[] = [
  "legal_bueno",
  "neutral_bueno",
  "caotico_bueno",
  "legal_neutral",
  "neutral",
  "caotico_neutral",
  "legal_malvado",
  "neutral_malvado",
  "caotico_malvado",
];

const ALIGNMENT_COLORS: Record<string, string> = {
  legal_bueno: "#3b82f6",
  neutral_bueno: "#22c55e",
  caotico_bueno: "#f59e0b",
  legal_neutral: "#818cf8",
  neutral: "#9ca3af",
  caotico_neutral: "#f97316",
  legal_malvado: "#a78bfa",
  neutral_malvado: "#f87171",
  caotico_malvado: "#dc2626",
};

const ALIGNMENT_DESCRIPTIONS: Record<Alignment, string> = {
  legal_bueno:
    "Actúa con compasión y honor, respetando la ley y ayudando a los demás.",
  neutral_bueno:
    "Hace lo mejor que puede para ayudar a otros según sus necesidades.",
  caotico_bueno:
    "Actúa según su conciencia, con poca consideración por las expectativas ajenas.",
  legal_neutral:
    "Actúa de acuerdo con la ley, la tradición o códigos personales.",
  neutral: "No se siente obligado hacia ningún alineamiento en particular.",
  caotico_neutral:
    "Sigue sus caprichos, valorando su libertad por encima de todo.",
  legal_malvado:
    "Toma metódicamente lo que quiere, dentro de un código de tradición o lealtad.",
  neutral_malvado: "Hace lo que quiere sin compasión ni escrúpulos.",
  caotico_malvado:
    "Actúa con violencia arbitraria, estimulado por su codicia o crueldad.",
};

export default function PersonalityStep() {
  const scrollRef = useScrollToTop();
  const { colors, isDark } = useTheme();
  const themed = getCreationThemeOverrides(colors);
  const { campaignId, pushStep, goBack } = useCreationNavigation();

  const { draft, setPersonality, setAlineamiento, saveDraft, loadDraft } =
    useCreationStore();

  const [traits, setTraits] = useState("");
  const [ideals, setIdeals] = useState("");
  const [bonds, setBonds] = useState("");
  const [flaws, setFlaws] = useState("");
  const [backstory, setBackstory] = useState("");
  const [alignment, setAlignment] = useState<Alignment | null>(null);
  const [showAlignmentDetails, setShowAlignmentDetails] =
    useState<Alignment | null>(null);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        await loadDraft(campaignId);
        const currentDraft = useCreationStore.getState().draft;
        if (currentDraft?.personality) {
          setTraits(currentDraft.personality.traits?.join("\n") ?? "");
          setIdeals(currentDraft.personality.ideals ?? "");
          setBonds(currentDraft.personality.bonds ?? "");
          setFlaws(currentDraft.personality.flaws ?? "");
          setBackstory(currentDraft.personality.backstory ?? "");
        }
        if (currentDraft?.alineamiento) {
          setAlignment(currentDraft.alineamiento);
        }
      };
      init();
    }, [campaignId]),
  );

  const backgroundId = draft?.trasfondo;
  const backgroundData = backgroundId ? getBackgroundData(backgroundId) : null;

  const isValid = true; // All fields are optional

  const handleRandomize = () => {
    if (!backgroundId) return;
    const random = generateRandomPersonality(backgroundId);
    setTraits(random.trait);
    setIdeals(random.ideal);
    setBonds(random.bond);
    setFlaws(random.flaw);
  };

  const handleNext = async () => {
    const personality: Personality = {
      traits: traits
        .split("\n")
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
      ideals: ideals.trim(),
      bonds: bonds.trim(),
      flaws: flaws.trim(),
      backstory: backstory.trim() || undefined,
    };
    setPersonality(personality);
    if (alignment) setAlineamiento(alignment);
    await saveDraft();
    pushStep("appearance");
  };

  const handleBack = () => {
    if (alignment) {
      setAlineamiento(alignment);
    }
    if (traits.trim().length > 0) {
      const personality: Personality = {
        traits: traits
          .split("\n")
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        ideals: ideals.trim(),
        bonds: bonds.trim(),
        flaws: flaws.trim(),
        backstory: backstory.trim() || undefined,
      };
      setPersonality(personality);
    }
    goBack();
  };

  return (
    <WizardStepLayout
      currentStep={CURRENT_STEP}
      title="Personalidad y Alineamiento"
      subtitle={`Define la personalidad de tu personaje: cómo actúa, qué valora y cuáles son sus defectos. También elige su alineamiento moral.\nEste paso es completamente opcional. Si prefieres, puedes pulsar "Siguiente" e ir directamente al siguiente paso.`}
      iconName="chatbubble-ellipses-outline"
      nextLabel="Siguiente: Apariencia"
      canProceed={isValid}
      onNext={handleNext}
      onBack={handleBack}
      scrollRef={scrollRef}
      keyboardShouldPersistTaps="handled"
    >
      {/* Randomize button */}
      {backgroundData && (
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.randomButton, themed.randomButton]}
            onPress={handleRandomize}
          >
            <Ionicons name="dice-outline" size={20} color={colors.accentGold} />
            <Text style={[styles.randomButtonText, themed.randomButtonText]}>
              Generar aleatoriamente (según {backgroundData.nombre})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Personality Traits */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, themed.sectionTitle]}>
          Rasgos de Personalidad{" "}
          <Text style={[styles.optional, themed.optional]}>(opcional)</Text>
        </Text>
        <Text style={[styles.fieldHint, themed.fieldHint]}>
          ¿Cómo se comporta tu personaje? Describe uno o dos rasgos distintivos.
          Separa cada rasgo en una línea diferente.
        </Text>
        <TextInput
          style={[styles.textArea, themed.textArea]}
          placeholder="Ej: Siempre tengo una historia relevante para cada situación."
          placeholderTextColor={colors.textMuted}
          value={traits}
          onChangeText={setTraits}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Ideals */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, themed.sectionTitle]}>
          Ideales{" "}
          <Text style={[styles.optional, themed.optional]}>(opcional)</Text>
        </Text>
        <Text style={[styles.fieldHint, themed.fieldHint]}>
          ¿Qué principios guían a tu personaje? ¿Qué es lo más importante para
          él/ella?
        </Text>
        <TextInput
          style={[styles.textArea, themed.textArea]}
          placeholder="Ej: La verdad. Siempre busco la verdad por encima de todo."
          placeholderTextColor={colors.textMuted}
          value={ideals}
          onChangeText={setIdeals}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />
      </View>

      {/* Bonds */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, themed.sectionTitle]}>
          Vínculos{" "}
          <Text style={[styles.optional, themed.optional]}>(opcional)</Text>
        </Text>
        <Text style={[styles.fieldHint, themed.fieldHint]}>
          ¿Qué personas, lugares o cosas son más importantes para tu personaje?
        </Text>
        <TextInput
          style={[styles.textArea, themed.textArea]}
          placeholder="Ej: Protegeré a mi pueblo natal cueste lo que cueste."
          placeholderTextColor={colors.textMuted}
          value={bonds}
          onChangeText={setBonds}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />
      </View>

      {/* Flaws */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, themed.sectionTitle]}>
          Defectos{" "}
          <Text style={[styles.optional, themed.optional]}>(opcional)</Text>
        </Text>
        <Text style={[styles.fieldHint, themed.fieldHint]}>
          ¿Cuál es la debilidad o vicio de tu personaje? Algo que pueda ser
          usado en su contra.
        </Text>
        <TextInput
          style={[styles.textArea, themed.textArea]}
          placeholder="Ej: Mi orgullo me impide pedir ayuda, incluso cuando la necesito."
          placeholderTextColor={colors.textMuted}
          value={flaws}
          onChangeText={setFlaws}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />
      </View>

      {/* Backstory (optional) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, themed.sectionTitle]}>
          Historia de Fondo{" "}
          <Text style={[styles.optional, themed.optional]}>(opcional)</Text>
        </Text>
        <Text style={[styles.fieldHint, themed.fieldHint]}>
          Escribe brevemente la historia de tu personaje antes de convertirse en
          aventurero. Puedes ampliarla más tarde.
        </Text>
        <TextInput
          style={[styles.textArea, styles.textAreaLarge, themed.textArea]}
          placeholder="Cuenta la historia de tu personaje..."
          placeholderTextColor={colors.textMuted}
          value={backstory}
          onChangeText={setBackstory}
          multiline
          numberOfLines={5}
          maxLength={2000}
          textAlignVertical="top"
        />
        <Text style={[styles.charCount, themed.charCount]}>
          {backstory.length}/2000
        </Text>
      </View>

      {/* Alignment */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, themed.sectionTitle]}>
          Alineamiento{" "}
          <Text style={[styles.optional, themed.optional]}>(opcional)</Text>
        </Text>
        <Text style={[styles.fieldHint, themed.fieldHint]}>
          El alineamiento describe la brújula moral de tu personaje en dos ejes:
          ley/caos y bien/mal.
        </Text>

        {/* Alignment Grid */}
        <View style={[styles.alignmentGrid, themed.cardElevated]}>
          {/* Column headers */}
          <View style={styles.alignmentHeaderRow}>
            <View style={styles.alignmentHeaderSpacer} />
            <View style={styles.alignmentHeaderCell}>
              <Text
                style={[styles.alignmentHeaderText, themed.alignmentHeaderText]}
              >
                Bueno
              </Text>
            </View>
            <View style={styles.alignmentHeaderCell}>
              <Text
                style={[styles.alignmentHeaderText, themed.alignmentHeaderText]}
              >
                Neutral
              </Text>
            </View>
            <View style={styles.alignmentHeaderCell}>
              <Text
                style={[styles.alignmentHeaderText, themed.alignmentHeaderText]}
              >
                Malvado
              </Text>
            </View>
          </View>

          {/* Legal row */}
          <View style={styles.alignmentRow}>
            <View style={styles.alignmentRowLabel}>
              <Text style={[styles.alignmentRowText, themed.alignmentRowText]}>
                Legal
              </Text>
            </View>
            {(
              ["legal_bueno", "legal_neutral", "legal_malvado"] as Alignment[]
            ).map((a) => renderAlignmentCell(a))}
          </View>

          {/* Neutral row */}
          <View style={styles.alignmentRow}>
            <View style={styles.alignmentRowLabel}>
              <Text style={[styles.alignmentRowText, themed.alignmentRowText]}>
                Neutral
              </Text>
            </View>
            {(
              ["neutral_bueno", "neutral", "neutral_malvado"] as Alignment[]
            ).map((a) => renderAlignmentCell(a))}
          </View>

          {/* Chaotic row */}
          <View style={styles.alignmentRow}>
            <View style={styles.alignmentRowLabel}>
              <Text style={[styles.alignmentRowText, themed.alignmentRowText]}>
                Caótico
              </Text>
            </View>
            {(
              [
                "caotico_bueno",
                "caotico_neutral",
                "caotico_malvado",
              ] as Alignment[]
            ).map((a) => renderAlignmentCell(a))}
          </View>
        </View>

        {/* Selected alignment description */}
        {alignment && (
          <View style={[styles.alignmentDescBox, themed.alignmentDescBox]}>
            <View style={styles.alignmentDescHeader}>
              <View
                style={[
                  styles.alignmentDot,
                  {
                    backgroundColor: ALIGNMENT_COLORS[alignment] ?? "#9ca3af",
                  },
                ]}
              />
              <Text
                style={[styles.alignmentDescName, themed.alignmentDescName]}
              >
                {ALIGNMENT_NAMES[alignment]}
              </Text>
            </View>
            <Text style={[styles.alignmentDescText, themed.alignmentDescText]}>
              {ALIGNMENT_DESCRIPTIONS[alignment]}
            </Text>
          </View>
        )}
      </View>
    </WizardStepLayout>
  );

  function renderAlignmentCell(a: Alignment) {
    const isSelected = alignment === a;
    const color = ALIGNMENT_COLORS[a] ?? "#9ca3af";

    return (
      <TouchableOpacity
        key={a}
        style={[
          styles.alignmentCell,
          themed.alignmentCell,
          isSelected && { borderColor: color, backgroundColor: `${color}20` },
        ]}
        onPress={() => {
          setAlignment(a);
          setShowAlignmentDetails(a);
        }}
      >
        {isSelected ? (
          <Ionicons name="checkmark-circle" size={22} color={color} />
        ) : (
          <View
            style={[styles.alignmentCellDot, { borderColor: `${color}99` }]}
          />
        )}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#d9d9e6",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  required: {
    color: "#00BCD4",
    fontSize: 14,
  },
  optional: {
    color: "#807953",
    fontSize: 12,
    fontWeight: "400",
  },
  fieldHint: {
    color: "#AAB8C8",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: "#101B2E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E2D42",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 22,
    minHeight: 80,
  },
  textAreaLarge: {
    minHeight: 130,
  },
  charCount: {
    color: "#807953",
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  randomButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,229,255,0.1)", // static: dark-mode default, overridden inline
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(0,229,255,0.25)", // static: dark-mode default, overridden inline
  },
  randomButtonText: {
    color: "#00E5FF",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  alignmentGrid: {
    backgroundColor: "#182338",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A3A52",
    padding: 10,
    marginBottom: 12,
  },
  alignmentHeaderRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  alignmentHeaderSpacer: {
    width: 64,
  },
  alignmentHeaderCell: {
    flex: 1,
    alignItems: "center",
  },
  alignmentHeaderText: {
    color: "#AAB8C8",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  alignmentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  alignmentRowLabel: {
    width: 64,
  },
  alignmentRowText: {
    color: "#AAB8C8",
    fontSize: 12,
    fontWeight: "700",
  },
  alignmentCell: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#3A4D66",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 3,
    backgroundColor: "#1E3048",
  },
  alignmentCellDot: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 2.5,
  },
  alignmentDescBox: {
    backgroundColor: "#182338",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2A3A52",
  },
  alignmentDescHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  alignmentDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  alignmentDescName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  alignmentDescText: {
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 20,
  },
});
