/**
 * AbilitiesTab - Pestaña de habilidades de clase del personaje.
 *
 * Para lanzadores de conjuros: muestra espacios de conjuro, trucos, hechizos
 * conocidos/preparados, libro de hechizos (mago), magia de pacto (brujo), y
 * puntos de hechicería.
 *
 * Para no-lanzadores: muestra habilidades de clase específicas como Furia
 * (bárbaro), Puntos de Concentración (monje), Ataque Furtivo (pícaro), etc.
 *
 * This is the orchestrator shell — all section UI lives in ./abilities/*.
 */

import { useState } from "react";
import { View, Animated, Text } from "react-native";
import { useCharacterStore } from "@/stores/characterStore";
import { useHeaderScroll } from "@/hooks";
import { ConfirmDialog, Toast } from "@/components/ui";
import { useTheme, useDialog, useToast } from "@/hooks";
import {
  SPELLCASTING_ABILITY,
  CLASS_CASTER_TYPE,
  CLASS_SPELL_PREPARATION,
  SPELLS_KNOWN,
} from "@/types/spell";
import type { ClassId } from "@/types/character";
import { getClassData } from "@/data/srd/classes";
import { getSpellById, getSpellsForClassUpToLevel } from "@/data/srd/spells";
import { getMaxSpellLevelForClass } from "@/data/srd/leveling";
import { calcPreparedSpells } from "@/utils/spells";
import { getClassAbilityTheme } from "@/constants/abilities";

// Section components
import ClassResourceSlots from "./abilities/ClassResourceSlots";
import ClassAbilitiesSection from "./abilities/ClassAbilitiesSection";
import SpellcastingSection from "./abilities/SpellcastingSection";
import CantripsSection from "./abilities/CantripsSection";
import CharacterTraitsSection from "./abilities/CharacterTraitsSection";

// ─── Component ───────────────────────────────────────────────────────

export default function AbilitiesTab() {
  const { colors } = useTheme();
  const { onScroll } = useHeaderScroll();
  const { dialogProps, showConfirm } = useDialog();
  const { toastProps, showInfo: showToast } = useToast();
  const {
    character,
    magicState,
    classResources,
    setConcentration,
    useTraitCharge,
    restoreTraitCharges,
    useClassResource,
    useClassResourceAmount,
    restoreClassResource,
    restoreAllClassResources,
    togglePreparedSpell,
  } = useCharacterStore();

  const [expandedAbility, setExpandedAbility] = useState<string | null>(null);

  if (!character) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-base" style={{ color: colors.textSecondary }}>
          No se ha cargado ningún personaje
        </Text>
      </View>
    );
  }

  // ── Derived values ──

  const casterType = CLASS_CASTER_TYPE[character.clase];
  const spellcastingAbility =
    SPELLCASTING_ABILITY[character.clase as keyof typeof SPELLCASTING_ABILITY];
  const preparationType = CLASS_SPELL_PREPARATION[character.clase];
  const classData = getClassData(character.clase);
  const classTheme = getClassAbilityTheme(colors)[character.clase];

  const isNonCaster = casterType === "none";

  const abilityMod = spellcastingAbility
    ? character.abilityScores[spellcastingAbility].modifier
    : 0;
  const profBonus = character.proficiencyBonus;
  const spellSaveDC = 8 + profBonus + abilityMod;
  const spellAttackBonus = profBonus + abilityMod;

  // ── Spell data (for casters) ──

  // Determinar si es un lanzador preparado puro (acceso a toda la lista de clase)
  // Clérigo, Druida, Paladín tienen preparationType === "prepared" y NO tienen
  // tabla SPELLS_KNOWN (a diferencia de Bardo, Hechicero, Explorador que sí la tienen).
  const isPreparedCaster =
    preparationType === "prepared" && !SPELLS_KNOWN[character.clase as ClassId];

  const maxSpellLevel = getMaxSpellLevelForClass(
    character.clase as ClassId,
    character.nivel,
  );

  // Para lanzadores preparados: incluir todos los conjuros de clase disponibles
  const classSpellIds = isPreparedCaster
    ? getSpellsForClassUpToLevel(character.clase as ClassId, maxSpellLevel).map(
        (s) => s.id,
      )
    : [];

  const storedSpellIds = magicState
    ? [
        ...magicState.knownSpellIds,
        ...magicState.preparedSpellIds,
        ...magicState.spellbookIds,
      ]
    : [
        ...character.knownSpellIds,
        ...character.preparedSpellIds,
        ...character.spellbookIds,
      ];

  const allSpellIds = [...new Set([...storedSpellIds, ...classSpellIds])];

  const cantrips = allSpellIds.filter((id) => {
    const spell = getSpellById(id);
    return spell
      ? spell.nivel === 0
      : id.startsWith("truco_") || id.includes("truco");
  });
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
    // Custom spells: strip prefix and return the user-given name
    if (id.startsWith("custom:truco:")) return id.slice("custom:truco:".length);
    if (id.startsWith("custom:")) return id.slice("custom:".length);
    return id
      .replace(/^truco_/, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getSpellLevel = (id: string): number => getSpellById(id)?.nivel ?? 1;

  const canCastSpell = (id: string): boolean => {
    if (preparationType === "known" || preparationType === "none") return true;
    return isPrepared(id);
  };

  const isPrepared = (id: string): boolean => {
    if (magicState) return magicState.preparedSpellIds.includes(id);
    return character.preparedSpellIds.includes(id);
  };

  const isInSpellbook = (id: string): boolean => {
    if (magicState) return magicState.spellbookIds.includes(id);
    return character.spellbookIds.includes(id);
  };

  // ── Prepared spell count ──

  const currentPreparedCount = magicState
    ? magicState.preparedSpellIds.filter((id) => {
        const s = getSpellById(id);
        return s ? s.nivel > 0 : true;
      }).length
    : character.preparedSpellIds.filter((id) => {
        const s = getSpellById(id);
        return s ? s.nivel > 0 : true;
      }).length;

  const maxPreparedSpells =
    (preparationType === "prepared" || preparationType === "spellbook") &&
    spellcastingAbility
      ? calcPreparedSpells(character.clase, character.nivel, abilityMod)
      : undefined;

  // ── Toggle prepared handler ──

  const handleTogglePrepared = async (spellId: string) => {
    if (!togglePreparedSpell) return;
    const nowPrepared = await togglePreparedSpell(spellId);
    showToast(nowPrepared ? "Conjuro preparado" : "Conjuro despreparado");
  };

  const handleUseTraitCharge = async (traitId: string, traitName: string) => {
    await useTraitCharge(traitId);
    showToast(`${traitName}: uso consumido`);
  };

  const handleRestoreTraitCharges = async (
    traitId: string,
    traitName: string,
  ) => {
    await restoreTraitCharges(traitId);
    showToast(`${traitName}: usos restaurados`);
  };

  // ── Class Resource Actions ──

  const handleUseClassResource = async (resourceId: string, nombre: string) => {
    const success = await useClassResource(resourceId);
    if (success) showToast(`${nombre}: uso consumido`);
    else showToast(`${nombre}: no quedan usos`);
  };

  const handleUseClassResourceAmount = async (
    resourceId: string,
    amount: number,
    abilityName: string,
  ) => {
    const res = classResources?.resources[resourceId];
    if (!res || res.current < amount) {
      const resName = res?.nombre ?? resourceId;
      showToast(`${abilityName}: no tienes suficientes ${resName}`);
      return;
    }
    const ok = await useClassResourceAmount(resourceId, amount);
    if (ok) showToast(`${abilityName}: -${amount} ${res.nombre}`);
  };

  const handleRestoreClassResource = async (
    resourceId: string,
    nombre: string,
  ) => {
    await restoreClassResource(resourceId);
    showToast(`${nombre}: usos restaurados`);
  };

  const handleRestoreAllClassResources = () => {
    showConfirm(
      "Restaurar Recursos",
      "¿Restaurar todos los recursos de clase?",
      async () => {
        await restoreAllClassResources();
        showToast("Recursos restaurados");
      },
      { confirmText: "Restaurar", cancelText: "Cancelar", type: "info" },
    );
  };

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════

  if (isNonCaster) {
    return (
      <View style={{ flex: 1 }}>
        <Animated.ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          <ClassAbilitiesSection
            character={character}
            classData={classData}
            classTheme={classTheme}
            classResources={classResources}
            profBonus={profBonus}
            expandedAbility={expandedAbility}
            setExpandedAbility={setExpandedAbility}
            onRestoreAllResources={handleRestoreAllClassResources}
            onUseResource={handleUseClassResource}
            onRestoreResource={handleRestoreClassResource}
            onUseResourceAmount={handleUseClassResourceAmount}
          />
          <ClassResourceSlots
            classResources={classResources}
            classTheme={classTheme}
            onRestoreAll={handleRestoreAllClassResources}
            onUse={handleUseClassResource}
            onRestore={handleRestoreClassResource}
          />
          <CharacterTraitsSection
            traits={character.traits}
            onUseCharge={handleUseTraitCharge}
            onRestoreCharges={handleRestoreTraitCharges}
          />
        </Animated.ScrollView>
        <ConfirmDialog {...dialogProps} />
        <Toast {...toastProps} />
      </View>
    );
  }

  // Caster
  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <CantripsSection
          cantrips={cantrips}
          formatSpellName={formatSpellName}
        />
        <SpellcastingSection
          character={character}
          magicState={magicState}
          spellcastingAbility={spellcastingAbility}
          preparationType={preparationType}
          abilityMod={abilityMod}
          profBonus={profBonus}
          spellSaveDC={spellSaveDC}
          spellAttackBonus={spellAttackBonus}
          levelSpells={levelSpells}
          spellsByLevel={spellsByLevel}
          sortedSpellLevels={sortedSpellLevels}
          formatSpellName={formatSpellName}
          getSpellLevel={getSpellLevel}
          canCastSpell={canCastSpell}
          isPrepared={isPrepared}
          isInSpellbook={isInSpellbook}
          onTogglePrepared={handleTogglePrepared}
          maxPreparedSpells={maxPreparedSpells}
          currentPreparedCount={currentPreparedCount}
          isPreparedCaster={isPreparedCaster}
        />
        <ClassResourceSlots
          classResources={classResources}
          classTheme={classTheme}
          onRestoreAll={handleRestoreAllClassResources}
          onUse={handleUseClassResource}
          onRestore={handleRestoreClassResource}
        />
        <CharacterTraitsSection
          traits={character.traits}
          onUseCharge={handleUseTraitCharge}
          onRestoreCharges={handleRestoreTraitCharges}
        />
      </Animated.ScrollView>
      <ConfirmDialog {...dialogProps} />
      <Toast {...toastProps} />
    </View>
  );
}
