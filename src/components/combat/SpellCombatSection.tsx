/**
 * SpellCombatSection — Sección de magia para la pestaña de combate.
 *
 * Diseño claro y compacto:
 *  1. Banner con stats clave (CD / Ataque) con texto explicativo
 *  2. Espacios de conjuro con interacción táctil clara
 *  3. Magia de pacto (Brujo)
 *  4. Puntos de hechicería + metamagia (Hechicero)
 *  5. Lista de conjuros — toca para lanzar y gastar espacio
 *
 * Es auto-contenido: lee todo del store directamente.
 */

import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useDialog, useToast } from "@/hooks";
import { withAlpha } from "@/utils/theme";
import { getSpellLevelColors } from "@/constants/abilities";
import { useCharacterStore } from "@/stores/characterStore";
import {
  SPELLCASTING_ABILITY,
  CLASS_CASTER_TYPE,
  CLASS_SPELL_PREPARATION,
  type MetamagicOption,
  METAMAGIC_NAMES,
  METAMAGIC_DESCRIPTIONS,
  METAMAGIC_COSTS,
} from "@/types/spell";
import {
  ABILITY_NAMES,
  formatModifier,
  type AbilityKey,
} from "@/types/character";
import { getSpellById } from "@/data/srd/spells";
import { getSpellDescription } from "@/data/srd/spellDescriptions";
import { getClassData } from "@/data/srd/classes";
import { ConfirmDialog, Toast } from "@/components/ui";

// ─── Compact Spell Row ───────────────────────────────────────────────

function CastableSpellRow({
  spellId,
  name,
  level,
  prepared,
  onCast,
}: {
  spellId: string;
  name: string;
  level: number;
  prepared: boolean;
  onCast: (level: number) => void;
}) {
  const { colors } = useTheme();
  const spellColors = getSpellLevelColors(colors);
  const color = colors.accentRed;

  const castingTimeInfo = (() => {
    const desc = getSpellDescription(spellId);
    if (!desc?.tiempo) return null;
    const t = desc.tiempo.toLowerCase();
    if (t.includes("acción adicional"))
      return { icon: "flash" as const, color: colors.accentRed, label: "Adic." };
    if (t.includes("reacción"))
      return { icon: "arrow-undo" as const, color: colors.accentRed, label: "Reacc." };
    return null;
  })();

  return (
    <TouchableOpacity
      activeOpacity={prepared ? 0.6 : 1}
      onPress={() => prepared && onCast(level)}
      className="flex-row items-center rounded-lg p-2.5 mb-1.5 border"
      style={{
        backgroundColor: colors.bgSecondary,
        borderColor: colors.borderDefault,
        opacity: prepared ? 1 : 0.45,
      }}
    >
      {/* Level circle */}
      <View
        className="h-7 w-7 rounded-full items-center justify-center mr-2.5"
        style={{ backgroundColor: `${color}20` }}
      >
        <Text className="text-[11px] font-bold" style={{ color }}>
          {level}
        </Text>
      </View>

      {/* Name + badges */}
      <View className="flex-1">
        <Text className="text-sm font-medium" style={{ color: colors.textPrimary }}>
          {name}
        </Text>
        <View className="flex-row items-center mt-0.5">
          {prepared && (
            <View className="flex-row items-center mr-1.5">
              <Ionicons name="checkmark-circle" size={9} color={colors.accentGreen} />
              <Text className="text-[9px] ml-0.5" style={{ color: colors.accentGreen }}>
                Prep.
              </Text>
            </View>
          )}
          {castingTimeInfo && (
            <View
              className="flex-row items-center rounded-full px-1.5"
              style={{ backgroundColor: withAlpha(castingTimeInfo.color, 0.15) }}
            >
              <Ionicons name={castingTimeInfo.icon} size={8} color={castingTimeInfo.color} />
              <Text className="text-[8px] font-semibold ml-0.5" style={{ color: castingTimeInfo.color }}>
                {castingTimeInfo.label}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Cast hint icon */}
      {prepared && (
        <Ionicons name="sparkles" size={16} color={withAlpha(colors.accentRed, 0.6)} />
      )}
    </TouchableOpacity>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export function SpellCombatSection() {
  const { isDark, colors } = useTheme();
  const { dialogProps, showConfirm } = useDialog();
  const { toastProps, showInfo: showToast } = useToast();

  const {
    character,
    magicState,
    useSpellSlot,
    restoreSpellSlot,
    restoreAllSpellSlots,
    usePactSlot,
    restoreAllPactSlots,
  } = useCharacterStore();

  const [showAllSpells, setShowAllSpells] = useState(false);

  if (!character) return null;

  const casterType = CLASS_CASTER_TYPE[character.clase];
  if (casterType === "none") return null;

  const spellcastingAbility =
    SPELLCASTING_ABILITY[character.clase as keyof typeof SPELLCASTING_ABILITY];
  const preparationType = CLASS_SPELL_PREPARATION[character.clase];

  const abilityMod = spellcastingAbility
    ? character.abilityScores[spellcastingAbility].modifier
    : 0;
  const profBonus = character.proficiencyBonus;
  const spellSaveDC = 8 + profBonus + abilityMod;
  const spellAttackBonus = profBonus + abilityMod;
  const spellLevelColors = getSpellLevelColors(colors);
  const classColor = getClassData(character.clase).color;

  // ── Spell data ──

  const allSpellIds = magicState
    ? [
        ...new Set([
          ...(magicState.knownSpellIds ?? []),
          ...(magicState.preparedSpellIds ?? []),
          ...(magicState.spellbookIds ?? []),
        ]),
      ]
    : [
        ...new Set([
          ...(character.knownSpellIds ?? []),
          ...(character.preparedSpellIds ?? []),
          ...(character.spellbookIds ?? []),
        ]),
      ];

  const levelSpells = allSpellIds.filter((id) => {
    const spell = getSpellById(id);
    return spell
      ? spell.nivel > 0
      : !id.startsWith("truco_") && !id.includes("truco");
  });

  const spellsByLevel: Record<number, string[]> = {};
  for (const id of levelSpells) {
    const spell = getSpellById(id);
    const lvl = spell?.nivel ?? 1;
    if (!spellsByLevel[lvl]) spellsByLevel[lvl] = [];
    spellsByLevel[lvl].push(id);
  }
  const sortedSpellLevels = Object.keys(spellsByLevel)
    .map(Number)
    .sort((a, b) => a - b);

  const formatSpellName = (id: string): string => {
    const spell = getSpellById(id);
    if (spell) return spell.nombre;
    if (id.startsWith("custom:truco:")) return id.slice("custom:truco:".length);
    if (id.startsWith("custom:")) return id.slice("custom:".length);
    return id
      .replace(/^truco_/, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const isPrepared = (id: string): boolean => {
    if (preparationType === "known" || preparationType === "none") return true;
    if (magicState) return magicState.preparedSpellIds.includes(id);
    return character.preparedSpellIds.includes(id);
  };

  // ── Actions ──

  const handleUseSlot = async (level: number) => {
    const success = await useSpellSlot(level);
    if (success) showToast(`Espacio de nivel ${level} usado`);
    else showToast(`No quedan espacios de nivel ${level}`);
  };

  const handleRestoreSlot = async (level: number) => {
    await restoreSpellSlot(level);
    showToast(`Espacio de nivel ${level} restaurado`);
  };

  const handleRestoreAllSlots = () => {
    showConfirm(
      "Restaurar Espacios",
      "¿Restaurar todos los espacios de conjuro?",
      async () => {
        await restoreAllSpellSlots();
        if (character.clase === "brujo") await restoreAllPactSlots();
        showToast("Todos los espacios restaurados");
      },
      { confirmText: "Restaurar", cancelText: "Cancelar", type: "info" },
    );
  };

  const handleUsePactSlot = async () => {
    const success = await usePactSlot();
    if (success) showToast("Espacio de pacto usado");
    else showToast("No quedan espacios de pacto");
  };

  // ── Render: Spellcasting Header ──

  const renderSpellcastingHeader = () => {
    const abilityName = spellcastingAbility
      ? ABILITY_NAMES[spellcastingAbility]
      : "—";

    return (
      <View className="rounded-card border p-4 mb-4" style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}>
        {/* Title row */}
        <View className="flex-row items-center mb-1">
          <Ionicons name="flame" size={20} color={colors.accentRed} />
          <Text className="text-base font-bold ml-2" style={{ color: colors.textPrimary }}>
            Lanzamiento de conjuros
          </Text>
        </View>

        <Text className="text-sm mb-3" style={{ color: colors.textMuted }}>
          Aptitud mágica:{" "}
          <Text className="font-bold" style={{ color: colors.accentRed }}>
            {abilityName} ({formatModifier(abilityMod)})
          </Text>
        </Text>

        <View className="flex-row" style={{ gap: 10 }}>
          {/* Save DC */}
          <View
            className="flex-1 rounded-xl p-3 items-center border"
            style={{
              backgroundColor: withAlpha(colors.accentRed, 0.08),
              borderColor: withAlpha(colors.accentRed, 0.25),
            }}
          >
            <Text className="text-2xl font-bold" style={{ color: colors.accentRed }}>
              {spellSaveDC}
            </Text>
            <Text className="text-xs font-bold mt-0.5" style={{ color: colors.textSecondary }}>
              CD de Salvación
            </Text>
            <Text className="text-[10px] mt-0.5" style={{ color: colors.textMuted }}>
              8 + {profBonus} (comp.) + {abilityMod} ({abilityName?.slice(0, 3).toLowerCase()}.)
            </Text>
          </View>

          {/* Spell Attack */}
          <View
            className="flex-1 rounded-xl p-3 items-center border"
            style={{
              backgroundColor: withAlpha(colors.accentRed, 0.08),
              borderColor: withAlpha(colors.accentRed, 0.25),
            }}
          >
            <Text className="text-2xl font-bold" style={{ color: colors.accentRed }}>
              {formatModifier(spellAttackBonus)}
            </Text>
            <Text className="text-xs font-bold mt-0.5" style={{ color: colors.textSecondary }}>
              Mod. de Ataque
            </Text>
            <Text className="text-[10px] mt-0.5" style={{ color: colors.textMuted }}>
              {profBonus} (comp.) + {abilityMod} ({abilityName?.slice(0, 3).toLowerCase()}.)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // ── Render: Spell Slots ──

  const renderSpellSlots = () => {
    if (!magicState) return null;

    const slotEntries = Object.entries(magicState.spellSlots ?? {})
      .filter(([_, slot]) => slot && slot.total > 0)
      .sort(([a], [b]) => Number(a) - Number(b));

    if (slotEntries.length === 0 && !magicState.pactMagicSlots) return null;

    return (
      <View className="rounded-card border p-4 mb-4" style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}>
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Ionicons name="flash" size={20} color={colors.accentRed} />
            <Text className="text-sm font-bold ml-2" style={{ color: colors.textPrimary }}>
              Espacios de Conjuro
            </Text>
          </View>
          <TouchableOpacity
            className="rounded-lg px-3 py-1.5 active:opacity-70"
            style={{ backgroundColor: withAlpha(colors.accentRed, 0.15) }}
            onPress={handleRestoreAllSlots}
          >
            <Text className="text-xs font-semibold" style={{ color: colors.accentRed }}>
              Restaurar todos
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-[10px] mb-3" style={{ color: colors.textMuted }}>
          Toca un diamante lleno para gastar, o uno vacío para recuperar
        </Text>

        {/* Regular spell slots */}
        {slotEntries.map(([levelStr, slot]) => {
          if (!slot) return null;
          const level = Number(levelStr);
          const available = slot.total - slot.used;
          const color = colors.accentRed;

          return (
            <View key={level} className="flex-row items-center justify-between mb-2.5">
              <Text className="text-xs font-bold w-10" style={{ color }}>
                Nv {level}
              </Text>

              <View className="flex-row flex-1 justify-center">
                {Array.from({ length: slot.total }).map((_, i) => {
                  const isAvailable = i < available;
                  return (
                    <TouchableOpacity
                      key={i}
                      className="mx-0.5"
                      onPress={() =>
                        isAvailable ? handleUseSlot(level) : handleRestoreSlot(level)
                      }
                    >
                      <Ionicons
                        name={isAvailable ? "diamond" : "diamond-outline"}
                        size={20}
                        color={isAvailable ? color : withAlpha(colors.textMuted, 0.35)}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text className="text-xs w-10 text-right" style={{ color: colors.textMuted }}>
                {available}/{slot.total}
              </Text>
            </View>
          );
        })}

        {/* Pact Magic Slots (Warlock) */}
        {magicState.pactMagicSlots && (
          <View className="mt-1 pt-3 border-t" style={{ borderColor: colors.borderDefault }}>
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons name="bonfire-outline" size={16} color={colors.accentRed} />
                <Text className="text-xs font-bold ml-1.5" style={{ color: colors.accentRed }}>
                  Magia de Pacto (Nv. {magicState.pactMagicSlots.slotLevel})
                </Text>
              </View>
              <Text className="text-xs" style={{ color: colors.textMuted }}>
                {magicState.pactMagicSlots.total - magicState.pactMagicSlots.used}/
                {magicState.pactMagicSlots.total}
              </Text>
            </View>

            <View className="flex-row items-center justify-center mb-1">
              {Array.from({ length: magicState.pactMagicSlots.total }).map((_, i) => {
                const isAvailable =
                  i < magicState.pactMagicSlots!.total - magicState.pactMagicSlots!.used;
                return (
                  <TouchableOpacity
                    key={i}
                    className="mx-1"
                    onPress={
                      isAvailable
                        ? handleUsePactSlot
                        : async () => {
                            await restoreAllPactSlots();
                            showToast("Espacios de pacto restaurados");
                          }
                    }
                  >
                    <Ionicons
                      name={isAvailable ? "bonfire" : "bonfire-outline"}
                      size={22}
                      color={isAvailable ? colors.accentRed : withAlpha(colors.textMuted, 0.35)}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className="text-[10px] text-center" style={{ color: colors.textMuted }}>
              Se recuperan en descanso corto
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ── Render: Sorcery Points ──

  const renderSorceryPoints = () => {
    if (!magicState?.sorceryPoints || character.clase !== "hechicero") return null;

    const { max, current } = magicState.sorceryPoints;

    return (
      <View className="rounded-card border p-4 mb-4" style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}>
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Ionicons name="sparkles" size={20} color={classColor} />
            <Text className="text-sm font-bold ml-2" style={{ color: colors.textPrimary }}>
              Puntos de Hechicería
            </Text>
          </View>
          <Text className="text-lg font-bold" style={{ color: classColor }}>
            {current}/{max}
          </Text>
        </View>

        <View
          className="h-2.5 rounded-full overflow-hidden"
          style={{ backgroundColor: colors.bgSecondary }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${max > 0 ? (current / max) * 100 : 0}%`,
              backgroundColor: classColor,
            }}
          />
        </View>

        <Text className="text-[10px] mt-1.5" style={{ color: colors.textMuted }}>
          Se recuperan en descanso largo
        </Text>
      </View>
    );
  };

  // ── Render: Metamagic ──

  const renderMetamagicSection = () => {
    if (character.clase !== "hechicero") return null;
    const chosen = magicState?.metamagicChosen ?? [];
    if (chosen.length === 0) return null;

    return (
      <View className="rounded-card border p-4 mb-4" style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}>
        <View className="flex-row items-center mb-3">
          <Ionicons name="color-wand" size={20} color={colors.accentRed} />
          <Text className="text-sm font-bold ml-2" style={{ color: colors.textPrimary }}>
            Metamagia
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          {chosen.map((id) => {
            const name = METAMAGIC_NAMES[id as MetamagicOption] ?? id;
            const cost = METAMAGIC_COSTS[id as MetamagicOption];
            const desc = METAMAGIC_DESCRIPTIONS[id as MetamagicOption];

            return (
              <View
                key={id}
                className="rounded-xl border p-3"
                style={{
                  backgroundColor: withAlpha(colors.accentRed, isDark ? 0.08 : 0.05),
                  borderColor: withAlpha(colors.accentRed, isDark ? 0.2 : 0.15),
                }}
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-sm font-bold" style={{ color: colors.accentRed }}>
                    {name}
                  </Text>
                  {cost !== undefined && (
                    <View
                      className="rounded-lg px-2 py-0.5"
                      style={{ backgroundColor: withAlpha(colors.accentRed, 0.15) }}
                    >
                      <Text className="text-[11px] font-bold" style={{ color: colors.accentRed }}>
                        {cost} PH
                      </Text>
                    </View>
                  )}
                </View>
                {desc && (
                  <Text className="text-xs leading-[17px]" style={{ color: colors.textMuted }}>
                    {desc}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // ── Render: Castable Spell List ──

  const renderCastableSpells = () => {
    if (levelSpells.length === 0) return null;

    return (
      <View className="rounded-card border p-4 mb-4" style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}>
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center">
            <Ionicons name="flash-outline" size={20} color={colors.accentRed} />
            <Text className="text-sm font-bold ml-2" style={{ color: colors.textPrimary }}>
              Lanzar Conjuros
            </Text>
          </View>
          {levelSpells.length > 6 && (
            <TouchableOpacity
              onPress={() => setShowAllSpells(!showAllSpells)}
              className="rounded-lg px-2.5 py-1 active:opacity-70"
              style={{ backgroundColor: colors.bgSecondary }}
            >
              <Text className="text-[11px] font-medium" style={{ color: colors.textSecondary }}>
                {showAllSpells ? "Menos" : `Ver todos (${levelSpells.length})`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-[10px] mb-3" style={{ color: colors.textMuted }}>
          Toca un conjuro para lanzarlo y gastar un espacio
        </Text>

        {sortedSpellLevels.map((lvl) => {
          const spellsAtLevel = spellsByLevel[lvl];
          const lvlColor = colors.accentRed;

          return (
            <View
              key={lvl}
              style={{
                marginBottom:
                  lvl !== sortedSpellLevels[sortedSpellLevels.length - 1] ? 10 : 0,
              }}
            >
              {/* Level sub-header */}
              <View className="flex-row items-center mb-1" style={{ gap: 6 }}>
                <View
                  className="w-[22px] h-[22px] rounded-full items-center justify-center"
                  style={{ backgroundColor: `${lvlColor}20` }}
                >
                  <Text className="text-[10px] font-bold" style={{ color: lvlColor }}>
                    {lvl}
                  </Text>
                </View>
                <Text className="text-[11px] font-semibold" style={{ color: colors.textSecondary }}>
                  Nivel {lvl}
                </Text>
                <View className="flex-1 h-px ml-1" style={{ backgroundColor: colors.borderSubtle }} />
              </View>

              {(showAllSpells || levelSpells.length <= 6
                ? spellsAtLevel
                : spellsAtLevel.slice(0, 3)
              ).map((spellId) => (
                <CastableSpellRow
                  key={spellId}
                  spellId={spellId}
                  name={formatSpellName(spellId)}
                  level={getSpellById(spellId)?.nivel ?? lvl}
                  prepared={isPrepared(spellId)}
                  onCast={handleUseSlot}
                />
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  // ── Main render ──

  return (
    <>
      {renderSpellcastingHeader()}
      {renderSpellSlots()}
      {renderSorceryPoints()}
      {renderMetamagicSection()}
      {renderCastableSpells()}
      <ConfirmDialog {...dialogProps} />
      <Toast {...toastProps} />
    </>
  );
}
