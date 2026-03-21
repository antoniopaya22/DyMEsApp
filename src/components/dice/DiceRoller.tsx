/**
 * DiceRoller - Tirador de dados integrado para D&D 5e (HU-11)
 *
 * Features:
 * - Preset dice buttons (d3, d4, d6, d8, d10, d12, d20, d100)
 * - Custom formula input (2d6+3, 4d6kh3, etc.)
 * - Advantage / Disadvantage toggle
 * - Critical (nat 20) and Fumble (nat 1) visual effects
 * - Modifier quick-adjust
 * - Re-roll last roll
 * - Roll history (last 50 rolls)
 * - Beautiful themed bottom-sheet dialog with D&D aesthetics
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  Modal,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ConfirmDialog, Toast } from "@/components/ui";
import { useTheme, useDialog, useToast } from "@/hooks";
import {
  type DieType,
  type DieRollResultEx as DieRollResult,
  type AdvantageMode,
  parseFormula,
  executeFormula,
} from "@/utils/dice";

// ─── Types ───────────────────────────────────────────────────────────

interface RollHistoryEntry {
  id: string;
  formula: string;
  nombre: string | null;
  rolls: DieRollResult[];
  modifier: number;
  subtotal: number;
  total: number;
  isCritical: boolean;
  isFumble: boolean;
  advantageMode: AdvantageMode;
  timestamp: string;
}

// ─── Constants ───────────────────────────────────────────────────────

const DIE_PRESET_SIDES: { die: DieType; sides: number }[] = [
  { die: "d3", sides: 3 },
  { die: "d4", sides: 4 },
  { die: "d6", sides: 6 },
  { die: "d8", sides: 8 },
  { die: "d10", sides: 10 },
  { die: "d12", sides: 12 },
  { die: "d20", sides: 20 },
  { die: "d100", sides: 100 },
];

const MAX_HISTORY = 50;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ADVANTAGE_LABELS: Record<AdvantageMode, string> = {
  normal: "Normal",
  ventaja: "Ventaja",
  desventaja: "Desventaja",
};

const ADVANTAGE_ICONS: Record<AdvantageMode, keyof typeof Ionicons.glyphMap> = {
  normal: "remove-outline",
  ventaja: "arrow-up-circle",
  desventaja: "arrow-down-circle",
};

/** Resolve die-preset colors from the active theme */
function getDiePresets(
  colors: import("@/utils/theme").ThemeColors,
): { die: DieType; sides: number; color: string }[] {
  const palette = [
    colors.accentLightBlue, // d3
    colors.accentGreen, // d4
    colors.accentBlue, // d6
    colors.accentPurple, // d8
    colors.accentAmber, // d10
    colors.accentDanger, // d12
    colors.accentPink, // d20
    colors.accentOrange, // d100
  ];
  return DIE_PRESET_SIDES.map((p, i) => ({ ...p, color: palette[i] }));
}

/** Map a die type string (e.g. "d6") to its theme color */
function getDieColor(
  die: string,
  colors: import("@/utils/theme").ThemeColors,
): string {
  const map: Record<string, string> = {
    d3: colors.accentLightBlue,
    d4: colors.accentGreen,
    d6: colors.accentBlue,
    d8: colors.accentPurple,
    d10: colors.accentAmber,
    d12: colors.accentDanger,
    d20: colors.accentPink,
    d100: colors.accentOrange,
  };
  return map[die] ?? colors.textPrimary;
}

/** Resolve advantage-mode colors from the active theme */
function getAdvantageColors(
  colors: import("@/utils/theme").ThemeColors,
): Record<AdvantageMode, string> {
  return {
    normal: colors.textMuted,
    ventaja: colors.accentGreen,
    desventaja: colors.accentDanger,
  };
}

// ─── Component ───────────────────────────────────────────────────────

interface DiceRollerProps {
  visible: boolean;
  onClose: () => void;
  /** Optional character name for labeling rolls */
  characterName?: string;
  /** Optional preset label (e.g. "Percepción", "Ataque con espada") */
  presetLabel?: string;
  /** Optional preset formula */
  presetFormula?: string;
  /** Optional preset modifier */
  presetModifier?: number;
}

export default function DiceRoller({
  visible,
  onClose,
  characterName,
  presetLabel,
  presetFormula,
  presetModifier,
}: Readonly<DiceRollerProps>) {
  const { colors, isDark } = useTheme();

  // Resolve theme-aware constants
  const DIE_PRESETS = getDiePresets(colors);
  const ADVANTAGE_COLORS = getAdvantageColors(colors);

  // ── State ──
  const [formula, setFormula] = useState(presetFormula || "");
  const [modifier, setModifier] = useState(presetModifier || 0);
  const [diceCount, setDiceCount] = useState(1);
  const [advantageMode, setAdvantageMode] = useState<AdvantageMode>("normal");
  const [lastResult, setLastResult] = useState<RollHistoryEntry | null>(null);
  const { dialogProps, showDestructive } = useDialog();
  const { toastProps, showError: toastError } = useToast();

  const [history, setHistory] = useState<RollHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [lastFormula, setLastFormula] = useState<string | null>(null);

  // Animations
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const criticalGlow = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // ── Entrance / Exit animations ──
  useEffect(() => {
    if (visible) {
      const anim = Animated.parallel([
        Animated.spring(slideUpAnim, {
          toValue: 0,
          friction: 9,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
      anim.start();
      return () => anim.stop();
    } else {
      slideUpAnim.setValue(SCREEN_HEIGHT);
      backdropAnim.setValue(0);
    }
  }, [visible, slideUpAnim, backdropAnim]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideUpAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [slideUpAnim, backdropAnim, onClose]);

  const animateRoll = useCallback(() => {
    shakeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    criticalGlow.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.elastic(4),
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeAnim, scaleAnim]);

  const animateCritical = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(criticalGlow, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(criticalGlow, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
      { iterations: 3 },
    ).start();
  }, [criticalGlow]);

  // ── Roll Functions ──

  const doRoll = useCallback(
    (formulaStr: string, label?: string) => {
      const parsed = parseFormula(formulaStr);
      if (!parsed) {
        toastError(
          "Fórmula inválida",
          `No se pudo interpretar: "${formulaStr}"`,
        );
        return;
      }

      const result = executeFormula(parsed, advantageMode, modifier);

      const entry: RollHistoryEntry = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
        formula: formulaStr,
        nombre: label || presetLabel || null,
        rolls: result.rolls,
        modifier: parsed.modifier + modifier,
        subtotal: result.subtotal,
        total: result.total,
        isCritical: result.isCritical,
        isFumble: result.isFumble,
        advantageMode,
        timestamp: new Date().toISOString(),
      };

      setLastResult(entry);
      setLastFormula(formulaStr);
      setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));

      animateRoll();
      if (result.isCritical || result.isFumble) {
        animateCritical();
      }

      // Reset advantage after rolling
      setAdvantageMode("normal");
    },
    [advantageMode, modifier, presetLabel, animateRoll, animateCritical],
  );

  const handlePresetRoll = useCallback(
    (die: DieType) => {
      const formulaStr = diceCount > 1 ? `${diceCount}${die}` : `1${die}`;
      doRoll(formulaStr);
    },
    [diceCount, doRoll],
  );

  const handleFormulaRoll = useCallback(() => {
    if (!formula.trim()) return;
    doRoll(formula.trim());
  }, [formula, doRoll]);

  const handleReroll = useCallback(() => {
    if (lastFormula) {
      doRoll(lastFormula, lastResult?.nombre || undefined);
    }
  }, [lastFormula, lastResult, doRoll]);

  const handleClearHistory = useCallback(() => {
    showDestructive(
      "Limpiar historial",
      "¿Borrar todo el historial de tiradas?",
      () => {
        setHistory([]);
        setLastResult(null);
      },
      { confirmText: "Limpiar", cancelText: "Cancelar" },
    );
  }, [showDestructive]);

  // ── Render Helpers ──

  const renderHeader = () => (
    <View style={[st.header, { borderBottomColor: colors.borderSubtle }]}>
      {/* Drag handle */}
      <View style={st.handleRow}>
        <View style={[st.handle, { backgroundColor: colors.borderDefault }]} />
      </View>

      <View style={st.headerContent}>
        <View style={st.headerLeft}>
          <View
            style={[
              st.headerIconBg,
              { backgroundColor: colors.accentRed + "18" },
            ]}
          >
            <Ionicons name="dice" size={22} color={colors.accentRed} />
          </View>
          <View>
            <Text style={[st.headerTitle, { color: colors.textPrimary }]}>
              Tirador de Dados
            </Text>
            {characterName && (
              <Text
                style={[st.headerSubtitle, { color: colors.accentGold }]}
                numberOfLines={1}
              >
                {characterName}
              </Text>
            )}
          </View>
        </View>

        <View style={st.headerActions}>
          <TouchableOpacity
            onPress={() => setShowHistory(true)}
            style={[
              st.headerBtn,
              {
                backgroundColor: colors.bgCard,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClose}
            style={[
              st.headerBtn,
              {
                backgroundColor: colors.bgCard,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderAdvantageToggle = () => (
    <View
      style={[
        st.section,
        {
          backgroundColor: colors.bgSecondary + "60",
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      <Text style={[st.sectionLabel, { color: colors.textMuted }]}>
        MODO DE TIRADA
      </Text>
      <View style={st.advantageRow}>
        {(["normal", "ventaja", "desventaja"] as AdvantageMode[]).map(
          (mode) => {
            const isActive = advantageMode === mode;
            const modeColor = ADVANTAGE_COLORS[mode];
            return (
              <TouchableOpacity
                key={mode}
                onPress={() => setAdvantageMode(mode)}
                activeOpacity={0.7}
                style={[
                  st.advantageBtn,
                  {
                    backgroundColor: isActive
                      ? modeColor + "20"
                      : "transparent",
                    borderColor: isActive
                      ? modeColor + "60"
                      : colors.borderSubtle,
                  },
                ]}
              >
                <Ionicons
                  name={ADVANTAGE_ICONS[mode]}
                  size={16}
                  color={isActive ? modeColor : colors.textMuted}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={{
                    color: isActive ? modeColor : colors.textSecondary,
                    fontSize: 12,
                    fontWeight: isActive ? "700" : "500",
                  }}
                >
                  {ADVANTAGE_LABELS[mode]}
                </Text>
              </TouchableOpacity>
            );
          },
        )}
      </View>
    </View>
  );

  const renderDicePresets = () => (
    <View style={st.diceSection}>
      {/* Dice count selector */}
      <View style={st.diceCountRow}>
        <Text style={[st.sectionLabel, { color: colors.textMuted }]}>
          CANTIDAD
        </Text>
        <View style={st.diceCountControls}>
          <TouchableOpacity
            onPress={() => setDiceCount((c) => Math.max(1, c - 1))}
            activeOpacity={0.7}
            style={[
              st.countBtn,
              {
                backgroundColor: colors.bgCard,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <Ionicons name="remove" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <View
            style={[
              st.countBadge,
              {
                backgroundColor: colors.accentRed + "18",
                borderColor: colors.accentRed + "40",
              },
            ]}
          >
            <Text style={[st.countText, { color: colors.accentRed }]}>
              {diceCount}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setDiceCount((c) => Math.min(20, c + 1))}
            activeOpacity={0.7}
            style={[
              st.countBtn,
              {
                backgroundColor: colors.bgCard,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <Ionicons name="add" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dice buttons grid */}
      <View style={st.diceGrid}>
        {DIE_PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.die}
            onPress={() => handlePresetRoll(preset.die)}
            activeOpacity={0.65}
            style={[
              st.dieButton,
              {
                backgroundColor: preset.color + "14",
                borderColor: preset.color + "40",
              },
            ]}
          >
            <View
              style={[st.dieIconBg, { backgroundColor: preset.color + "20" }]}
            >
              <Ionicons name="dice-outline" size={20} color={preset.color} />
            </View>
            <Text style={[st.dieName, { color: preset.color }]}>
              {preset.die}
            </Text>
            <Text style={[st.dieSides, { color: colors.textMuted }]}>
              1–{preset.sides}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFormulaInput = () => (
    <View
      style={[
        st.formulaSection,
        {
          backgroundColor: colors.bgSecondary + "60",
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      <Text style={[st.sectionLabel, { color: colors.textMuted }]}>
        FÓRMULA PERSONALIZADA
      </Text>
      <View style={st.formulaRow}>
        <View
          style={[
            st.formulaInputWrap,
            {
              backgroundColor: colors.bgPrimary,
              borderColor: colors.borderDefault,
            },
          ]}
        >
          <Ionicons name="create-outline" size={16} color={colors.textMuted} />
          <TextInput
            style={[st.formulaInput, { color: colors.textPrimary }]}
            placeholder="2d6+3, 4d6kh3..."
            placeholderTextColor={colors.textMuted}
            defaultValue={formula}
            onChangeText={setFormula}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={handleFormulaRoll}
          />
        </View>
        <TouchableOpacity
          onPress={handleFormulaRoll}
          activeOpacity={0.7}
          style={[st.formulaGoBtn, { backgroundColor: colors.accentRed }]}
        >
          <Ionicons name="dice" size={22} color={colors.textInverted} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderModifier = () => (
    <View style={st.modifierRow}>
      <Text style={[st.modLabel, { color: colors.textSecondary }]}>
        Modificador
      </Text>
      <View style={st.modControls}>
        <TouchableOpacity
          onPress={() => setModifier((m) => m - 1)}
          activeOpacity={0.7}
          style={[
            st.modBtn,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <Ionicons name="remove" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text
          style={[
            st.modValue,
            {
              color:
                modifier > 0
                  ? colors.accentGreen
                  : modifier < 0
                    ? colors.dangerText
                    : colors.textPrimary,
            },
          ]}
        >
          {modifier >= 0 ? `+${modifier}` : modifier}
        </Text>
        <TouchableOpacity
          onPress={() => setModifier((m) => m + 1)}
          activeOpacity={0.7}
          style={[
            st.modBtn,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <Ionicons name="add" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
        {modifier !== 0 && (
          <TouchableOpacity
            onPress={() => setModifier(0)}
            style={{ marginLeft: 6 }}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderResult = () => {
    if (!lastResult) {
      return (
        <View style={st.emptyResult}>
          <View
            style={[st.emptyResultIcon, { backgroundColor: colors.bgElevated }]}
          >
            <Ionicons name="dice-outline" size={36} color={colors.textMuted} />
          </View>
          <Text style={[st.emptyResultText, { color: colors.textMuted }]}>
            ¡Tira los dados!
          </Text>
          <Text
            style={[st.emptyResultHint, { color: colors.textMuted + "80" }]}
          >
            Selecciona un dado o escribe una fórmula
          </Text>
        </View>
      );
    }

    const {
      isCritical,
      isFumble,
      total,
      rolls,
      modifier: totalMod,
      formula: rollFormula,
      nombre,
    } = lastResult;

    const accentColor = isCritical
      ? colors.accentGold
      : isFumble
        ? colors.accentDanger
        : colors.accentRed;

    const bgColor = isCritical
      ? colors.accentGold + "12"
      : isFumble
        ? colors.accentDanger + "12"
        : colors.bgSecondary + "80";

    const borderColor = isCritical
      ? colors.accentGold + "50"
      : isFumble
        ? colors.accentDanger + "50"
        : colors.borderDefault;

    const shakeTranslate = shakeAnim.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [0, -8, 8, -4, 0],
    });

    return (
      <Animated.View
        style={{
          transform: [{ translateX: shakeTranslate }, { scale: scaleAnim }],
        }}
      >
        <View
          style={[st.resultCard, { backgroundColor: bgColor, borderColor }]}
        >
          {/* Critical / Fumble label */}
          {isCritical && (
            <View
              style={[
                st.resultBadge,
                { backgroundColor: colors.accentGold + "25" },
              ]}
            >
              <Text style={[st.resultBadgeText, { color: colors.accentGold }]}>
                <Ionicons name="sparkles-outline" size={14} color={colors.accentGold} />{" "}¡CRÍTICO!{" "}<Ionicons name="sparkles-outline" size={14} color={colors.accentGold} />
              </Text>
            </View>
          )}
          {isFumble && (
            <View
              style={[
                st.resultBadge,
                { backgroundColor: colors.accentDanger + "25" },
              ]}
            >
              <Text
                style={[st.resultBadgeText, { color: colors.accentDanger }]}
              >
                <Ionicons name="skull-outline" size={14} color={colors.accentDanger} />{" "}¡PIFIA!{" "}<Ionicons name="skull-outline" size={14} color={colors.accentDanger} />
              </Text>
            </View>
          )}

          {/* Roll name */}
          {nombre && (
            <Text style={[st.resultName, { color: colors.textSecondary }]}>
              {nombre}
            </Text>
          )}

          {/* Total */}
          <Text style={[st.resultTotal, { color: accentColor }]}>{total}</Text>

          {/* Formula */}
          <Text style={[st.resultFormula, { color: colors.textSecondary }]}>
            {rollFormula}
            {totalMod > 0
              ? ` (+${totalMod})`
              : totalMod < 0
                ? ` (${totalMod})`
                : ""}
          </Text>

          {/* Individual dice */}
          <View style={st.resultDice}>
            {rolls.map((roll, i) => {
              const isNat20 = roll.value === 20 && roll.die === "d20";
              const isNat1 = roll.value === 1 && roll.die === "d20";
              const dieColor = getDieColor(roll.die, colors);
              return (
                <View
                  key={i}
                  style={[
                    st.resultDieChip,
                    {
                      backgroundColor: roll.discarded
                        ? colors.bgPrimary
                        : isNat20
                          ? colors.accentGold + "25"
                          : isNat1
                            ? colors.accentDanger + "25"
                            : dieColor + "20",
                      borderColor: roll.discarded
                        ? colors.bgSecondary
                        : isNat20
                          ? colors.accentGold + "50"
                          : isNat1
                            ? colors.accentDanger + "50"
                            : dieColor + "50",
                      opacity: roll.discarded ? 0.5 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      st.resultDieText,
                      {
                        color: roll.discarded
                          ? colors.textMuted
                          : isNat20
                            ? colors.accentGold
                            : isNat1
                              ? colors.accentDanger
                              : dieColor,
                        textDecorationLine: roll.discarded
                          ? "line-through"
                          : "none",
                      },
                    ]}
                  >
                    {roll.die}:{roll.value}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Advantage mode indicator */}
          {lastResult.advantageMode !== "normal" && (
            <View
              style={[
                st.resultAdvBadge,
                {
                  backgroundColor:
                    ADVANTAGE_COLORS[lastResult.advantageMode] + "18",
                },
              ]}
            >
              <Text
                style={{
                  color: ADVANTAGE_COLORS[lastResult.advantageMode],
                  fontSize: 11,
                  fontWeight: "600",
                }}
              >
                {ADVANTAGE_LABELS[lastResult.advantageMode]}
              </Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={st.resultActions}>
            <TouchableOpacity
              onPress={handleReroll}
              activeOpacity={0.7}
              style={[
                st.resultActionBtn,
                {
                  backgroundColor: colors.bgElevated,
                  borderColor: colors.borderDefault,
                },
              ]}
            >
              <Ionicons name="refresh" size={15} color={colors.textSecondary} />
              <Text
                style={[st.resultActionText, { color: colors.textSecondary }]}
              >
                Repetir
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderHistoryEntry = (entry: RollHistoryEntry) => {
    const time = new Date(entry.timestamp);
    const timeStr = time.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View
        key={entry.id}
        style={[st.historyItem, { borderBottomColor: colors.borderSubtle }]}
      >
        {/* Icon */}
        <View
          style={[
            st.historyIcon,
            {
              backgroundColor: entry.isCritical
                ? colors.accentGold + "18"
                : entry.isFumble
                  ? colors.accentDanger + "18"
                  : colors.bgElevated,
            },
          ]}
        >
          <Ionicons
            name={
              entry.isCritical
                ? "star"
                : entry.isFumble
                  ? "skull"
                  : "dice-outline"
            }
            size={15}
            color={
              entry.isCritical
                ? colors.accentGold
                : entry.isFumble
                  ? colors.accentDanger
                  : colors.textMuted
            }
          />
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            {entry.nombre && (
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginRight: 6,
                }}
              >
                {entry.nombre}:
              </Text>
            )}
            <Text
              style={{
                color: entry.isCritical
                  ? colors.accentGold
                  : entry.isFumble
                    ? colors.accentDanger
                    : colors.textPrimary,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {entry.total}
            </Text>
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
            {entry.formula}
            {entry.modifier !== 0
              ? entry.modifier > 0
                ? ` +${entry.modifier}`
                : ` ${entry.modifier}`
              : ""}
            {" · "}[
            {entry.rolls
              .filter((r) => !r.discarded)
              .map((r) => r.value)
              .join(", ")}
            ]
            {entry.advantageMode !== "normal"
              ? ` · ${ADVANTAGE_LABELS[entry.advantageMode]}`
              : ""}
          </Text>
        </View>

        {/* Time */}
        <Text style={{ color: colors.textMuted, fontSize: 10 }}>{timeStr}</Text>
      </View>
    );
  };

  const renderHistory = () => (
    <View style={{ flex: 1 }}>
      {/* History header */}
      <View
        style={[st.historyHeader, { borderBottomColor: colors.borderSubtle }]}
      >
        <TouchableOpacity
          onPress={() => setShowHistory(false)}
          style={st.historyBackBtn}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          <Text style={[st.historyTitle, { color: colors.textPrimary }]}>
            Historial
          </Text>
          <View
            style={[
              st.historyCount,
              { backgroundColor: colors.accentRed + "18" },
            ]}
          >
            <Text
              style={{
                color: colors.accentRed,
                fontSize: 11,
                fontWeight: "700",
              }}
            >
              {history.length}
            </Text>
          </View>
        </TouchableOpacity>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory}>
            <Ionicons
              name="trash-outline"
              size={18}
              color={colors.accentDanger}
            />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={history}
        renderItem={({ item }) => renderHistoryEntry(item)}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        ListEmptyComponent={
          <View style={st.historyEmpty}>
            <Ionicons
              name="hourglass-outline"
              size={32}
              color={colors.textMuted}
            />
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 14,
                marginTop: 10,
              }}
            >
              No hay tiradas recientes
            </Text>
          </View>
        }
      />
    </View>
  );

  // ── Divider helper ──
  const renderDivider = (label: string) => (
    <View style={st.divider}>
      <View
        style={[st.dividerLine, { backgroundColor: colors.borderSubtle }]}
      />
      <Text style={[st.dividerText, { color: colors.textMuted }]}>{label}</Text>
      <View
        style={[st.dividerLine, { backgroundColor: colors.borderSubtle }]}
      />
    </View>
  );

  // ── Main Render ──

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={st.modalRoot}>
        {/* Backdrop */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.45)",
              opacity: backdropAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Bottom sheet */}
        <Animated.View
          style={[
            st.sheet,
            showHistory && { height: SCREEN_HEIGHT * 0.88 },
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.borderDefault,
              transform: [{ translateY: slideUpAnim }],
              ...Platform.select({
                ios: {
                  shadowColor: colors.shadowColor,
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 16,
                },
                android: {
                  elevation: 24,
                },
              }),
            },
          ]}
        >
          {showHistory ? (
            renderHistory()
          ) : (
            <>
              {renderHeader()}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={st.scrollContent}
                bounces={false}
              >
                {/* Advantage toggle */}
                {renderAdvantageToggle()}

                {/* Dice presets */}
                {renderDicePresets()}

                {/* Modifier */}
                {renderModifier()}

                {/* Divider */}
                {renderDivider("o escribe una fórmula")}

                {/* Formula input */}
                {renderFormulaInput()}

                {/* Result */}
                {renderResult()}
              </ScrollView>
            </>
          )}
        </Animated.View>
      </View>

      {/* Custom dialog (replaces Alert.alert) */}
      <ConfirmDialog {...dialogProps} />

      {/* Toast notifications */}
      <Toast {...toastProps} />
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const st = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },

  // ── Sheet ──
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SCREEN_HEIGHT * 0.88,
    borderTopWidth: 1,
    overflow: "hidden",
  },

  scrollContent: {
    paddingBottom: 36,
  },

  // ── Header ──
  header: {
    borderBottomWidth: 1,
    paddingBottom: 14,
  },
  handleRow: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  // ── Sections ──
  section: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  // ── Advantage ──
  advantageRow: {
    flexDirection: "row",
    gap: 6,
  },
  advantageBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },

  // ── Dice section ──
  diceSection: {
    marginHorizontal: 16,
    marginTop: 14,
  },
  diceCountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  diceCountControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  countBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  countBadge: {
    minWidth: 36,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  countText: {
    fontSize: 16,
    fontWeight: "800",
  },

  // ── Dice grid ──
  diceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dieButton: {
    width: (SCREEN_WIDTH - 32 - 24) / 4, // 4 columns with gaps
    aspectRatio: 0.88,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  dieIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  dieName: {
    fontSize: 14,
    fontWeight: "800",
  },
  dieSides: {
    fontSize: 9,
    marginTop: 1,
    fontWeight: "500",
  },

  // ── Formula ──
  formulaSection: {
    marginHorizontal: 16,
    marginTop: 4,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  formulaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  formulaInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  formulaInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
  },
  formulaGoBtn: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Modifier ──
  modifierRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 14,
  },
  modLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  modControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  modBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  modValue: {
    fontSize: 17,
    fontWeight: "800",
    marginHorizontal: 12,
    minWidth: 36,
    textAlign: "center",
  },

  // ── Divider ──
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    marginHorizontal: 12,
    fontWeight: "500",
  },

  // ── Result ──
  emptyResult: {
    alignItems: "center",
    paddingVertical: 28,
  },
  emptyResultIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyResultText: {
    fontSize: 15,
    fontWeight: "600",
  },
  emptyResultHint: {
    fontSize: 12,
    marginTop: 4,
  },

  resultCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 20,
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 4,
  },
  resultBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 6,
  },
  resultBadgeText: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
  },
  resultName: {
    fontSize: 13,
    marginBottom: 4,
  },
  resultTotal: {
    fontSize: 52,
    fontWeight: "900",
    lineHeight: 60,
  },
  resultFormula: {
    fontSize: 14,
    marginTop: 4,
  },
  resultDice: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
    gap: 5,
  },
  resultDieChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  resultDieText: {
    fontSize: 13,
    fontWeight: "600",
  },
  resultAdvBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  resultActions: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },
  resultActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  resultActionText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // ── History ──
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  historyBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  historyCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  historyEmpty: {
    alignItems: "center",
    paddingVertical: 40,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  historyIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
});
