import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks";
import { withAlpha } from "@/utils/theme";
import {
  formatXP,
  ASI_POINTS,
  type LevelUpSummary,
  type LevelFeature,
} from "@/data/srd/leveling";
import type { Character } from "@/types/character";

interface SummaryStepProps {
  summary: LevelUpSummary;
  newLevel: number;
  classData: { nombre: string; subclassLabel?: string } | null;
  profChanged: boolean;
  newProfBonus: number;
  oldProfBonus: number;
  character: Character;
}

// ─── Feature Card sub-component ──────────────────────────────────────

function FeatureCard({ feature }: { feature: LevelFeature }) {
  const { colors: fcColors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
      style={{
        backgroundColor: withAlpha(fcColors.accentRed, 0.08),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: withAlpha(fcColors.accentRed, 0.2),
        padding: 12,
        marginBottom: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: withAlpha(fcColors.accentRed, 0.15),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={feature.esSubclase ? "git-branch-outline" : "flash-outline"}
            size={16}
            color={fcColors.accentRed}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: fcColors.textPrimary,
              fontSize: 14,
              fontWeight: "700",
            }}
          >
            {feature.nombre}
          </Text>
          {feature.esSubclase && (
            <Text
              style={{
                color: fcColors.accentRed,
                fontSize: 11,
                fontWeight: "600",
                marginTop: 1,
              }}
            >
              Rasgo de Subclase
            </Text>
          )}
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={fcColors.textMuted}
        />
      </View>

      {expanded && (
        <Text
          style={{
            color: fcColors.textSecondary,
            fontSize: 13,
            fontWeight: "500",
            lineHeight: 19,
            marginTop: 8,
            paddingLeft: 42,
          }}
        >
          {feature.descripcion}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Summary Step ────────────────────────────────────────────────────

export default function SummaryStep({
  summary,
  newLevel,
  classData,
  profChanged,
  newProfBonus,
  oldProfBonus,
  character,
}: SummaryStepProps) {
  const { colors } = useTheme();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {/* Level badge */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: withAlpha(colors.accentRed, 0.15),
            borderWidth: 2,
            borderColor: withAlpha(colors.accentRed, 0.3),
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: colors.accentRed,
              fontSize: 32,
              fontWeight: "900",
            }}
          >
            {newLevel}
          </Text>
        </View>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 20,
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          Nivel {newLevel}
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 14,
            fontWeight: "500",
            textAlign: "center",
            marginTop: 2,
          }}
        >
          {classData?.nombre} · XP necesaria: {formatXP(summary.xpThreshold)}
        </Text>
      </View>

      {/* Proficiency bonus change */}
      {profChanged && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: withAlpha(colors.accentRed, 0.12),
            borderRadius: 12,
            borderWidth: 1,
            borderColor: withAlpha(colors.accentRed, 0.3),
            padding: 12,
            marginBottom: 12,
            gap: 10,
          }}
        >
          <Ionicons name="ribbon-outline" size={20} color={colors.accentRed} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 14,
                fontWeight: "700",
              }}
            >
              Bonificador de Competencia
            </Text>
            <Text
              style={{
                color: colors.accentRed,
                fontSize: 13,
                fontWeight: "500",
              }}
            >
              +{oldProfBonus} → +{newProfBonus}
            </Text>
          </View>
        </View>
      )}

      {/* ASI notification */}
      {summary.hasASI && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: withAlpha(colors.accentRed, 0.12),
            borderRadius: 12,
            borderWidth: 1,
            borderColor: withAlpha(colors.accentRed, 0.3),
            padding: 12,
            marginBottom: 12,
            gap: 10,
          }}
        >
          <Ionicons name="trending-up" size={20} color={colors.accentRed} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 14,
                fontWeight: "700",
              }}
            >
              Mejora de Característica
            </Text>
            <Text
              style={{
                color: colors.accentRed,
                fontSize: 13,
                fontWeight: "500",
              }}
            >
              Puedes repartir +{ASI_POINTS} puntos entre tus características
            </Text>
          </View>
        </View>
      )}

      {/* Subclass notification */}
      {summary.choosesSubclass && !character.subclase && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: withAlpha(colors.accentRed, 0.12),
            borderRadius: 12,
            borderWidth: 1,
            borderColor: withAlpha(colors.accentRed, 0.3),
            padding: 12,
            marginBottom: 12,
            gap: 10,
          }}
        >
          <Ionicons name="git-branch" size={20} color={colors.accentRed} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 14,
                fontWeight: "700",
              }}
            >
              {classData?.subclassLabel ?? "Subclase"}
            </Text>
            <Text style={{ color: colors.accentRed, fontSize: 13, fontWeight: "500" }}>
              ¡Debes elegir tu especialización!
            </Text>
          </View>
        </View>
      )}

      {/* Spell learning notification */}
      {summary.spellLearning && (() => {
        const sl = summary.spellLearning;
        const parts: string[] = [];
        if (sl.newCantrips > 0) parts.push(`${sl.newCantrips} truco${sl.newCantrips > 1 ? "s" : ""}`);
        if (sl.newSpellsKnown > 0) parts.push(`${sl.newSpellsKnown} hechizo${sl.newSpellsKnown > 1 ? "s" : ""}`);
        if (sl.newSpellbookSpells > 0) parts.push(`${sl.newSpellbookSpells} hechizo${sl.newSpellbookSpells > 1 ? "s" : ""} al libro`);
        if (sl.canSwapSpell) parts.push("intercambiar 1 hechizo");
        if (parts.length === 0) return null;
        return (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: withAlpha(colors.accentRed, 0.12),
              borderRadius: 12,
              borderWidth: 1,
              borderColor: withAlpha(colors.accentRed, 0.3),
              padding: 12,
              marginBottom: 12,
              gap: 10,
            }}
          >
            <Ionicons name="sparkles" size={20} color={colors.accentRed} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Hechizos
              </Text>
              <Text
                style={{
                  color: colors.accentRed,
                  fontSize: 13,
                  fontWeight: "500",
                }}
              >
                Puedes aprender: {parts.join(", ")}
              </Text>
            </View>
          </View>
        );
      })()}

      {/* Features */}
      {summary.features.length > 0 && (
        <View style={{ marginTop: 4 }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            Rasgos Obtenidos
          </Text>
          {summary.features.map((feature, index) => (
            <FeatureCard key={`${feature.nombre}-${index}`} feature={feature} />
          ))}
        </View>
      )}

      {summary.features.length === 0 &&
        !summary.hasASI &&
        !summary.choosesSubclass &&
        !summary.spellLearning && (
          <View
            style={{
              alignItems: "center",
              padding: 20,
              backgroundColor: colors.bgCard,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.borderDefault,
            }}
          >
            <Ionicons name="heart" size={24} color={colors.accentDanger} />
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                fontWeight: "500",
                textAlign: "center",
                marginTop: 8,
              }}
            >
              En este nivel ganas Puntos de Golpe adicionales y tus dados de
              golpe aumentan.
            </Text>
          </View>
        )}
    </ScrollView>
  );
}
