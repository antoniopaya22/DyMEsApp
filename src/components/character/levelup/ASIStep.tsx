import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks";
import {
  ABILITY_NAMES,
  ABILITY_ABBR,
  calcModifier,
  formatModifier,
  type AbilityKey,
  type AbilityScores,
} from "@/types/character";
import { ASI_POINTS, MAX_ABILITY_SCORE } from "@/data/srd/leveling";
import { ABILITY_KEYS } from "./useLevelUpWizard";
import { withAlpha } from "@/utils/theme";
import type { Character } from "@/types/character";
import {
  ALL_FEATS,
  getFeatById,
  type Feat,
  type FeatEffect,
} from "@/data/srd/feats";

// ─── Category labels for display ────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  origen: "Origen",
  combate: "Combate",
  epica: "Epicidad",
};

// ─── Props ───────────────────────────────────────────────────────────

interface ASIStepProps {
  asiPoints: Record<AbilityKey, number>;
  asiRemaining: number;
  totalASIUsed: number;
  incrementASI: (key: AbilityKey) => void;
  decrementASI: (key: AbilityKey) => void;
  character: Character;
  // Feat-related (only passed when dotesActivas is on)
  dotesActivas?: boolean;
  chooseFeat?: boolean;
  setChooseFeat?: (v: boolean) => void;
  selectedFeatId?: string | null;
  setSelectedFeatId?: (id: string | null) => void;
  // Feat ASI distribution
  featAsiChoices?: Partial<AbilityScores>;
  featAsiEffect?: FeatEffect | null;
  featAsiAmount?: number;
  featAsiAllowedKeys?: AbilityKey[];
  featAsiUsed?: number;
  featAsiComplete?: boolean;
  incrementFeatASI?: (key: AbilityKey) => void;
  decrementFeatASI?: (key: AbilityKey) => void;
}

export default function ASIStep({
  asiPoints,
  asiRemaining,
  totalASIUsed,
  incrementASI,
  decrementASI,
  character,
  dotesActivas = false,
  chooseFeat = false,
  setChooseFeat,
  selectedFeatId = null,
  setSelectedFeatId,
  featAsiChoices = {},
  featAsiEffect = null,
  featAsiAmount = 0,
  featAsiAllowedKeys = [],
  featAsiUsed = 0,
  featAsiComplete = true,
  incrementFeatASI,
  decrementFeatASI,
}: ASIStepProps) {
  const { colors } = useTheme();
  const [featSearch, setFeatSearch] = useState("");
  const [expandedFeatId, setExpandedFeatId] = useState<string | null>(null);

  // Filter feats: exclude origin feats (those are for character creation only)
  // and epic boon feats (those require level 19+)
  const availableFeats = useMemo(() => {
    const level = character.nivel + 1; // the level being reached
    const existingFeatIds = new Set(
      character.traits
        .filter((t) => t.origen === "dote")
        .map((t) => t.id.replace(/^dote_/, "").replace(/_nv\d+$/, "")),
    );

    return ALL_FEATS.filter((f) => {
      // Exclude origin feats (only for character creation)
      if (f.categoria === "origen") return false;
      // Epic boon feats require level 19+
      if (f.categoria === "epica" && level < 19) return false;
      // Non-repeatable feats already taken
      if (!f.repetible && existingFeatIds.has(f.id)) return false;
      return true;
    });
  }, [character]);

  const filteredFeats = useMemo(() => {
    if (!featSearch.trim()) return availableFeats;
    const q = featSearch.toLowerCase().trim();
    return availableFeats.filter(
      (f) =>
        f.nombre.toLowerCase().includes(q) ||
        f.nombreOriginal.toLowerCase().includes(q) ||
        f.descripcion.toLowerCase().includes(q),
    );
  }, [availableFeats, featSearch]);

  const selectedFeat = selectedFeatId ? getFeatById(selectedFeatId) : null;

  // Auto-apply single-choice ASI (e.g., Actor: only CHA)
  useEffect(() => {
    if (!selectedFeat || !incrementFeatASI) return;
    const asiEffect = selectedFeat.efectos.find((e) => e.type === "asi");
    if (!asiEffect) return;
    const choices = asiEffect.asiChoices ?? [];
    const amount = asiEffect.asiAmount ?? 0;
    if (choices.length === 1 && amount === 1) {
      // Auto-select the only valid choice
      incrementFeatASI(choices[0]);
    }
  }, [selectedFeatId]); // Only run when feat selection changes

  // ── Tab toggle (ASI vs Feat) ──
  const renderModeToggle = () => {
    if (!dotesActivas || !setChooseFeat) return null;

    return (
      <View
        style={{
          flexDirection: "row",
          marginBottom: 16,
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.borderDefault,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setChooseFeat(false);
            setSelectedFeatId?.(null);
          }}
          activeOpacity={0.7}
          style={{
            flex: 1,
            paddingVertical: 10,
            alignItems: "center",
            backgroundColor: !chooseFeat
              ? withAlpha(colors.accentRed, 0.15)
              : colors.bgCard,
            borderRightWidth: 1,
            borderRightColor: colors.borderDefault,
          }}
        >
          <Text
            style={{
              color: !chooseFeat ? colors.accentRed : colors.textSecondary,
              fontSize: 13,
              fontWeight: !chooseFeat ? "700" : "500",
            }}
          >
            Mejora (ASI)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setChooseFeat(true)}
          activeOpacity={0.7}
          style={{
            flex: 1,
            paddingVertical: 10,
            alignItems: "center",
            backgroundColor: chooseFeat
              ? withAlpha(colors.accentRed, 0.15)
              : colors.bgCard,
          }}
        >
          <Text
            style={{
              color: chooseFeat ? colors.accentRed : colors.textSecondary,
              fontSize: 13,
              fontWeight: chooseFeat ? "700" : "500",
            }}
          >
            Elegir Dote
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ── Feat effect summary badges ──
  const renderFeatEffects = (feat: Feat) => {
    const badges: string[] = [];
    for (const e of feat.efectos) {
      switch (e.type) {
        case "asi":
          badges.push(
            `+${e.asiAmount ?? 1} ${e.asiChoices?.map((k) => ABILITY_ABBR[k]).join("/") ?? ""}`,
          );
          break;
        case "proficiency":
          badges.push(`Competencia: ${e.proficiencyType}`);
          break;
        case "spell":
          badges.push("Conjuro");
          break;
        case "hp_max":
          if (e.hpBonusPerLevel) badges.push(`+${e.hpBonusPerLevel} PV/nivel`);
          else if (e.hpBonus) badges.push(`+${e.hpBonus} PV`);
          break;
        case "speed":
          badges.push(`+${e.speedBonus} pies vel.`);
          break;
        case "sense":
          badges.push(`${e.senseType} ${e.senseRange} pies`);
          break;
        // "trait" effects are shown in expanded description
      }
    }
    if (badges.length === 0) return null;
    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 4,
          marginTop: 4,
        }}
      >
        {badges.map((b, i) => (
          <View
            key={i}
            style={{
              backgroundColor: withAlpha(colors.accentRed, 0.1),
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text
              style={{
                color: colors.accentRed,
                fontSize: 10,
                fontWeight: "600",
              }}
            >
              {b}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // ── Feat ASI picker (inline below feat indicator) ──
  const renderFeatAsiPicker = () => {
    if (!selectedFeat || featAsiAmount === 0) return null;

    // Single-choice: just show informational text
    if (featAsiAllowedKeys.length === 1 && featAsiAmount === 1) {
      const key = featAsiAllowedKeys[0];
      const score = character.abilityScores[key];
      const newTotal = Math.min(MAX_ABILITY_SCORE, score.total + 1);
      const newMod = calcModifier(newTotal);
      return (
        <View
          style={{
            backgroundColor: withAlpha(colors.accentRed, 0.06),
            borderRadius: 12,
            borderWidth: 1,
            borderColor: withAlpha(colors.accentRed, 0.15),
            padding: 12,
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 6,
            }}
          >
            Mejora de característica incluida
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: withAlpha(colors.accentRed, 0.12),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: colors.accentRed,
                  fontSize: 12,
                  fontWeight: "800",
                }}
              >
                {ABILITY_ABBR[key]}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                {ABILITY_NAMES[key]}
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 13,
                    fontWeight: "500",
                  }}
                >
                  {score.total}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={10}
                  color={colors.accentRed}
                />
                <Text
                  style={{
                    color: colors.accentRed,
                    fontSize: 13,
                    fontWeight: "700",
                  }}
                >
                  {newTotal}
                </Text>
                <Text
                  style={{
                    color: colors.accentRed,
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  ({formatModifier(newMod)})
                </Text>
              </View>
            </View>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.accentRed}
            />
          </View>
        </View>
      );
    }

    // Multi-choice: show stepper UI for each allowed ability
    const featAsiRemaining = featAsiAmount - featAsiUsed;
    return (
      <View
        style={{
          backgroundColor: withAlpha(colors.accentRed, 0.06),
          borderRadius: 12,
          borderWidth: 1,
          borderColor: withAlpha(colors.accentRed, 0.15),
          padding: 12,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 12,
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 4,
          }}
        >
          Elige mejora de característica
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
            gap: 6,
          }}
        >
          <Ionicons
            name={featAsiComplete ? "checkmark-circle" : "ellipsis-horizontal"}
            size={14}
            color={featAsiComplete ? colors.accentRed : colors.textMuted}
          />
          <Text
            style={{
              color: featAsiComplete ? colors.accentRed : colors.textMuted,
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {featAsiComplete
              ? `¡+${featAsiAmount} repartido${featAsiAmount > 1 ? "s" : ""}!`
              : `${featAsiRemaining} punto${featAsiRemaining > 1 ? "s" : ""} restante${featAsiRemaining > 1 ? "s" : ""}`}
          </Text>
        </View>

        <View style={{ gap: 6 }}>
          {featAsiAllowedKeys.map((key) => {
            const score = character.abilityScores[key];
            const bonus = featAsiChoices[key] ?? 0;
            const newTotal = Math.min(MAX_ABILITY_SCORE, score.total + bonus);
            const newMod = calcModifier(newTotal);
            const atMax = newTotal >= MAX_ABILITY_SCORE;

            return (
              <View
                key={key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor:
                    bonus > 0
                      ? withAlpha(colors.accentRed, 0.08)
                      : colors.bgCard,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor:
                    bonus > 0
                      ? withAlpha(colors.accentRed, 0.25)
                      : colors.borderDefault,
                  padding: 10,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: withAlpha(colors.accentRed, 0.12),
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      color: colors.accentRed,
                      fontSize: 12,
                      fontWeight: "800",
                    }}
                  >
                    {ABILITY_ABBR[key]}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    {ABILITY_NAMES[key]}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 12,
                        fontWeight: "500",
                      }}
                    >
                      {score.total}
                    </Text>
                    {bonus > 0 && (
                      <>
                        <Ionicons
                          name="arrow-forward"
                          size={9}
                          color={colors.accentRed}
                        />
                        <Text
                          style={{
                            color: colors.accentRed,
                            fontSize: 11,
                            fontWeight: "700",
                          }}
                        >
                          {newTotal}
                        </Text>
                      </>
                    )}
                    <Text
                      style={{
                        color: bonus > 0 ? colors.accentRed : colors.textMuted,
                        fontSize: 11,
                        fontWeight: "500",
                      }}
                    >
                      ({formatModifier(bonus > 0 ? newMod : score.modifier)})
                    </Text>
                  </View>
                </View>

                {/* Stepper controls */}
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <TouchableOpacity
                    onPress={() => decrementFeatASI?.(key)}
                    disabled={bonus <= 0}
                    activeOpacity={0.6}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      backgroundColor:
                        bonus > 0
                          ? withAlpha(colors.accentDanger, 0.2)
                          : withAlpha(colors.textMuted, 0.1),
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: bonus > 0 ? 1 : 0.4,
                    }}
                  >
                    <Ionicons
                      name="remove"
                      size={16}
                      color={bonus > 0 ? colors.accentDanger : colors.textMuted}
                    />
                  </TouchableOpacity>

                  <View style={{ width: 24, alignItems: "center" }}>
                    <Text
                      style={{
                        color: bonus > 0 ? colors.accentRed : colors.textMuted,
                        fontSize: 14,
                        fontWeight: "800",
                      }}
                    >
                      {bonus > 0 ? `+${bonus}` : "0"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => incrementFeatASI?.(key)}
                    disabled={featAsiRemaining <= 0 || atMax}
                    activeOpacity={0.6}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      backgroundColor:
                        featAsiRemaining > 0 && !atMax
                          ? withAlpha(colors.accentRed, 0.2)
                          : withAlpha(colors.textMuted, 0.1),
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: featAsiRemaining > 0 && !atMax ? 1 : 0.4,
                    }}
                  >
                    <Ionicons
                      name="add"
                      size={16}
                      color={
                        featAsiRemaining > 0 && !atMax
                          ? colors.accentRed
                          : colors.textMuted
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // ── Feat card ──
  const renderFeatCard = (feat: Feat) => {
    const isSelected = selectedFeatId === feat.id;
    const isExpanded = expandedFeatId === feat.id;

    return (
      <TouchableOpacity
        key={feat.id}
        activeOpacity={0.7}
        onPress={() => setSelectedFeatId?.(isSelected ? null : feat.id)}
        style={{
          backgroundColor: isSelected
            ? withAlpha(colors.accentRed, 0.1)
            : colors.bgCard,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isSelected
            ? withAlpha(colors.accentRed, 0.3)
            : colors.borderDefault,
          padding: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, marginRight: 8 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text
                style={{
                  color: isSelected ? colors.accentRed : colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                {feat.nombre}
              </Text>
              <View
                style={{
                  backgroundColor: withAlpha(colors.textMuted, 0.15),
                  borderRadius: 4,
                  paddingHorizontal: 5,
                  paddingVertical: 1,
                }}
              >
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 9,
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  {CATEGORY_LABELS[feat.categoria] ?? feat.categoria}
                </Text>
              </View>
            </View>
            {feat.prerrequisito && (
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  fontStyle: "italic",
                  marginTop: 2,
                }}
              >
                Req: {feat.prerrequisito}
              </Text>
            )}
            {renderFeatEffects(feat)}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            {/* Expand/collapse button */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                setExpandedFeatId(isExpanded ? null : feat.id);
              }}
              activeOpacity={0.6}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {/* Selection indicator */}
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: isSelected
                  ? colors.accentRed
                  : colors.borderDefault,
                backgroundColor: isSelected ? colors.accentRed : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </View>
          </View>
        </View>

        {/* Expanded description */}
        {isExpanded && (
          <View
            style={{
              marginTop: 8,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: withAlpha(colors.borderDefault, 0.5),
            }}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                lineHeight: 18,
              }}
            >
              {feat.descripcion}
            </Text>
            {feat.fuente === "TCE" && (
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 10,
                  fontStyle: "italic",
                  marginTop: 4,
                }}
              >
                Fuente: Tasha's Cauldron of Everything
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // ── Feat selection mode ──
  const renderFeatSelection = () => (
    <>
      {/* Search bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.bgInput,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 8,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.borderDefault,
          gap: 8,
        }}
      >
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          value={featSearch}
          onChangeText={setFeatSearch}
          placeholder="Buscar dote..."
          placeholderTextColor={colors.textMuted}
          style={{
            flex: 1,
            color: colors.textPrimary,
            fontSize: 14,
            padding: 0,
          }}
        />
        {featSearch.length > 0 && (
          <TouchableOpacity
            onPress={() => setFeatSearch("")}
            activeOpacity={0.6}
          >
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Selected feat indicator */}
      {selectedFeat && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: withAlpha(colors.accentRed, 0.12),
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 6,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: withAlpha(colors.accentRed, 0.3),
            gap: 6,
          }}
        >
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={colors.accentRed}
          />
          <Text
            style={{
              color: colors.accentRed,
              fontSize: 14,
              fontWeight: "700",
              flex: 1,
            }}
          >
            {selectedFeat.nombre}
          </Text>
        </View>
      )}

      {!selectedFeat && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: withAlpha(colors.accentRed, 0.12),
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 6,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: withAlpha(colors.accentRed, 0.3),
            gap: 6,
          }}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={16}
            color={colors.accentRed}
          />
          <Text
            style={{
              color: colors.accentRed,
              fontSize: 14,
              fontWeight: "700",
            }}
          >
            Selecciona una dote
          </Text>
        </View>
      )}

      {/* Feat ASI picker (shown when a feat with ASI is selected) */}
      {renderFeatAsiPicker()}

      {/* Feat list */}
      <View style={{ gap: 8 }}>
        {filteredFeats.length === 0 ? (
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 13,
              textAlign: "center",
              marginTop: 20,
            }}
          >
            No se encontraron dotes
          </Text>
        ) : (
          filteredFeats.map(renderFeatCard)
        )}
      </View>
    </>
  );

  // ── ASI mode (original UI) ──
  const renderASISelection = () => (
    <>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 14,
          fontWeight: "500",
          textAlign: "center",
          marginBottom: 8,
          lineHeight: 20,
        }}
      >
        Reparte {ASI_POINTS} puntos entre tus características.{"\n"}
        Puedes poner ambos en una o repartirlos.
      </Text>

      {/* Points remaining */}
      <View
        style={{
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: withAlpha(colors.accentRed, 0.12),
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: withAlpha(colors.accentRed, 0.3),
            gap: 6,
          }}
        >
          <Ionicons
            name={asiRemaining > 0 ? "ellipsis-horizontal" : "checkmark-circle"}
            size={16}
            color={colors.accentRed}
          />
          <Text
            style={{
              color: colors.accentRed,
              fontSize: 14,
              fontWeight: "700",
            }}
          >
            {asiRemaining > 0
              ? `${asiRemaining} punto${asiRemaining > 1 ? "s" : ""} restante${asiRemaining > 1 ? "s" : ""}`
              : "¡Puntos repartidos!"}
          </Text>
        </View>
      </View>

      {/* Ability score list */}
      <View style={{ gap: 8 }}>
        {ABILITY_KEYS.map((key) => {
          const score = character.abilityScores[key];
          const bonus = asiPoints[key];
          const newTotal = Math.min(MAX_ABILITY_SCORE, score.total + bonus);
          const newMod = calcModifier(newTotal);
          const atMax = newTotal >= MAX_ABILITY_SCORE;

          return (
            <View
              key={key}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor:
                  bonus > 0 ? withAlpha(colors.accentRed, 0.08) : colors.bgCard,
                borderRadius: 12,
                borderWidth: 1,
                borderColor:
                  bonus > 0
                    ? withAlpha(colors.accentRed, 0.25)
                    : colors.borderDefault,
                padding: 12,
              }}
            >
              {/* Ability info */}
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: withAlpha(colors.accentRed, 0.12),
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                }}
              >
                <Text
                  style={{
                    color: colors.accentRed,
                    fontSize: 13,
                    fontWeight: "800",
                  }}
                >
                  {ABILITY_ABBR[key]}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  {ABILITY_NAMES[key]}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 13,
                      fontWeight: "500",
                    }}
                  >
                    {score.total}
                  </Text>
                  {bonus > 0 && (
                    <>
                      <Ionicons
                        name="arrow-forward"
                        size={10}
                        color={colors.accentRed}
                      />
                      <Text
                        style={{
                          color: colors.accentRed,
                          fontSize: 11,
                          fontWeight: "700" as const,
                        }}
                      >
                        {newTotal}
                      </Text>
                    </>
                  )}
                  <Text
                    style={{
                      color: bonus > 0 ? colors.accentRed : colors.textMuted,
                      fontSize: 12,
                      fontWeight: "500",
                    }}
                  >
                    ({formatModifier(bonus > 0 ? newMod : score.modifier)})
                  </Text>
                </View>
              </View>

              {/* Controls */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <TouchableOpacity
                  onPress={() => decrementASI(key)}
                  disabled={bonus <= 0}
                  activeOpacity={0.6}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor:
                      bonus > 0
                        ? withAlpha(colors.accentDanger, 0.2)
                        : withAlpha(colors.textMuted, 0.1),
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor:
                      bonus > 0
                        ? withAlpha(colors.accentDanger, 0.3)
                        : withAlpha(colors.textMuted, 0.1),
                    opacity: bonus > 0 ? 1 : 0.4,
                  }}
                >
                  <Ionicons
                    name="remove"
                    size={18}
                    color={bonus > 0 ? colors.accentDanger : colors.textMuted}
                  />
                </TouchableOpacity>

                <View
                  style={{
                    width: 30,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: bonus > 0 ? colors.accentRed : colors.textMuted,
                      fontSize: 16,
                      fontWeight: "800",
                    }}
                  >
                    {bonus > 0 ? `+${bonus}` : "0"}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => incrementASI(key)}
                  disabled={asiRemaining <= 0 || atMax}
                  activeOpacity={0.6}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor:
                      asiRemaining > 0 && !atMax
                        ? withAlpha(colors.accentRed, 0.2)
                        : withAlpha(colors.textMuted, 0.1),
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor:
                      asiRemaining > 0 && !atMax
                        ? withAlpha(colors.accentRed, 0.3)
                        : withAlpha(colors.textMuted, 0.1),
                    opacity: asiRemaining > 0 && !atMax ? 1 : 0.4,
                  }}
                >
                  <Ionicons
                    name="add"
                    size={18}
                    color={
                      asiRemaining > 0 && !atMax
                        ? colors.accentRed
                        : colors.textMuted
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </>
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {renderModeToggle()}
      {chooseFeat ? renderFeatSelection() : renderASISelection()}
    </ScrollView>
  );
}
