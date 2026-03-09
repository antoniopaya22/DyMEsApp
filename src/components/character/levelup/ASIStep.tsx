import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks";
import {
  ABILITY_NAMES,
  ABILITY_ABBR,
  calcModifier,
  formatModifier,
  type AbilityKey,
} from "@/types/character";
import { ASI_POINTS, MAX_ABILITY_SCORE } from "@/data/srd/leveling";
import { ABILITY_KEYS } from "./useLevelUpWizard";
import { withAlpha } from "@/utils/theme";
import type { Character } from "@/types/character";

interface ASIStepProps {
  asiPoints: Record<AbilityKey, number>;
  asiRemaining: number;
  totalASIUsed: number;
  incrementASI: (key: AbilityKey) => void;
  decrementASI: (key: AbilityKey) => void;
  character: Character;
}

export default function ASIStep({
  asiPoints,
  asiRemaining,
  totalASIUsed,
  incrementASI,
  decrementASI,
  character,
}: ASIStepProps) {
  const { colors } = useTheme();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
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
            backgroundColor:
              asiRemaining > 0
                ? withAlpha(colors.accentRed, 0.12)
                : withAlpha(colors.accentRed, 0.12),
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor:
              asiRemaining > 0
                ? withAlpha(colors.accentRed, 0.3)
                : withAlpha(colors.accentRed, 0.3),
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
                backgroundColor: bonus > 0 ? withAlpha(colors.accentRed, 0.08) : colors.bgCard,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: bonus > 0 ? withAlpha(colors.accentRed, 0.25) : colors.borderDefault,
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
    </ScrollView>
  );
}
