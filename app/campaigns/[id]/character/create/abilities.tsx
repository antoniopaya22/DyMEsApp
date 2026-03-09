import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ConfirmDialog } from "@/components/ui";
import { useTheme, useDialog, useScrollToTop } from "@/hooks";
import {
  useCreationStore,
  calcTotalScoresPreview,
} from "@/stores/creationStore";
import {
  ABILITY_NAMES,
  ABILITY_ABBR,
  calcModifier,
  type AbilityKey,
  type AbilityScores,
  type AbilityScoreMethod,
} from "@/types/character";
import { getCreationThemeOverrides } from "@/utils/creationStepTheme";
import WizardStepLayout from "@/components/creation/WizardStepLayout";

const CURRENT_STEP = 4;

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const ABILITY_KEYS: AbilityKey[] = ["fue", "des", "con", "int", "sab", "car"];

const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

const POINT_BUY_TOTAL = 27;

const METHOD_LABELS: Record<AbilityScoreMethod, string> = {
  standard_array: "Puntuaciones Estándar",
  point_buy: "Compra de Puntos",
  dice_roll: "Tirada de Dados",
  manual: "Manual",
};

const METHOD_DESCRIPTIONS: Record<AbilityScoreMethod, string> = {
  standard_array:
    "Asigna los valores 15, 14, 13, 12, 10, 8 a tus características.",
  point_buy: "Gasta 27 puntos para personalizar tus puntuaciones (8-15).",
  dice_roll: "Tira 4d6 y descarta el menor para cada característica.",
  manual: "Introduce manualmente cualquier valor para cada característica.",
};

function formatMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function rollAbilityScore(): number {
  const rolls = Array.from(
    { length: 4 },
    () => Math.floor(Math.random() * 6) + 1,
  );
  rolls.sort((a, b) => a - b);
  return rolls[1] + rolls[2] + rolls[3];
}

export default function AbilitiesStep() {
  const scrollRef = useScrollToTop();
  const { colors } = useTheme();
  const themed = getCreationThemeOverrides(colors);
  const router = useRouter();
  const { id: campaignId } = useLocalSearchParams<{ id: string }>();
  const { dialogProps, showWarning } = useDialog();

  const {
    draft,
    setAbilityScoreMethod,
    setAbilityScores,
    saveDraft,
    loadDraft,
  } = useCreationStore();

  const [method, setMethod] = useState<AbilityScoreMethod | null>(null);
  const [detailMethodId, setDetailMethodId] = useState<AbilityScoreMethod | null>(null);
  const [scores, setScores] = useState<AbilityScores>({
    fue: 10,
    des: 10,
    con: 10,
    int: 10,
    sab: 10,
    car: 10,
  });

  // Standard array assignment state
  const [assignedValues, setAssignedValues] = useState<
    Record<AbilityKey, number | null>
  >({
    fue: null,
    des: null,
    con: null,
    int: null,
    sab: null,
    car: null,
  });

  const [hasRolled, setHasRolled] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        if (!campaignId) return;
        await loadDraft(campaignId);
        const currentDraft = useCreationStore.getState().draft;
        if (currentDraft?.abilityScoreMethod) {
          setMethod(currentDraft.abilityScoreMethod);
        }
        if (currentDraft?.abilityScoresBase) {
          setScores(currentDraft.abilityScoresBase);
          // Rebuild assigned values for standard array
          if (currentDraft.abilityScoreMethod === "standard_array") {
            const assigned: Record<AbilityKey, number | null> = {
              fue: null,
              des: null,
              con: null,
              int: null,
              sab: null,
              car: null,
            };
            for (const key of ABILITY_KEYS) {
              const val = currentDraft.abilityScoresBase[key];
              if (STANDARD_ARRAY.includes(val)) {
                assigned[key] = val;
              }
            }
            setAssignedValues(assigned);
          }
          if (currentDraft.abilityScoreMethod === "dice_roll") {
            setHasRolled(true);
          }
        }
      };
      init();
    }, [campaignId]),
  );

  // Point buy: calculate used points
  const pointsUsed = ABILITY_KEYS.reduce((total, key) => {
    return total + (POINT_BUY_COSTS[scores[key]] ?? 0);
  }, 0);
  const pointsRemaining = POINT_BUY_TOTAL - pointsUsed;

  // Standard array: unassigned values
  const usedStandardValues = Object.values(assignedValues).filter(
    (v) => v !== null,
  ) as number[];
  const availableStandardValues = STANDARD_ARRAY.filter((val) => {
    const usedCount = usedStandardValues.filter((v) => v === val).length;
    const totalCount = STANDARD_ARRAY.filter((v) => v === val).length;
    return usedCount < totalCount;
  });

  const isValid = () => {
    if (!method) return false;
    if (method === "standard_array") {
      return Object.values(assignedValues).every((v) => v !== null);
    }
    if (method === "point_buy") {
      return (
        pointsRemaining >= 0 &&
        ABILITY_KEYS.every((k) => scores[k] >= 8 && scores[k] <= 15)
      );
    }
    if (method === "dice_roll") {
      return hasRolled && ABILITY_KEYS.every((k) => scores[k] >= 3);
    }
    // manual
    return ABILITY_KEYS.every((k) => scores[k] >= 1 && scores[k] <= 30);
  };

  const getCurrentScores = (): AbilityScores => {
    if (method === "standard_array") {
      return {
        fue: assignedValues.fue ?? 10,
        des: assignedValues.des ?? 10,
        con: assignedValues.con ?? 10,
        int: assignedValues.int ?? 10,
        sab: assignedValues.sab ?? 10,
        car: assignedValues.car ?? 10,
      };
    }
    return scores;
  };

  const applyMethod = (m: AbilityScoreMethod) => {
    setMethod(m);
    const defaultScores = {
      fue: 10,
      des: 10,
      con: 10,
      int: 10,
      sab: 10,
      car: 10,
    };
    if (m === "point_buy") {
      setScores({ fue: 8, des: 8, con: 8, int: 8, sab: 8, car: 8 });
    } else {
      setScores(defaultScores);
    }
    setAssignedValues({
      fue: null,
      des: null,
      con: null,
      int: null,
      sab: null,
      car: null,
    });
    setHasRolled(false);
  };

  const handleSelectMethod = (m: AbilityScoreMethod) => {
    if (method === m) return; // Already selected
    if (method) {
      showWarning(
        "Cambiar método",
        "¿Quieres cambiar el método? Se perderán las puntuaciones actuales.",
        () => applyMethod(m),
        { confirmText: "Cambiar", cancelText: "Cancelar" },
      );
    } else {
      applyMethod(m);
    }
  };

  const handleShowMethodInfo = (m: AbilityScoreMethod) => {
    setDetailMethodId(m);
  };

  const handleStandardAssign = (ability: AbilityKey, value: number) => {
    setAssignedValues((prev) => ({ ...prev, [ability]: value }));
  };

  const handleStandardClear = (ability: AbilityKey) => {
    setAssignedValues((prev) => ({ ...prev, [ability]: null }));
  };

  const handlePointBuyChange = (ability: AbilityKey, delta: number) => {
    const newVal = scores[ability] + delta;
    if (newVal < 8 || newVal > 15) return;
    const newScores = { ...scores, [ability]: newVal };
    const newPointsUsed = ABILITY_KEYS.reduce((total, key) => {
      return total + (POINT_BUY_COSTS[newScores[key]] ?? 0);
    }, 0);
    if (newPointsUsed > POINT_BUY_TOTAL) return;
    setScores(newScores);
  };

  const handleRollAll = () => {
    const rolled: AbilityScores = {
      fue: rollAbilityScore(),
      des: rollAbilityScore(),
      con: rollAbilityScore(),
      int: rollAbilityScore(),
      sab: rollAbilityScore(),
      car: rollAbilityScore(),
    };
    setScores(rolled);
    setHasRolled(true);
  };

  const handleManualChange = (ability: AbilityKey, delta: number) => {
    const newVal = Math.max(1, Math.min(30, scores[ability] + delta));
    setScores((prev) => ({ ...prev, [ability]: newVal }));
  };

  const handleNext = async () => {
    if (!isValid() || !method) return;
    const finalScores = getCurrentScores();
    setAbilityScoreMethod(method);
    setAbilityScores(finalScores);
    await saveDraft();
    router.push({
      pathname: "/campaigns/[id]/character/create/background",
      params: { id: campaignId },
    });
  };

  const handleBack = () => {
    if (method) {
      const finalScores = getCurrentScores();
      setAbilityScoreMethod(method);
      setAbilityScores(finalScores);
    }
    router.back();
  };

  // Preview with racial bonuses
  const currentScores = getCurrentScores();
  const totalScores = draft?.raza
    ? calcTotalScoresPreview(
        currentScores,
        draft.raza,
        draft.subraza ?? null,
        draft.freeAbilityBonuses,
        draft.customRaceData?.abilityBonuses,
      )
    : currentScores;

  return (
    <>
    <WizardStepLayout
      currentStep={CURRENT_STEP}
      title="Puntuaciones de Característica"
      subtitle="Elige un método y asigna tus puntuaciones base. Los bonificadores raciales se aplicarán automáticamente."
      iconName="stats-chart-outline"
      nextLabel="Siguiente: Trasfondo"
      canProceed={!!method}
      onNext={handleNext}
      onBack={handleBack}
      scrollRef={scrollRef}
    >
        {/* Method Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, themed.sectionTitle]}>
            {method ? "Método Seleccionado" : "Elige un Método"}
          </Text>
          {(
            [
              "standard_array",
              "point_buy",
              "dice_roll",
              "manual",
            ] as AbilityScoreMethod[]
          ).map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.methodCard,
                themed.card,
                method === m && { borderColor: colors.accentGold },
              ]}
              onPress={() => handleSelectMethod(m)}
            >
              <View style={[
                styles.methodIcon,
                method === m && { backgroundColor: `${colors.accentGold}25` },
              ]}>
                <Ionicons
                  name={
                    m === "standard_array"
                      ? "list-outline"
                      : m === "point_buy"
                        ? "cart-outline"
                        : m === "dice_roll"
                          ? "dice-outline"
                          : "create-outline"
                  }
                  size={28}
                  color={method === m ? colors.accentGold : colors.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.methodLabel, themed.textPrimary]}>
                  {METHOD_LABELS[m]}
                </Text>
                <Text style={[styles.methodDesc, themed.textSecondary]}>
                  {METHOD_DESCRIPTIONS[m]}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleShowMethodInfo(m)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={method === m ? "checkmark-circle" : "information-circle-outline"}
                  size={22}
                  color={method === m ? colors.accentGold : colors.textMuted}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {method && (
          <View style={styles.section}>

            {/* Standard Array */}
            {method === "standard_array" && (
              <View>
                <Text style={[styles.infoText, themed.textSecondary]}>
                  Toca una característica y asígnale uno de los valores
                  disponibles.
                </Text>
                <View style={styles.availableRow}>
                  <Text style={[styles.availableLabel, themed.textMuted]}>
                    Disponibles:{" "}
                  </Text>
                  {availableStandardValues.length > 0 ? (
                    availableStandardValues.map((v, i) => (
                      <View
                        key={`${v}-${i}`}
                        style={[styles.availableBadge, themed.badge]}
                      >
                        <Text
                          style={[styles.availableBadgeText, themed.badgeText]}
                        >
                          {v}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={[styles.allAssigned, themed.allAssigned]}>✓ Todos asignados</Text>
                  )}
                </View>

                {ABILITY_KEYS.map((key) =>
                  assignedValues[key] !== null ? (
                    <View key={key} style={[styles.abilityRow, themed.card]}>
                      <View style={styles.abilityLabel}>
                        <Text style={[styles.abilityAbbr, themed.textAccent]}>
                          {ABILITY_ABBR[key]}
                        </Text>
                        <Text style={[styles.abilityName, themed.textPrimary]}>
                          {ABILITY_NAMES[key]}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.assignedValue, themed.badge]}
                        onPress={() => handleStandardClear(key)}
                      >
                        <Text
                          style={[styles.assignedValueText, themed.textPrimary]}
                        >
                          {assignedValues[key]}
                        </Text>
                        <Ionicons
                          name="close-circle"
                          size={16}
                          color={colors.accentDanger}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View key={key} style={[styles.abilityRowVertical, themed.card]}>
                      <View style={styles.abilityLabel}>
                        <Text style={[styles.abilityAbbr, themed.textAccent]}>
                          {ABILITY_ABBR[key]}
                        </Text>
                        <Text style={[styles.abilityName, themed.textPrimary]}>
                          {ABILITY_NAMES[key]}
                        </Text>
                      </View>
                      <View style={styles.valueOptionsWrap}>
                        {availableStandardValues
                          .filter((v, i, arr) => arr.indexOf(v) === i)
                          .sort((a, b) => b - a)
                          .map((val) => (
                            <TouchableOpacity
                              key={val}
                              style={[styles.valueOption, themed.cardAlt]}
                              onPress={() => handleStandardAssign(key, val)}
                            >
                              <Text
                                style={[
                                  styles.valueOptionText,
                                  themed.textPrimary,
                                ]}
                              >
                                {val}
                              </Text>
                            </TouchableOpacity>
                          ))}
                      </View>
                    </View>
                  )
                )}
              </View>
            )}

            {/* Point Buy */}
            {method === "point_buy" && (
              <View>
                <View style={[styles.pointsHeader, themed.card]}>
                  <Text style={[styles.pointsLabel, themed.textPrimary]}>
                    Puntos restantes:
                  </Text>
                  <Text
                    style={[
                      styles.pointsValue,
                      themed.pointsValue,
                      pointsRemaining < 0 && { color: colors.accentDanger },
                      pointsRemaining === 0 && { color: colors.accentGreen },
                    ]}
                  >
                    {pointsRemaining} / {POINT_BUY_TOTAL}
                  </Text>
                </View>

                {ABILITY_KEYS.map((key) => (
                  <View key={key} style={[styles.abilityRow, themed.card]}>
                    <View style={styles.abilityLabel}>
                      <Text style={[styles.abilityAbbr, themed.textAccent]}>
                        {ABILITY_ABBR[key]}
                      </Text>
                      <Text style={[styles.abilityName, themed.textPrimary]}>
                        {ABILITY_NAMES[key]}
                      </Text>
                    </View>
                    <View style={styles.spinnerRow}>
                      <TouchableOpacity
                        style={[
                          styles.spinnerBtn,
                          themed.spinnerBtn,
                          scores[key] <= 8 && styles.spinnerBtnDisabled,
                        ]}
                        onPress={() => handlePointBuyChange(key, -1)}
                        disabled={scores[key] <= 8}
                      >
                        <Ionicons
                          name="remove"
                          size={20}
                          color={
                            scores[key] <= 8
                              ? colors.textMuted
                              : colors.textPrimary
                          }
                        />
                      </TouchableOpacity>
                      <Text style={[styles.spinnerValue, themed.textPrimary]}>
                        {scores[key]}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.spinnerBtn,
                          themed.spinnerBtn,
                          scores[key] >= 15 && styles.spinnerBtnDisabled,
                        ]}
                        onPress={() => handlePointBuyChange(key, 1)}
                        disabled={scores[key] >= 15}
                      >
                        <Ionicons
                          name="add"
                          size={20}
                          color={
                            scores[key] >= 15
                              ? colors.textMuted
                              : colors.textPrimary
                          }
                        />
                      </TouchableOpacity>
                      <Text style={[styles.costText, themed.textMuted]}>
                        ({POINT_BUY_COSTS[scores[key]] ?? 0} pts)
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Dice Roll */}
            {method === "dice_roll" && (
              <View>
                <Text style={[styles.infoText, themed.textSecondary]}>
                  Tira 4d6 y descarta el dado más bajo para cada característica.
                </Text>
                <TouchableOpacity
                  style={styles.rollButton}
                  onPress={handleRollAll}
                >
                  <Ionicons name="dice-outline" size={22} color={colors.textInverted} />
                  <Text style={[styles.rollButtonText, themed.textOnPrimary]}>
                    {hasRolled ? "Volver a Tirar" : "Tirar Dados"}
                  </Text>
                </TouchableOpacity>

                {hasRolled &&
                  ABILITY_KEYS.map((key) => (
                    <View key={key} style={[styles.abilityRow, themed.card]}>
                      <View style={styles.abilityLabel}>
                        <Text style={[styles.abilityAbbr, themed.textAccent]}>
                          {ABILITY_ABBR[key]}
                        </Text>
                        <Text style={[styles.abilityName, themed.textPrimary]}>
                          {ABILITY_NAMES[key]}
                        </Text>
                      </View>
                      <Text style={[styles.rolledValue, themed.textPrimary]}>
                        {scores[key]}
                      </Text>
                    </View>
                  ))}
              </View>
            )}

            {/* Manual */}
            {method === "manual" && (
              <View>
                <Text style={[styles.infoText, themed.textSecondary]}>
                  Ajusta cada puntuación manualmente con los controles.
                </Text>
                {ABILITY_KEYS.map((key) => (
                  <View key={key} style={[styles.abilityRow, themed.card]}>
                    <View style={styles.abilityLabel}>
                      <Text style={[styles.abilityAbbr, themed.textAccent]}>
                        {ABILITY_ABBR[key]}
                      </Text>
                      <Text style={[styles.abilityName, themed.textPrimary]}>
                        {ABILITY_NAMES[key]}
                      </Text>
                    </View>
                    <View style={styles.spinnerRow}>
                      <TouchableOpacity
                        style={[
                          styles.spinnerBtn,
                          themed.spinnerBtn,
                          scores[key] <= 1 && styles.spinnerBtnDisabled,
                        ]}
                        onPress={() => handleManualChange(key, -1)}
                        disabled={scores[key] <= 1}
                      >
                        <Ionicons
                          name="remove"
                          size={20}
                          color={
                            scores[key] <= 1
                              ? colors.textMuted
                              : colors.textPrimary
                          }
                        />
                      </TouchableOpacity>
                      <Text style={[styles.spinnerValue, themed.textPrimary]}>
                        {scores[key]}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.spinnerBtn,
                          themed.spinnerBtn,
                          scores[key] >= 30 && styles.spinnerBtnDisabled,
                        ]}
                        onPress={() => handleManualChange(key, 1)}
                        disabled={scores[key] >= 30}
                      >
                        <Ionicons
                          name="add"
                          size={20}
                          color={
                            scores[key] >= 30
                              ? colors.textMuted
                              : colors.textPrimary
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Preview with racial bonuses */}
            {method && (
              <View style={[styles.previewSection, themed.card]}>
                <Text style={[styles.previewTitle, themed.textAccent]}>
                  Puntuaciones Finales (con bonificadores raciales)
                </Text>
                <View style={styles.previewGrid}>
                  {ABILITY_KEYS.map((key) => {
                    const base = currentScores[key];
                    const total = totalScores[key];
                    const racial = total - base;
                    const mod = calcModifier(total);
                    return (
                      <View
                        key={key}
                        style={[styles.previewCard, themed.cardAlt]}
                      >
                        <Text style={[styles.previewAbbr, themed.textAccent]}>
                          {ABILITY_ABBR[key]}
                        </Text>
                        <Text style={[styles.previewTotal, themed.textPrimary]}>
                          {total}
                        </Text>
                        <Text style={[styles.previewMod, themed.textSecondary]}>
                          {formatMod(mod)}
                        </Text>
                        {racial !== 0 && (
                          <Text
                            style={[styles.previewRacial, themed.textMuted]}
                          >
                            {base} + {racial}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}

      {/* Method Detail Modal */}
      <Modal
        visible={!!detailMethodId}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailMethodId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.bgPrimary }]}>
            {/* Handle bar */}
            <View style={styles.modalHandle}>
              <View style={[styles.modalHandleBar, { backgroundColor: colors.borderDefault }]} />
            </View>

            {/* Header with close button */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {detailMethodId ? METHOD_LABELS[detailMethodId] : ""}
              </Text>
              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: colors.bgSecondary }]}
                onPress={() => setDetailMethodId(null)}
              >
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {detailMethodId && (
              <ScrollView style={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
                {/* Method icon + description card */}
                <View style={[styles.modalDetailCard, { backgroundColor: `${colors.accentGold}10`, borderColor: `${colors.accentGold}40` }]}>
                  <View style={styles.modalDetailIconRow}>
                    <View style={[styles.modalDetailIcon, { backgroundColor: `${colors.accentGold}25` }]}>
                      <Ionicons
                        name={
                          detailMethodId === "standard_array"
                            ? "list-outline"
                            : detailMethodId === "point_buy"
                              ? "cart-outline"
                              : detailMethodId === "dice_roll"
                                ? "dice-outline"
                                : "create-outline"
                        }
                        size={32}
                        color={colors.accentGold}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalDetailName, { color: colors.textPrimary }]}>
                        {METHOD_LABELS[detailMethodId]}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.modalDetailDesc, { color: colors.textSecondary }]}>
                    {METHOD_DESCRIPTIONS[detailMethodId]}
                  </Text>
                </View>

                {/* Method-specific info */}
                <View style={[styles.modalInfoCard, { backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }]}>
                  <Text style={[styles.modalInfoTitle, { color: colors.textSecondary }]}>
                    Detalles del Método
                  </Text>

                  {detailMethodId === "standard_array" && (
                    <View>
                      <Text style={[styles.modalInfoText, { color: colors.textSecondary }]}>
                        Asigna cada uno de estos valores a una característica diferente:
                      </Text>
                      <View style={styles.modalBadgeRow}>
                        {STANDARD_ARRAY.map((v, i) => (
                          <View key={i} style={[styles.modalBadge, { backgroundColor: colors.bgSecondary }]}>
                            <Text style={[styles.modalBadgeText, { color: colors.accentGold }]}>{v}</Text>
                          </View>
                        ))}
                      </View>
                      <Text style={[styles.modalInfoHint, { color: colors.textMuted }]}>
                        Ideal para principiantes. Puntuaciones equilibradas y predecibles.
                      </Text>
                    </View>
                  )}

                  {detailMethodId === "point_buy" && (
                    <View>
                      <Text style={[styles.modalInfoText, { color: colors.textSecondary }]}>
                        Empiezas con todas las características en 8. Gasta puntos para subir cada valor.
                      </Text>
                      <View style={styles.modalBadgeRow}>
                        <View style={[styles.modalBadge, { backgroundColor: colors.bgSecondary }]}>
                          <Text style={[styles.modalBadgeText, { color: colors.accentGold }]}>27 puntos</Text>
                        </View>
                        <View style={[styles.modalBadge, { backgroundColor: colors.bgSecondary }]}>
                          <Text style={[styles.modalBadgeText, { color: colors.accentGold }]}>Rango 8–15</Text>
                        </View>
                      </View>
                      <Text style={[styles.modalInfoHint, { color: colors.textMuted }]}>
                        Mayor personalización. Todos los personajes son igual de equilibrados.
                      </Text>
                    </View>
                  )}

                  {detailMethodId === "dice_roll" && (
                    <View>
                      <Text style={[styles.modalInfoText, { color: colors.textSecondary }]}>
                        Tira 4d6 por cada característica y descarta el dado más bajo.
                      </Text>
                      <View style={styles.modalBadgeRow}>
                        <View style={[styles.modalBadge, { backgroundColor: colors.bgSecondary }]}>
                          <Text style={[styles.modalBadgeText, { color: colors.accentGold }]}>4d6 drop 1</Text>
                        </View>
                        <View style={[styles.modalBadge, { backgroundColor: colors.bgSecondary }]}>
                          <Text style={[styles.modalBadgeText, { color: colors.accentGold }]}>Rango 3–18</Text>
                        </View>
                      </View>
                      <Text style={[styles.modalInfoHint, { color: colors.textMuted }]}>
                        Clásico y emocionante. Los resultados pueden ser muy altos o muy bajos.
                      </Text>
                    </View>
                  )}

                  {detailMethodId === "manual" && (
                    <View>
                      <Text style={[styles.modalInfoText, { color: colors.textSecondary }]}>
                        Introduce cualquier valor entre 1 y 30 para cada característica.
                      </Text>
                      <View style={styles.modalBadgeRow}>
                        <View style={[styles.modalBadge, { backgroundColor: colors.bgSecondary }]}>
                          <Text style={[styles.modalBadgeText, { color: colors.accentGold }]}>Rango 1–30</Text>
                        </View>
                        <View style={[styles.modalBadge, { backgroundColor: colors.bgSecondary }]}>
                          <Text style={[styles.modalBadgeText, { color: colors.accentGold }]}>Sin límites</Text>
                        </View>
                      </View>
                      <Text style={[styles.modalInfoHint, { color: colors.textMuted }]}>
                        Libertad total. Útil para campañas con reglas personalizadas.
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ height: 16 }} />
              </ScrollView>
            )}

            {/* Modal Footer */}
            <View style={[styles.modalFooter, { borderTopColor: colors.borderDefault }]}>
              <TouchableOpacity
                style={[styles.modalSelectBtn, { backgroundColor: colors.bgSecondary, borderWidth: 1, borderColor: colors.borderDefault }]}
                onPress={() => setDetailMethodId(null)}
              >
                <Text style={[styles.modalSelectBtnText, { color: colors.textPrimary }]}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </WizardStepLayout>
    {/* Custom dialog (replaces Alert.alert) */}
    <ConfirmDialog {...dialogProps} />
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: "#d9d9e6",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#101B2E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E2D42",
    padding: 16,
    marginBottom: 10,
  },
  methodIcon: {
    height: 48,
    width: 48,
    borderRadius: 12,
    backgroundColor: "rgba(0,229,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  methodLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  methodDesc: {
    color: "#8899AA",
    fontSize: 13,
    lineHeight: 18,
  },
  infoText: {
    color: "#8899AA",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  availableRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  availableLabel: {
    color: "#807953",
    fontSize: 13,
    fontWeight: "600",
    marginRight: 8,
  },
  availableBadge: {
    backgroundColor: "#182338",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  availableBadgeText: {
    color: "#00E5FF",
    fontSize: 15,
    fontWeight: "bold",
  },
  allAssigned: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "600",
  },
  abilityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#101B2E",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1E2D42",
  },
  abilityLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  abilityAbbr: {
    color: "#00E5FF",
    fontSize: 14,
    fontWeight: "bold",
    width: 36,
  },
  abilityName: {
    color: "#d9d9e6",
    fontSize: 15,
  },
  assignedValue: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#182338",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  assignedValueText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  valueOptions: {
    flexDirection: "row",
    gap: 6,
  },
  valueOptionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  abilityRowVertical: {
    backgroundColor: "#101B2E",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1E2D42",
  },
  valueOption: {
    backgroundColor: "#101B2E",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#1E2D42",
  },
  valueOptionText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  spinnerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  spinnerBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: "#182338",
    alignItems: "center",
    justifyContent: "center",
  },
  spinnerBtnDisabled: {
    opacity: 0.4,
  },
  spinnerValue: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    minWidth: 40,
    textAlign: "center",
  },
  costText: {
    color: "#807953",
    fontSize: 12,
    marginLeft: 8,
  },
  pointsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#101B2E",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1E2D42",
  },
  pointsLabel: {
    color: "#d9d9e6",
    fontSize: 15,
    fontWeight: "600",
  },
  pointsValue: {
    color: "#00E5FF",
    fontSize: 20,
    fontWeight: "bold",
  },
  rollButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00BCD4",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  rollButtonText: {
    color: "#0B1221",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  rolledValue: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  previewSection: {
    marginTop: 20,
    backgroundColor: "#101B2E",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E2D42",
  },
  previewTitle: {
    color: "#00E5FF",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: "center",
  },
  previewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  previewCard: {
    width: "30%",
    backgroundColor: "#101B2E",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  previewAbbr: {
    color: "#00E5FF",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  previewTotal: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  previewMod: {
    color: "#8899AA",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  previewRacial: {
    color: "#807953",
    fontSize: 11,
    marginTop: 2,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
  },
  modalHandle: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalCloseBtn: {
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDetailCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  modalDetailIconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalDetailIcon: {
    height: 64,
    width: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  modalDetailName: {
    fontSize: 22,
    fontWeight: "bold",
  },
  modalDetailDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalInfoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  modalInfoTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  modalInfoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  modalBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  modalBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  modalBadgeText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  modalInfoHint: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: "italic",
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  modalSelectBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  modalSelectBtnText: {
    color: "#0B1221",
    fontSize: 16,
    fontWeight: "bold",
  },
});
