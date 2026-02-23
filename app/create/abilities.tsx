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
  const { colors, isDark } = useTheme();
  const themed = getCreationThemeOverrides(colors);
  const router = useRouter();
  const { dialogProps, showWarning } = useDialog();

  const {
    draft,
    setAbilityScoreMethod,
    setAbilityScores,
    saveDraft,
    loadDraft,
  } = useCreationStore();

  const [method, setMethod] = useState<AbilityScoreMethod | null>(null);
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
        await loadDraft();
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
    }, []),
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

  const handleSelectMethod = (m: AbilityScoreMethod) => {
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
      pathname: "/create/background",
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
            <Ionicons name="stats-chart-outline" size={40} color={colors.accentRed} />
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
        {!method ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, themed.sectionTitle]}>
              Elige un Método
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
                style={[styles.methodCard, themed.card]}
                onPress={() => handleSelectMethod(m)}
              >
                <View style={styles.methodIcon}>
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
                    color={colors.accentGold}
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
                  name="chevron-forward"
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            {/* Change method */}
            <TouchableOpacity
              style={[styles.changeMethodBtn, themed.card]}
              onPress={() => {
                showWarning(
                  "Cambiar método",
                  "¿Quieres cambiar el método? Se perderán las puntuaciones actuales.",
                  () => setMethod(null),
                  { confirmText: "Cambiar", cancelText: "Cancelar" },
                );
              }}
            >
              <Ionicons
                name="swap-horizontal"
                size={18}
                color={colors.accentGold}
              />
              <Text style={[styles.changeMethodText, themed.textAccent]}>
                {METHOD_LABELS[method]} — Cambiar método
              </Text>
            </TouchableOpacity>

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
                    {assignedValues[key] !== null ? (
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
                    ) : (
                      <View style={styles.valueOptions}>
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
                    )}
                  </View>
                ))}
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
                  <Ionicons name="dice-outline" size={22} color="white" />
                  <Text style={styles.rollButtonText}>
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
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, themed.footer]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !isValid() && [
              styles.nextButtonDisabled,
              themed.nextButtonDisabled,
            ],
          ]}
          onPress={handleNext}
          disabled={!isValid()}
        >
          <Text style={styles.nextButtonText}>Siguiente: Trasfondo</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
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
    backgroundColor: "#323021",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#514D35",
    padding: 16,
    marginBottom: 10,
  },
  methodIcon: {
    height: 48,
    width: 48,
    borderRadius: 12,
    backgroundColor: "rgba(178,172,136,0.15)",
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
    color: "#AAA37B",
    fontSize: 13,
    lineHeight: 18,
  },
  changeMethodBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#323021",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#514D35",
  },
  changeMethodText: {
    color: "#CDC9B2",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  infoText: {
    color: "#AAA37B",
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
    backgroundColor: "#423E2B",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  availableBadgeText: {
    color: "#CDC9B2",
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
    backgroundColor: "#323021",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#514D35",
  },
  abilityLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  abilityAbbr: {
    color: "#CDC9B2",
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
    backgroundColor: "#423E2B",
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
    backgroundColor: "#2E2C1E",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#514D35",
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
    backgroundColor: "#423E2B",
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
    backgroundColor: "#323021",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#514D35",
  },
  pointsLabel: {
    color: "#d9d9e6",
    fontSize: 15,
    fontWeight: "600",
  },
  pointsValue: {
    color: "#CDC9B2",
    fontSize: 20,
    fontWeight: "bold",
  },
  rollButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8f3d38",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  rollButtonText: {
    color: "#ffffff",
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
    backgroundColor: "#323021",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#514D35",
  },
  previewTitle: {
    color: "#CDC9B2",
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
    backgroundColor: "#2E2C1E",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  previewAbbr: {
    color: "#CDC9B2",
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
    color: "#AAA37B",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  previewRacial: {
    color: "#807953",
    fontSize: 11,
    marginTop: 2,
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
