/**
 * TraitCard - Unified trait/ability card
 *
 * Shows trait name, origin badge, optional charge management, and
 * expandable description. Used by both OverviewTab (read-only) and
 * CharacterTraitsSection (with charge controls).
 *
 * When `onUse`/`onRestore` callbacks are provided, charge +/- buttons appear.
 */

import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks";
import type { Trait } from "@/types/character";

const ORIGIN_LABELS: Record<string, string> = {
  raza: "Raza",
  clase: "Clase",
  subclase: "Subclase",
  trasfondo: "Trasfondo",
  dote: "Dote",
  manual: "Manual",
};

function useOriginColor(origen: string) {
  const { colors } = useTheme();
  const map: Record<string, string> = {
    raza: colors.accentRed,
    clase: colors.accentRed,
    subclase: colors.accentRed,
    trasfondo: colors.accentRed,
    dote: colors.accentRed,
    manual: colors.textMuted,
  };
  return map[origen] ?? colors.textMuted;
}

interface TraitCardProps {
  trait: Trait;
  /** When provided, enables the "use charge" button */
  onUse?: () => void;
  /** When provided, enables the "restore charge" button */
  onRestore?: () => void;
}

export function TraitCard({ trait, onUse, onRestore }: TraitCardProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const originColor = useOriginColor(trait.origen);
  const hasCharges = trait.maxUses !== null && trait.maxUses > 0;
  const chargesLeft = trait.currentUses ?? 0;
  const chargesMax = trait.maxUses ?? 0;
  const showControls = hasCharges && onUse && onRestore;

  const rechargeLabel =
    trait.recharge === "short_rest"
      ? "Desc. corto"
      : trait.recharge === "long_rest"
        ? "Desc. largo"
        : trait.recharge === "dawn"
          ? "Al amanecer"
          : trait.recharge ?? null;

  return (
    <View className="rounded-lg p-3 mb-2 border" style={{ backgroundColor: colors.bgCard, borderColor: colors.borderDefault }}>
      <TouchableOpacity
        className="flex-row items-center"
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        {/* Info column */}
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-sm font-semibold flex-1" style={{ color: colors.textPrimary }}>
              {trait.nombre}
            </Text>
            {/* Origin badge */}
            <View
              className="rounded-full px-2 py-0.5 ml-2"
              style={{ backgroundColor: `${originColor}22` }}
            >
              <Text
                className="text-[10px] font-semibold"
                style={{ color: originColor }}
              >
                {ORIGIN_LABELS[trait.origen] ?? trait.origen}
              </Text>
            </View>
          </View>

          {/* Charges + recharge info */}
          {(hasCharges || rechargeLabel) && (
            <View className="flex-row items-center mt-0.5">
              {hasCharges && (
                <Text className="text-[10px]" style={{ color: colors.textMuted }}>
                  {chargesLeft}/{chargesMax} usos
                </Text>
              )}
              {rechargeLabel && (
                <Text className="text-[10px] ml-2" style={{ color: colors.textMuted }}>
                  · {rechargeLabel}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Charge controls (only when callbacks provided) */}
        {showControls && (
          <View className="flex-row items-center mr-2">
            <TouchableOpacity
              className="rounded-lg px-2 py-1.5 mr-1 active:opacity-70"
              onPress={(e) => {
                e.stopPropagation?.();
                onUse();
              }}
              disabled={chargesLeft <= 0}
              style={[{ backgroundColor: colors.bgCard }, { opacity: chargesLeft > 0 ? 1 : 0.4 }]}
            >
              <Ionicons name="remove" size={14} color={colors.accentDanger} />
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded-lg px-2 py-1.5 active:opacity-70"
              onPress={(e) => {
                e.stopPropagation?.();
                onRestore();
              }}
              disabled={chargesLeft >= chargesMax}
              style={[{ backgroundColor: colors.bgCard }, { opacity: chargesLeft < chargesMax ? 1 : 0.4 }]}
            >
              <Ionicons name="add" size={14} color={colors.accentGreen} />
            </TouchableOpacity>
          </View>
        )}

        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      {expanded && (
        <View className="mt-2 pt-2 border-t" style={{ borderColor: colors.borderDefault }}>
          <Text className="text-xs leading-5" style={{ color: colors.textSecondary }}>
            {trait.descripcion}
          </Text>
        </View>
      )}
    </View>
  );
}
