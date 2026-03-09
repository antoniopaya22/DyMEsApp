import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks";
import type { Trait } from "@/types/character";
import { TraitCard } from "@/components/character/TraitCard";

// ══════════════════════════════════════════════════════════════════
// Props
// ══════════════════════════════════════════════════════════════════

interface CharacterTraitsSectionProps {
  traits: Trait[];
  onUseCharge: (traitId: string, traitName: string) => void;
  onRestoreCharges: (traitId: string, traitName: string) => void;
}

// ══════════════════════════════════════════════════════════════════
// CharacterTraitsSection
// ══════════════════════════════════════════════════════════════════

export default function CharacterTraitsSection({
  traits,
  onUseCharge,
  onRestoreCharges,
}: CharacterTraitsSectionProps) {
  const { colors } = useTheme();

  // Show traits that come from class/race/background
  const filtered = traits.filter(
    (t) =>
      t.origen === "clase" ||
      t.origen === "subclase" ||
      t.origen === "raza" ||
      t.origen === "trasfondo" ||
      t.origen === "dote",
  );

  if (filtered.length === 0) return null;

  return (
    <View className="rounded-card border p-4 mb-4" style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}>
      <View className="flex-row items-center mb-3">
        <Ionicons name="ribbon" size={20} color={colors.accentRed} />
        <Text className="text-xs font-semibold uppercase tracking-wider ml-2" style={{ color: colors.textSecondary }}>
          Rasgos y Capacidades
        </Text>
      </View>

      {filtered.map((trait) => (
        <TraitCard
          key={trait.id}
          trait={trait}
          onUse={() => onUseCharge(trait.id, trait.nombre)}
          onRestore={() => onRestoreCharges(trait.id, trait.nombre)}
        />
      ))}
    </View>
  );
}
