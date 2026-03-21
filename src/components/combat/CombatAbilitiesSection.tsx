/**
 * CombatAbilitiesSection — Habilidades de combate (clase + raza/rasgos).
 *
 * Muestra habilidades usables activamente en combate:
 * 1. Class abilities from getClassAbilities() — actions, bonus actions, reactions
 * 2. Trait-based abilities from character.traits — racial/feat/subclass active abilities
 *    (anything with maxUses, i.e. limited-use active abilities like Breath Weapon)
 *
 * Excludes abilities already shown in SneakAttackSection and ClassResourcesCombatSection.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCharacterStore } from '@/stores/characterStore';
import { useTheme, useToast } from '@/hooks';
import { withAlpha } from '@/utils/theme';
import { getClassData } from '@/data/srd/classes';
import { getClassAbilities } from '@/data/srd/classAbilities';
import type { Trait } from '@/types/character';
import { Toast } from '@/components/ui';

// ─── Shared types ────────────────────────────────────────────────────

type ActionType = 'action' | 'bonus' | 'reaction' | 'on_attack' | 'passive' | 'turn_start';

interface AbilityMeta {
  actionType: ActionType;
  icon: keyof typeof Ionicons.glyphMap;
}

const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  action: 'Acción',
  bonus: 'Acción adicional',
  reaction: 'Reacción',
  on_attack: 'Al atacar',
  passive: 'Pasiva',
  turn_start: 'Inicio del turno',
};

const ACTION_TYPE_SORT: Record<ActionType, number> = {
  action: 0,
  bonus: 1,
  reaction: 2,
  on_attack: 3,
  turn_start: 4,
  passive: 5,
};

// ─── Class ability metadata ──────────────────────────────────────────

/** Passive / non-combat / already-shown class ability IDs to exclude */
const EXCLUDED_CLASS_IDS = new Set([
  'ataque_furtivo',
  'defensa_sin_armadura_barbaro',
  'defensa_sin_armadura_monje',
  'estilo_combate',
  'pericia',
  'jerga_ladrones',
  'talento_fiable',
  'sentido_ciego',
  'mente_escurridiza',
  'elusivo',
  'cuerpo_y_mente',
  'golpes_potenciados',
  'instinto_salvaje',
  'sentido_peligro',
  'furia_persistente',
  'concentracion_elevada',
  'autorrestauracion',
  'concentracion_perfecta',
  'superviviente_disciplinado',
  'movimiento_rapido',
  'movimiento_sin_armadura',
  'movimiento_acrobatico',
]);

/** Combat action type + icon for each class ability */
const CLASS_ABILITY_META: Record<string, AbilityMeta> = {
  // Bárbaro
  ataque_temerario: { actionType: 'on_attack', icon: 'skull-outline' },
  ataque_extra_barbaro: { actionType: 'passive', icon: 'repeat-outline' },
  furia_incansable: { actionType: 'turn_start', icon: 'heart-outline' },
  critico_brutal: { actionType: 'on_attack', icon: 'flame-outline' },
  // Guerrero
  ataque_extra_guerrero: { actionType: 'passive', icon: 'repeat-outline' },
  // Monje
  artes_marciales: { actionType: 'bonus', icon: 'hand-left-outline' },
  rafaga_golpes: { actionType: 'bonus', icon: 'flash-outline' },
  defensa_paciente: { actionType: 'bonus', icon: 'shield-outline' },
  paso_del_viento: { actionType: 'bonus', icon: 'walk-outline' },
  desviar_ataques: { actionType: 'reaction', icon: 'hand-right-outline' },
  caida_lenta: { actionType: 'reaction', icon: 'trending-down-outline' },
  ataque_extra_monje: { actionType: 'passive', icon: 'repeat-outline' },
  golpe_aturdidor: { actionType: 'on_attack', icon: 'flash-outline' },
  defensa_superior: { actionType: 'turn_start', icon: 'shield-checkmark-outline' },
  // Pícaro
  accion_astuta: { actionType: 'bonus', icon: 'footsteps-outline' },
  esquiva_prodigiosa: { actionType: 'reaction', icon: 'shield-half-outline' },
  evasion_picaro: { actionType: 'passive', icon: 'body-outline' },
  evasion_monje: { actionType: 'passive', icon: 'body-outline' },
};

// ─── Trait ability metadata (by trait name → combat meta) ────────────

const TRAIT_META: Record<string, AbilityMeta> = {
  'Ataque de Aliento': { actionType: 'action', icon: 'flame-outline' },
  'Vuelo Dracónico': { actionType: 'bonus', icon: 'airplane-outline' },
  'Afinidad con la Piedra': { actionType: 'bonus', icon: 'earth-outline' },
  'Aguante Incansable': { actionType: 'reaction', icon: 'heart-outline' },
  'Ataques Salvajes': { actionType: 'on_attack', icon: 'flash-outline' },
  'Salto Liebren': { actionType: 'bonus', icon: 'trending-up-outline' },
  'Pies de la Suerte': { actionType: 'reaction', icon: 'dice-outline' },
};

/** Default meta for traits with limited uses that aren't in the map above */
const DEFAULT_TRAIT_META: AbilityMeta = { actionType: 'action', icon: 'star-outline' };

// ─── Unified item type ───────────────────────────────────────────────

interface CombatAbilityItem {
  id: string;
  nombre: string;
  descripcion: string;
  meta: AbilityMeta;
  /** If backed by a character trait with limited uses */
  trait?: Trait;
  /** Class ability resource cost */
  resourceCostLabel?: string;
  resourceCostColor?: string;
  /** Class ability scale info */
  escalaLabel?: string;
  /** Origin label for badge */
  origen?: string;
}

// ─── Component ───────────────────────────────────────────────────────

export function CombatAbilitiesSection() {
  const { colors } = useTheme();
  const { toastProps, showInfo: showToast } = useToast();
  const { character, useTraitCharge, restoreTraitCharges } = useCharacterStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!character) return null;

  const classColor = getClassData(character.clase).color;

  // ── 1. Class abilities ──
  const classItems: CombatAbilityItem[] = getClassAbilities(character.clase, character.nivel)
    .filter((a) => !EXCLUDED_CLASS_IDS.has(a.id) && !a.recurso && CLASS_ABILITY_META[a.id])
    .map((a) => ({
      id: a.id,
      nombre: a.nombre,
      descripcion: a.descripcion,
      meta: CLASS_ABILITY_META[a.id]!,
      resourceCostLabel: a.resourceCost?.label,
      resourceCostColor: a.resourceCost?.color,
      escalaLabel: a.escala ? `${a.escala.label}: ${a.escala.value}` : undefined,
      origen: 'Clase',
    }));

  // ── 2. Trait-based combat abilities (racial, feat, subclass, etc.) ──
  const traitItems: CombatAbilityItem[] = (character.traits ?? [])
    .filter((t) => t.maxUses !== null && t.maxUses > 0)
    .map((t) => ({
      id: t.id,
      nombre: t.nombre,
      descripcion: t.descripcion,
      meta: TRAIT_META[t.nombre] ?? DEFAULT_TRAIT_META,
      trait: t,
      origen: t.origen === 'raza' ? 'Raza' : t.origen === 'dote' ? 'Dote' : t.origen === 'subclase' ? 'Subclase' : 'Rasgo',
    }));

  // ── Merge and sort ──
  const allItems = [...traitItems, ...classItems].sort(
    (a, b) => ACTION_TYPE_SORT[a.meta.actionType] - ACTION_TYPE_SORT[b.meta.actionType],
  );

  if (allItems.length === 0) return null;

  // ── Handlers ──
  const handleUseCharge = async (trait: Trait) => {
    await useTraitCharge(trait.id);
    showToast(`${trait.nombre} usado`);
  };

  const handleRestoreCharge = async (trait: Trait) => {
    await restoreTraitCharges(trait.id);
    showToast(`${trait.nombre} restaurado`);
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
        <View className="flex-row items-center mb-3">
          <Ionicons name="flash" size={20} color={classColor} />
          <Text className="text-sm font-bold ml-2" style={{ color: colors.textPrimary }}>
            Habilidades de Combate
          </Text>
        </View>

        {/* Ability cards */}
        <View style={{ gap: 8 }}>
          {allItems.map((item) => {
            const isExpanded = expandedId === item.id;
            const hasTrait = item.trait != null;
            const chargesLeft = item.trait?.currentUses ?? 0;
            const chargesMax = item.trait?.maxUses ?? 0;
            const canUse = chargesLeft > 0;

            const rechargeLabel = item.trait?.recharge === 'short_rest'
              ? 'Desc. corto'
              : item.trait?.recharge === 'long_rest'
                ? 'Desc. largo'
                : item.trait?.recharge === 'dawn'
                  ? 'Al amanecer'
                  : null;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
                className="rounded-lg border p-3"
                style={{
                  backgroundColor: isExpanded
                    ? withAlpha(classColor, 0.06)
                    : colors.bgCard,
                  borderColor: isExpanded
                    ? withAlpha(classColor, 0.25)
                    : colors.borderDefault,
                }}
              >
                {/* Row: icon + name + badges */}
                <View className="flex-row items-center">
                  <Ionicons name={item.meta.icon} size={16} color={classColor} />
                  <Text
                    className="text-xs font-semibold ml-2 flex-1"
                    style={{ color: colors.textPrimary }}
                    numberOfLines={1}
                  >
                    {item.nombre}
                  </Text>

                  {/* Charges badge (for traits with uses) */}
                  {hasTrait && (
                    <View
                      className="rounded-md px-2 py-0.5 ml-1"
                      style={{
                        backgroundColor: withAlpha(
                          canUse ? colors.accentGreen : colors.textMuted,
                          0.15,
                        ),
                      }}
                    >
                      <Text
                        className="text-[10px] font-bold"
                        style={{ color: canUse ? colors.accentGreen : colors.textMuted }}
                      >
                        {chargesLeft}/{chargesMax}
                      </Text>
                    </View>
                  )}

                  {/* Action type badge */}
                  <View
                    className="rounded-md px-2 py-0.5 ml-1"
                    style={{ backgroundColor: withAlpha(classColor, 0.12) }}
                  >
                    <Text className="text-[10px] font-semibold" style={{ color: classColor }}>
                      {ACTION_TYPE_LABELS[item.meta.actionType]}
                    </Text>
                  </View>

                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={colors.textMuted}
                    style={{ marginLeft: 6 }}
                  />
                </View>

                {/* Expanded content */}
                {isExpanded && (
                  <View className="mt-2 pt-2 border-t" style={{ borderColor: colors.borderDefault }}>
                    <Text className="text-xs leading-4" style={{ color: colors.textSecondary }}>
                      {item.descripcion}
                    </Text>

                    {/* Info badges row */}
                    <View className="flex-row flex-wrap mt-2" style={{ gap: 6 }}>
                      {/* Origin badge */}
                      {item.origen && (
                        <View
                          className="rounded-md px-2 py-1"
                          style={{ backgroundColor: withAlpha(colors.textMuted, 0.1) }}
                        >
                          <Text className="text-[10px] font-semibold" style={{ color: colors.textMuted }}>
                            {item.origen}
                          </Text>
                        </View>
                      )}

                      {/* Recharge info */}
                      {rechargeLabel && (
                        <View
                          className="flex-row items-center rounded-md px-2 py-1"
                          style={{ backgroundColor: withAlpha(colors.accentBlue, 0.1) }}
                        >
                          <Ionicons name="refresh-outline" size={10} color={colors.accentBlue} />
                          <Text
                            className="text-[10px] font-semibold ml-1"
                            style={{ color: colors.accentBlue }}
                          >
                            {rechargeLabel}
                          </Text>
                        </View>
                      )}

                      {/* Resource cost (class abilities) */}
                      {item.resourceCostLabel && (
                        <View
                          className="flex-row items-center rounded-md px-2 py-1"
                          style={{
                            backgroundColor: withAlpha(item.resourceCostColor ?? classColor, 0.12),
                          }}
                        >
                          <Ionicons
                            name="pricetag-outline"
                            size={10}
                            color={item.resourceCostColor ?? classColor}
                          />
                          <Text
                            className="text-[10px] font-semibold ml-1"
                            style={{ color: item.resourceCostColor ?? classColor }}
                          >
                            {item.resourceCostLabel}
                          </Text>
                        </View>
                      )}

                      {/* Scale info (class abilities) */}
                      {item.escalaLabel && (
                        <View
                          className="flex-row items-center rounded-md px-2 py-1"
                          style={{ backgroundColor: withAlpha(classColor, 0.1) }}
                        >
                          <Ionicons name="trending-up-outline" size={10} color={classColor} />
                          <Text
                            className="text-[10px] font-semibold ml-1"
                            style={{ color: classColor }}
                          >
                            {item.escalaLabel}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Use / Restore buttons for trait-based abilities */}
                    {hasTrait && (
                      <View className="flex-row mt-3" style={{ gap: 8 }}>
                        <TouchableOpacity
                          className="flex-1 flex-row items-center justify-center rounded-lg py-2 active:opacity-70"
                          style={{
                            backgroundColor: withAlpha(classColor, canUse ? 0.12 : 0.05),
                          }}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            if (canUse) handleUseCharge(item.trait!);
                          }}
                          disabled={!canUse}
                        >
                          <Ionicons
                            name="remove-circle-outline"
                            size={14}
                            color={canUse ? classColor : colors.textMuted}
                          />
                          <Text
                            className="text-xs font-semibold ml-1"
                            style={{ color: canUse ? classColor : colors.textMuted }}
                          >
                            Usar
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          className="flex-1 flex-row items-center justify-center rounded-lg py-2 active:opacity-70"
                          style={{
                            backgroundColor: withAlpha(colors.accentGreen, chargesLeft < chargesMax ? 0.12 : 0.05),
                          }}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            if (chargesLeft < chargesMax) handleRestoreCharge(item.trait!);
                          }}
                          disabled={chargesLeft >= chargesMax}
                        >
                          <Ionicons
                            name="add-circle-outline"
                            size={14}
                            color={chargesLeft < chargesMax ? colors.accentGreen : colors.textMuted}
                          />
                          <Text
                            className="text-xs font-semibold ml-1"
                            style={{ color: chargesLeft < chargesMax ? colors.accentGreen : colors.textMuted }}
                          >
                            Restaurar
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Toast {...toastProps} />
    </>
  );
}
