/**
 * HitDiceSection - Hit Dice tracker and usage
 *
 * Shows remaining hit dice as visual tiles and a "Use" button.
 * Extracted from CombatTab.tsx
 */

import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCharacterStore } from "@/stores/characterStore";
import { useTheme } from "@/hooks";
import { withAlpha } from "@/utils/theme";

interface HitDiceSectionProps {
  onShowToast: (message: string) => void;
}

export function HitDiceSection({ onShowToast }: HitDiceSectionProps) {
  const { colors } = useTheme();
  const { character, useHitDie } = useCharacterStore();

  if (!character) return null;

  const { hitDice, hp } = character;

  const handleUseHitDie = async () => {
    const result = await useHitDie();
    if (result) {
      onShowToast(`Dado de golpe: +${result.healed} PG`);
    } else {
      onShowToast("No quedan dados de golpe");
    }
  };

  return (
    <View className="rounded-card border p-4 mb-4" style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}>
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons name="dice-outline" size={20} color={colors.accentRed} />
          <Text className="text-xs font-semibold uppercase tracking-wider ml-2" style={{ color: colors.textSecondary }}>
            Dados de Golpe
          </Text>
        </View>
        <Text className="text-xs" style={{ color: colors.textSecondary }}>
          {hitDice.die}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          {Array.from({ length: hitDice.total }).map((_, i) => (
            <View
              key={i}
              className="h-8 w-8 rounded-lg mx-0.5 items-center justify-center border"
              style={{
                backgroundColor:
                  i < hitDice.remaining
                    ? `${colors.accentRed}20`
                    : colors.bgPrimary,
                borderColor:
                  i < hitDice.remaining
                    ? `${colors.accentRed}66`
                    : colors.borderDefault,
              }}
            >
              <Ionicons
                name="dice"
                size={16}
                color={
                  i < hitDice.remaining
                    ? colors.accentRed
                    : colors.borderDefault
                }
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          className={`rounded-lg px-4 py-2 ${
            hitDice.remaining > 0 && hp.current < hp.max
              ? ""
              : "opacity-50"
          }`}
          style={{
            backgroundColor:
              hitDice.remaining > 0 && hp.current < hp.max
                ? withAlpha(colors.accentRed, 0.8)
                : colors.bgCard,
          }}
          onPress={handleUseHitDie}
          disabled={hitDice.remaining <= 0 || hp.current >= hp.max}
        >
          <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
            Usar
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-[10px] mt-2" style={{ color: colors.textMuted }}>
        {hitDice.remaining}/{hitDice.total} disponibles · Clic en "Usar" para
        tirar {hitDice.die} + mod. CON
      </Text>
    </View>
  );
}
