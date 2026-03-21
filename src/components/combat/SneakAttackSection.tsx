/**
 * SneakAttackSection — Ataque Furtivo del Pícaro en la pestaña de combate.
 *
 * Muestra el dado de ataque furtivo según el nivel y permite tirarlo.
 * Solo se renderiza si el personaje es un Pícaro.
 */

import { createElement } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCharacterStore } from '@/stores/characterStore';
import { useTheme, useDialog } from '@/hooks';
import { withAlpha } from '@/utils/theme';
import { SNEAK_ATTACK_DICE } from '@/data/srd/leveling';
import { getClassData } from '@/data/srd/classes';
import { parseFormula, executeFormula } from '@/utils/dice';
import { ConfirmDialog } from '@/components/ui';

export function SneakAttackSection() {
  const { colors } = useTheme();
  const { dialogProps, showDialog } = useDialog();
  const { character } = useCharacterStore();

  if (!character || character.clase !== 'picaro') return null;

  const sneakDice = SNEAK_ATTACK_DICE[character.nivel] ?? '1d6';
  const classColor = getClassData('picaro').color;

  const handleRollSneakAttack = () => {
    showDialog({
      type: 'confirm',
      title: 'Ataque Furtivo',
      message: `¿Tirar ${sneakDice} de daño de Ataque Furtivo?`,
      icon: 'eye-off-outline',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Tirar',
          style: 'default',
          onPress: () => {
            const parsed = parseFormula(sneakDice);
            if (!parsed) return;
            const result = executeFormula(parsed, 'normal', 0);
            const diceValues = result.rolls.map((r) => r.value).join(', ');

            setTimeout(() => {
              showDialog({
                type: 'info',
                title: 'Ataque Furtivo',
                message: `🎲 ${sneakDice} → [${diceValues}] = ${result.total}`,
                buttons: [{ text: 'OK', style: 'default' }],
                customIconContent: createElement(
                  Text,
                  {
                    style: {
                      fontSize: 28,
                      fontWeight: 'bold' as const,
                      color: classColor,
                    },
                  },
                  String(result.total),
                ),
              });
            }, 350);
          },
        },
      ],
    });
  };

  return (
    <>
      <View
        className="rounded-card border p-4 mb-4"
        style={{
          backgroundColor: colors.bgElevated,
          borderColor: colors.borderDefault,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Ionicons name="eye-off" size={20} color={classColor} />
            <Text className="text-sm font-bold ml-2" style={{ color: colors.textPrimary }}>
              Ataque Furtivo
            </Text>
          </View>
          <View
            className="rounded-lg px-2.5 py-1"
            style={{ backgroundColor: withAlpha(classColor, 0.15) }}
          >
            <Text className="text-xs font-bold" style={{ color: classColor }}>
              {sneakDice}
            </Text>
          </View>
        </View>

        <Text className="text-[10px] mb-3" style={{ color: colors.textMuted }}>
          Una vez por turno, daño adicional con ventaja o aliado a 1,5 m. Arma sutil o a distancia.
        </Text>

        {/* Roll button */}
        <TouchableOpacity
          className="flex-row items-center justify-center rounded-lg py-2.5 active:opacity-70"
          style={{ backgroundColor: withAlpha(classColor, 0.12) }}
          onPress={handleRollSneakAttack}
        >
          <Ionicons name="dice-outline" size={18} color={classColor} />
          <Text className="text-sm font-semibold ml-2" style={{ color: classColor }}>
            Tirar Ataque Furtivo ({sneakDice})
          </Text>
        </TouchableOpacity>
      </View>

      <ConfirmDialog {...dialogProps} />
    </>
  );
}
