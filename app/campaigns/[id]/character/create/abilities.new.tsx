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
  TOTAL_STEPS,
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

const DEFAULT_SCORES: AbilityScores = {
  fue: 10,
  des: 10,
  con: 10,
  int: 10,
  sab: 10,
  car: 10,
};
const PB_DEFAULT: AbilityScores = {
  fue: 8,
  des: 8,
  con: 8,
  int: 8,
  sab: 8,
  car: 8,
};
const NULL_ASSIGNED: Record<AbilityKey, number | null> = {
  fue: null,
  des: null,
  con: null,
  int: null,
  sab: null,
  car: null,
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

  // Confirmed state
  const [method, setMethod] = useState<AbilityScoreMethod | null>(null);
  const [scores, setScores] = useState<AbilityScores>({ ...DEFAULT_SCORES });
  const [assignedValues, setAssignedValues] = useState<
    Record<AbilityKey, number | null>
  >({ ...NULL_ASSIGNED });
  const [hasRolled, setHasRolled] = useState(false);

  // Modal state
  const [modalMethod, setModalMethod] = useState<AbilityScoreMethod | null>(
    null,
  );
  const [mScores, setMScores] = useState<AbilityScores>({ ...DEFAULT_SCORES });
  const [mAssigned, setMAssigned] = useState<
    Record<AbilityKey, number | null>
  >({ ...NULL_ASSIGNED });
  const [mHasRolled, setMHasRolled] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        await loadDraft(campaignId);
        const currentDraft = useCreationStore.getState().draft;
        if (currentDraft?.abilityScoreMethod) {
          setMethod(currentDraft.abilityScoreMethod);
        }
        if (currentDraft?.abilityScoresBase) {
          setScores(currentDraft.abilityScoresBase);
          if (currentDraft.abilityScoreMethod === "standard_array") {
            const assigned: Record<AbilityKey, number | null> = {
              ...NULL_ASSIGNED,
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
    }, []),
  );

  // --- Modal computed values ---
  const mPointsUsed = ABILITY_KEYS.reduce(
    (total, key) => total + (POINT_BUY_COSTS[mScores[key]] ?? 0),
    0,
  );
  const mPointsRemaining = POINT_BUY_TOTAL - mPointsUsed;

  const mUsedValues = Object.values(mAssigned).filter(
    (v) => v !== null,
  ) as number[];
  const mAvailableValues = STANDARD_ARRAY.filter((val) => {
    const usedCount = mUsedValues.filter((v) => v === val).length;
    const totalCount = STANDARD_ARRAY.filter((v) => v === val).length;
    return usedCount < totalCount;
  });

  const isModalValid = (): boolean => {
    if (!modalMethod) return false;
    if (modalMethod === "standard_array")
      return Object.values(mAssigned).every((v) => v !== null);
    if (modalMethod === "point_buy")
      return (
        mPointsRemaining >= 0 &&
        ABILITY_KEYS.every((k) => mScores[k] >= 8 && mScores[k] <= 15)
      );
    if (modalMethod === "dice_roll")
      return mHasRolled && ABILITY_KEYS.every((k) => mScores[k] >= 3);
    return ABILITY_KEYS.every((k) => mScores[k] >= 1 && mScores[k] <= 30);
  };

  const getModalScores = (): AbilityScores => {
    if (modalMethod === "standard_array") {
      return {
        fue: mAssigned.fue ?? 10,
        des: mAssigned.des ?? 10,
        con: mAssigned.con ?? 10,
        int: mAssigned.int ?? 10,
        sab: mAssigned.sab ?? 10,
        car: mAssigned.car ?? 10,
      };
    }
    return mScores;
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

  // --- Modal handlers ---
  const handleOpenMethod = (m: AbilityScoreMethod) => {
    setModalMethod(m);
    if (m === method) {
      // Re-editing current method: copy confirmed state
      setMScores({ ...scores });
      setMAssigned({ ...assignedValues });
      setMHasRolled(hasRolled);
    } else {
      // New method: fresh state
      setMScores(m === "point_buy" ? { ...PB_DEFAULT } : { ...DEFAULT_SCORES });
      setMAssigned({ ...NULL_ASSIGNED });
      setMHasRolled(false);
    }
  };

  const handleConfirmModal = () => {
    if (!modalMethod || !isModalValid()) return;
    setMethod(modalMethod);
    setScores({ ...mScores });
    setMAssigned((prev) => {
      setAssignedValues({ ...prev });
      return prev;
    });
    setHasRolled(mHasRolled);
    setModalMethod(null);
  };

  const handleModalStandardAssign = (ability: AbilityKey, value: number) => {
    setMAssigned((prev) => ({ ...prev, [ability]: value }));
  };

  const handleModalStandardClear = (ability: AbilityKey) => {
    setMAssigned((prev) => ({ ...prev, [ability]: null }));
  };

  const handleModalPointBuyChange = (ability: AbilityKey, delta: number) => {
    const newVal = mScores[ability] + delta;
    if (newVal < 8 || newVal > 15) return;
    const newScores = { ...mScores, [ability]: newVal };
    const newPointsUsed = ABILITY_KEYS.reduce(
      (total, key) => total + (POINT_BUY_COSTS[newScores[key]] ?? 0),
      0,
    );
    if (newPointsUsed > POINT_BUY_TOTAL) return;
    setMScores(newScores);
  };

  const handleModalRollAll = () => {
    const rolled: AbilityScores = {
      fue: rollAbilityScore(),
      des: rollAbilityScore(),
      con: rollAbilityScore(),
      int: rollAbilityScore(),
      sab: rollAbilityScore(),
      car: rollAbilityScore(),
    };
    setMScores(rolled);
    setMHasRolled(true);
  };

  const handleModalManualChange = (ability: AbilityKey, delta: number) => {
    const newVal = Math.max(1, Math.min(30, mScores[ability] + delta));
    setMScores((prev) => ({ ...prev, [ability]: newVal }));
  };

  // --- Navigation ---
  const handleNext = async () => {
    if (!method) return;
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

  const progressPercent = (CURRENT_STEP / TOTAL_STEPS) * 100;

  // Confirmed preview
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

  // Modal preview
  const modalCurrentScores = getModalScores();
  const modalTotalScores = draft?.raza
    ? calcTotalScoresPreview(
        modalCurrentScores,
        draft.raza,
        draft.subraza ?? null,
        draft.freeAbilityBonuses,
        draft.customRaceData?.abilityBonuses,
      )
    : modalCurrentScores;

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
              name="stats-chart-outline"
              size={40}
              color={colors.accentRed}
            />
          </View>
          <Text style={[styles.title, themed.title]}>
            Puntuaciones de Característica
          </Text>
          <Text style={[styles.subtitle, themed.subtitle]}>
            Elige un método y asigna tus puntuaciones base. Los bonificadores
            raciales se aplicarán automáticamente.
          </Text>
        </View>

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
              onPress={() => handleOpenMethod(m)}
            >
              <View
                style={[
                  styles.methodIcon,
                  method === m && {
                    backgroundColor: `${colors.accentGold}25`,
                  },
                ]}
              >
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
              <Ionicons
                name={
                  method === m ? "checkmark-circle" : "chevron-forward"
                }
                size={22}
                color={method === m ? colors.accentGold : colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Confirmed Scores Summary */}
        {method && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, themed.sectionTitle]}>
              Puntuaciones Finales
            </Text>
            <View style={[styles.previewSection, themed.card]}>
              <Text style={[styles.previewTitle, themed.textAccent]}>
                Con bonificadores raciales
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
                      <Text
                        style={[styles.previewTotal, themed.textPrimary]}
                      >
                        {total}
                      </Text>
                      <Text
                        style={[styles.previewMod, themed.textSecondary]}
                      >
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
            <TouchableOpacity
              style={[styles.editScoresBtn, themed.card]}
              onPress={() => handleOpenMethod(method)}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={colors.accentPrimary}
              />
              <Text
                style={[
                  styles.editScoresBtnText,
                  { color: colors.accentPrimary },
                ]}
              >
                Editar puntuaciones
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Score Assignment Modal */}
      <Modal
        visible={!!modalMethod}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalMethod(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: colors.bgPrimary },
            ]}
          >
            {/* Handle bar */}
            <View style={styles.modalHandle}>
              <View
                style={[
                  styles.modalHandleBar,
                  { backgroundColor: colors.borderDefault },
                ]}
              />
            </View>

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text
                style={[styles.modalTitle, { color: colors.textPrimary }]}
              >
                {modalMethod ? METHOD_LABELS[modalMethod] : ""}
              </Text>
              <TouchableOpacity
                style={[
                  styles.modalCloseBtn,
                  { backgroundColor: colors.bgSecondary },
                ]}
                onPress={() => setModalMethod(null)}
              >
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {modalMethod && (
              <ScrollView
                style={{ paddingHorizontal: 20 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Method description */}
                <Text
                  style={[
                    styles.modalDesc,
                    { color: colors.textSecondary },
                  ]}
                >
                  {METHOD_DESCRIPTIONS[modalMethod]}
                </Text>

                {/* Standard Array */}
                {modalMethod === "standard_array" && (
                  <View>
                    <View style={styles.availableRow}>
                      <Text
                        style={[styles.availableLabel, themed.textMuted]}
                      >
                        Disponibles:{" "}
                      </Text>
                      {mAvailableValues.length > 0 ? (
                        mAvailableValues.map((v, i) => (
                          <View
                            key={`${v}-${i}`}
                            style={[styles.availableBadge, themed.badge]}
                          >
                            <Text
                              style={[
                                styles.availableBadgeText,
                                themed.badgeText,
                              ]}
                            >
                              {v}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text
                          style={[styles.allAssigned, themed.allAssigned]}
                        >
                          ✓ Todos asignados
                        </Text>
                      )}
                    </View>

                    {ABILITY_KEYS.map((key) => (
                      <View
                        key={key}
                        style={[styles.abilityRow, themed.card]}
                      >
                        <View style={styles.abilityLabel}>
                          <Text
                            style={[styles.abilityAbbr, themed.textAccent]}
                          >
                            {ABILITY_ABBR[key]}
                          </Text>
                          <Text
                            style={[
                              styles.abilityName,
                              themed.textPrimary,
                            ]}
                          >
                            {ABILITY_NAMES[key]}
                          </Text>
                        </View>
                        {mAssigned[key] !== null ? (
                          <TouchableOpacity
                            style={[styles.assignedValue, themed.badge]}
                            onPress={() => handleModalStandardClear(key)}
                          >
                            <Text
                              style={[
                                styles.assignedValueText,
                                themed.textPrimary,
                              ]}
                            >
                              {mAssigned[key]}
                            </Text>
                            <Ionicons
                              name="close-circle"
                              size={16}
                              color={colors.accentDanger}
                            />
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.valueOptions}>
                            {mAvailableValues
                              .filter((v, i, arr) => arr.indexOf(v) === i)
                              .sort((a, b) => b - a)
                              .map((val) => (
                                <TouchableOpacity
                                  key={val}
                                  style={[
                                    styles.valueOption,
                                    themed.cardAlt,
                                  ]}
                                  onPress={() =>
                                    handleModalStandardAssign(key, val)
                                  }
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
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Point Buy */}
                {modalMethod === "point_buy" && (
                  <View>
                    <View style={[styles.pointsHeader, themed.card]}>
                      <Text
                        style={[styles.pointsLabel, themed.textPrimary]}
                      >
                        Puntos restantes:
                      </Text>
                      <Text
                        style={[
                          styles.pointsValue,
                          themed.pointsValue,
                          mPointsRemaining < 0 && {
                            color: colors.accentDanger,
                          },
                          mPointsRemaining === 0 && {
                            color: colors.accentGreen,
                          },
                        ]}
                      >
                        {mPointsRemaining} / {POINT_BUY_TOTAL}
                      </Text>
                    </View>

                    {ABILITY_KEYS.map((key) => (
                      <View
                        key={key}
                        style={[styles.abilityRow, themed.card]}
                      >
                        <View style={styles.abilityLabel}>
                          <Text
                            style={[styles.abilityAbbr, themed.textAccent]}
                          >
                            {ABILITY_ABBR[key]}
                          </Text>
                          <Text
                            style={[
                              styles.abilityName,
                              themed.textPrimary,
                            ]}
                          >
                            {ABILITY_NAMES[key]}
                          </Text>
                        </View>
                        <View style={styles.spinnerRow}>
                          <TouchableOpacity
                            style={[
                              styles.spinnerBtn,
                              themed.spinnerBtn,
                              mScores[key] <= 8 &&
                                styles.spinnerBtnDisabled,
                            ]}
                            onPress={() =>
                              handleModalPointBuyChange(key, -1)
                            }
                            disabled={mScores[key] <= 8}
                          >
                            <Ionicons
                              name="remove"
                              size={20}
                              color={
                                mScores[key] <= 8
                                  ? colors.textMuted
                                  : colors.textPrimary
                              }
                            />
                          </TouchableOpacity>
                          <Text
                            style={[
                              styles.spinnerValue,
                              themed.textPrimary,
                            ]}
                          >
                            {mScores[key]}
                          </Text>
                          <TouchableOpacity
                            style={[
                              styles.spinnerBtn,
                              themed.spinnerBtn,
                              mScores[key] >= 15 &&
                                styles.spinnerBtnDisabled,
                            ]}
                            onPress={() =>
                              handleModalPointBuyChange(key, 1)
                            }
                            disabled={mScores[key] >= 15}
                          >
                            <Ionicons
                              name="add"
                              size={20}
                              color={
                                mScores[key] >= 15
                                  ? colors.textMuted
                                  : colors.textPrimary
                              }
                            />
                          </TouchableOpacity>
                          <Text style={[styles.costText, themed.textMuted]}>
                            ({POINT_BUY_COSTS[mScores[key]] ?? 0} pts)
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Dice Roll */}
                {modalMethod === "dice_roll" && (
                  <View>
                    <TouchableOpacity
                      style={styles.rollButton}
                      onPress={handleModalRollAll}
                    >
                      <Ionicons
                        name="dice-outline"
                        size={22}
                        color={colors.textInverted}
                      />
                      <Text
                        style={[
                          styles.rollButtonText,
                          themed.textOnPrimary,
                        ]}
                      >
                        {mHasRolled ? "Volver a Tirar" : "Tirar Dados"}
                      </Text>
                    </TouchableOpacity>

                    {mHasRolled &&
                      ABILITY_KEYS.map((key) => (
                        <View
                          key={key}
                          style={[styles.abilityRow, themed.card]}
                        >
                          <View style={styles.abilityLabel}>
                            <Text
                              style={[
                                styles.abilityAbbr,
                                themed.textAccent,
                              ]}
                            >
                              {ABILITY_ABBR[key]}
                            </Text>
                            <Text
                              style={[
                                styles.abilityName,
                                themed.textPrimary,
                              ]}
                            >
                              {ABILITY_NAMES[key]}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.rolledValue,
                              themed.textPrimary,
                            ]}
                          >
                            {mScores[key]}
                          </Text>
                        </View>
                      ))}
                  </View>
                )}

                {/* Manual */}
                {modalMethod === "manual" && (
                  <View>
                    {ABILITY_KEYS.map((key) => (
                      <View
                        key={key}
                        style={[styles.abilityRow, themed.card]}
                      >
                        <View style={styles.abilityLabel}>
                          <Text
                            style={[styles.abilityAbbr, themed.textAccent]}
                          >
                            {ABILITY_ABBR[key]}
                          </Text>
                          <Text
                            style={[
                              styles.abilityName,
                              themed.textPrimary,
                            ]}
                          >
                            {ABILITY_NAMES[key]}
                          </Text>
                        </View>
                        <View style={styles.spinnerRow}>
                          <TouchableOpacity
                            style={[
                              styles.spinnerBtn,
                              themed.spinnerBtn,
                              mScores[key] <= 1 &&
                                styles.spinnerBtnDisabled,
                            ]}
                            onPress={() =>
                              handleModalManualChange(key, -1)
                            }
                            disabled={mScores[key] <= 1}
                          >
                            <Ionicons
                              name="remove"
                              size={20}
                              color={
                                mScores[key] <= 1
                                  ? colors.textMuted
                                  : colors.textPrimary
                              }
                            />
                          </TouchableOpacity>
                          <Text
                            style={[
                              styles.spinnerValue,
                              themed.textPrimary,
                            ]}
                          >
                            {mScores[key]}
                          </Text>
                          <TouchableOpacity
                            style={[
                              styles.spinnerBtn,
                              themed.spinnerBtn,
                              mScores[key] >= 30 &&
                                styles.spinnerBtnDisabled,
                            ]}
                            onPress={() =>
                              handleModalManualChange(key, 1)
                            }
                            disabled={mScores[key] >= 30}
                          >
                            <Ionicons
                              name="add"
                              size={20}
                              color={
                                mScores[key] >= 30
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

                {/* Modal Preview */}
                {(modalMethod !== "dice_roll" || mHasRolled) && (
                  <View
                    style={[
                      styles.previewSection,
                      {
                        marginTop: 20,
                        backgroundColor: colors.bgElevated,
                        borderColor: colors.borderDefault,
                      },
                    ]}
                  >
                    <Text style={[styles.previewTitle, themed.textAccent]}>
                      Vista Previa (con bonificadores raciales)
                    </Text>
                    <View style={styles.previewGrid}>
                      {ABILITY_KEYS.map((key) => {
                        const base = modalCurrentScores[key];
                        const total = modalTotalScores[key];
                        const racial = total - base;
                        const mod = calcModifier(total);
                        return (
                          <View
                            key={key}
                            style={[styles.previewCard, themed.cardAlt]}
                          >
                            <Text
                              style={[
                                styles.previewAbbr,
                                themed.textAccent,
                              ]}
                            >
                              {ABILITY_ABBR[key]}
                            </Text>
                            <Text
                              style={[
                                styles.previewTotal,
                                themed.textPrimary,
                              ]}
                            >
                              {total}
                            </Text>
                            <Text
                              style={[
                                styles.previewMod,
                                themed.textSecondary,
                              ]}
                            >
                              {formatMod(mod)}
                            </Text>
                            {racial !== 0 && (
                              <Text
                                style={[
                                  styles.previewRacial,
                                  themed.textMuted,
                                ]}
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

                <View style={{ height: 16 }} />
              </ScrollView>
            )}

            {/* Modal Footer */}
            <View
              style={[
                styles.modalFooter,
                { borderTopColor: colors.borderDefault },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.modalSelectBtn,
                  {
                    backgroundColor: isModalValid()
                      ? colors.accentGold
                      : colors.bgSecondary,
                  },
                  !isModalValid() && {
                    borderWidth: 1,
                    borderColor: colors.borderDefault,
                  },
                ]}
                onPress={handleConfirmModal}
                disabled={!isModalValid()}
              >
                <Text
                  style={[
                    styles.modalSelectBtnText,
                    {
                      color: isModalValid() ? "#0B1221" : colors.textMuted,
                    },
                  ]}
                >
                  Confirmar Puntuaciones
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Footer */}
      <View style={[styles.footer, themed.footer]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !method && [styles.nextButtonDisabled, themed.nextButtonDisabled],
          ]}
          onPress={handleNext}
          disabled={!method}
        >
          <Text style={[styles.nextButtonText, themed.textOnPrimary]}>
            Siguiente: Trasfondo
          </Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={colors.textInverted}
          />
        </TouchableOpacity>
      </View>
      {/* Custom dialog (replaces Alert.alert) */}
      <ConfirmDialog {...dialogProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1221",
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
    backgroundColor: "#101B2E",
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    color: "#8899AA",
    fontSize: 14,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#101B2E",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00BCD4",
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
    backgroundColor: "rgba(0,188,212,0.15)",
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
    color: "#8899AA",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
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
    marginTop: 4,
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
  editScoresBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  editScoresBtnText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#1E2D42",
  },
  nextButton: {
    backgroundColor: "#00BCD4",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#182338",
    opacity: 0.5,
  },
  nextButtonText: {
    color: "#0B1221",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
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
  modalDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
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
