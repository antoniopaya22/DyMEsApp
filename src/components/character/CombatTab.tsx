/**
 * CombatTab - Pestaña de combate del personaje
 * Muestra: HP tracker, clase de armadura, velocidad, salvaciones de muerte,
 * dados de golpe, condiciones activas y concentración.
 *
 * Sub-components extracted to src/components/combat/:
 *   HPTracker, DeathSavesTracker, HitDiceSection, ConditionsSection
 */

import { View, Text, Animated, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCharacterStore } from "@/stores/characterStore";
import { useHeaderScroll } from "@/hooks";
import { ConfirmDialog, Toast } from "@/components/ui";
import { useTheme, useDialog, useToast } from "@/hooks";
import { withAlpha } from "@/utils/theme";
import { formatModifier } from "@/types/character";

// Extracted sub-components
import {
  HPTracker,
  DeathSavesTracker,
  HitDiceSection,
  ConditionsSection,
  WeaponAttacks,
  SpellCombatSection,
} from "@/components/combat";

// ─── Main Component ──────────────────────────────────────────────────

export default function CombatTab() {
  const { colors } = useTheme();
  const { onScroll } = useHeaderScroll();
  const { dialogProps, showAlert, showConfirm } = useDialog();
  const {
    toastProps,
    showSuccess: toastSuccess,
    showInfo: showToast,
  } = useToast();

  const {
    character,
    shortRest,
    longRest,
    clearConcentration,
    getArmorClass,
  } = useCharacterStore();

  if (!character) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-base" style={{ color: colors.textSecondary }}>
          No se ha cargado ningún personaje
        </Text>
      </View>
    );
  }

  const { hp, hitDice, speed, concentration } = character;
  const ac = getArmorClass();

  // ── Actions ──

  const handleShortRest = () => {
    const buttons: Array<{
      text: string;
      style?: "default" | "cancel" | "destructive";
      onPress?: () => void;
    }> = [
      { text: "Cancelar", style: "cancel" as const },
      {
        text: "Ninguno",
        style: "default" as const,
        onPress: async () => {
          await shortRest(0);
          toastSuccess("Descanso corto completado");
        },
      },
    ];

    if (hitDice.remaining > 0) {
      buttons.push({
        text: `Usar 1`,
        style: "default" as const,
        onPress: async () => {
          const result = await shortRest(1);
          toastSuccess(
            `Descanso corto: +${result.hpRestored} PG`,
            `${result.diceUsed} dado(s) de golpe usados`,
          );
        },
      });
    }

    if (hitDice.remaining > 1) {
      buttons.push({
        text: `Usar todos (${hitDice.remaining})`,
        style: "default" as const,
        onPress: async () => {
          const result = await shortRest(hitDice.remaining);
          toastSuccess(
            `Descanso corto: +${result.hpRestored} PG`,
            `${result.diceUsed} dado(s) de golpe usados`,
          );
        },
      });
    }

    showConfirm(
      "Descanso Corto",
      `Tienes ${hitDice.remaining} dado(s) de golpe disponibles. ¿Cuántos quieres usar?`,
      async () => {
        await shortRest(0);
        toastSuccess("Descanso corto completado");
      },
      {
        confirmText: "Descansar sin dados",
        cancelText: "Cancelar",
        type: "info",
      },
    );
  };

  const handleLongRest = () => {
    showConfirm(
      "Descanso Largo",
      "¿Realizar un descanso largo?\n\n• Recuperas todos los PG\n• Recuperas la mitad de tus dados de golpe\n• Se restauran espacios de conjuro\n• Se restauran rasgos con recarga",
      async () => {
        await longRest();
        toastSuccess("Descanso largo completado", "¡PG al máximo!");
      },
      { confirmText: "Descansar", cancelText: "Cancelar", type: "info" },
    );
  };

  // ── Render Sections (kept inline — small enough) ──

  const renderStatsRow = () => (
    <View className="flex-row mb-4">
      {/* Armor Class */}
      <View className="flex-1 rounded-card border p-4 mr-2" style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}>
        <View className="items-center">
          <View className="h-14 w-14 rounded-full items-center justify-center mb-1" style={{ backgroundColor: withAlpha(colors.accentRed, 0.15) }}>
            <Ionicons name="shield" size={28} color={colors.accentRed} />
          </View>
          <Text className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {ac}
          </Text>
          <Text className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: colors.textMuted }}>
            Clase de Armadura
          </Text>
        </View>
      </View>

      {/* Initiative */}
      <View className="flex-1 rounded-card border p-4 mx-1" style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}>
        <View className="items-center">
          <View className="h-14 w-14 rounded-full items-center justify-center mb-1" style={{ backgroundColor: withAlpha(colors.accentRed, 0.15) }}>
            <Ionicons name="flash" size={28} color={colors.accentRed} />
          </View>
          <Text className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {formatModifier(character.abilityScores.des.modifier)}
          </Text>
          <Text className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: colors.textMuted }}>
            Iniciativa
          </Text>
        </View>
      </View>

      {/* Speed */}
      <View className="flex-1 rounded-card border p-4 ml-2" style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}>
        <View className="items-center">
          <View className="h-14 w-14 rounded-full items-center justify-center mb-1" style={{ backgroundColor: withAlpha(colors.accentRed, 0.15) }}>
            <Ionicons name="footsteps" size={28} color={colors.accentRed} />
          </View>
          <Text className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {speed.walk}
          </Text>
          <Text className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: colors.textMuted }}>
            Velocidad (pies)
          </Text>
        </View>
      </View>
    </View>
  );

  const renderConcentration = () => {
    if (!concentration) return null;

    return (
      <View className="rounded-card border p-4 mb-4" style={{ backgroundColor: colors.bgElevated, borderColor: withAlpha(colors.accentRed, 0.3) }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Ionicons name="eye" size={20} color={colors.accentRed} />
            <View className="ml-3 flex-1">
              <Text className="text-[10px] uppercase tracking-wider" style={{ color: colors.textMuted }}>
                Concentración
              </Text>
              <Text className="text-sm font-semibold" style={{ color: colors.accentRed }}>
                {concentration.spellName}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="rounded-lg px-3 py-1.5"
            style={{ backgroundColor: colors.bgCard }}
            onPress={() => {
              showConfirm(
                "Romper Concentración",
                `¿Dejar de concentrarte en "${concentration.spellName}"?`,
                clearConcentration,
                {
                  confirmText: "Romper",
                  cancelText: "Cancelar",
                  type: "danger",
                },
              );
            }}
          >
            <Text className="text-xs font-semibold" style={{ color: colors.accentRed }}>Romper</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderRestButtons = () => (
    <View className="flex-row mb-4">
      <TouchableOpacity onPress={handleShortRest} activeOpacity={0.7} className="flex-1 rounded-card border p-4 mr-2" style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}>
        <View className="items-center">
          <Ionicons name="cafe-outline" size={24} color={colors.accentRed} />
          <Text className="text-sm font-semibold mt-1" style={{ color: colors.textPrimary }}>
            Descanso Corto
          </Text>
          <Text className="text-[10px] mt-0.5" style={{ color: colors.textMuted }}>
            Usa dados de golpe
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLongRest} activeOpacity={0.7} className="flex-1 rounded-card border p-4 ml-2" style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}>
        <View className="items-center">
          <Ionicons name="moon-outline" size={24} color={colors.accentRed} />
          <Text className="text-sm font-semibold mt-1" style={{ color: colors.textPrimary }}>
            Descanso Largo
          </Text>
          <Text className="text-[10px] mt-0.5" style={{ color: colors.textMuted }}>Recupera todo</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <HPTracker onShowToast={showToast} />
        {renderStatsRow()}
        <WeaponAttacks />
        <DeathSavesTracker
          onShowAlert={showAlert}
          onShowConfirm={showConfirm}
        />
        {renderConcentration()}
        <SpellCombatSection />
        <HitDiceSection onShowToast={showToast} />
        <ConditionsSection
          onShowToast={showToast}
          onShowConfirm={showConfirm}
        />
        {renderRestButtons()}
      </Animated.ScrollView>

      {/* Custom dialog (replaces Alert.alert) */}
      <ConfirmDialog {...dialogProps} />

      {/* Toast notifications */}
      <Toast {...toastProps} />
    </View>
  );
}
