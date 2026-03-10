/**
 * Progression Slice — XP, level-up, reset.
 * Contains the complex levelUp orchestration and resetToLevel1 logic.
 */

import type { Character } from "@/types/character";
import { calcProficiencyBonus } from "@/types/character";
import { hitDieValue } from "@/utils/character";
import { now } from "@/utils/providers";
import { getClassData, calcLevel1HP } from "@/data/srd/classes";
import { getRaceData, getSubraceData } from "@/data/srd/races";
import { MAX_LEVEL, canLevelUp, getLevelUpSummary } from "@/data/srd/leveling";
import { STORAGE_KEYS } from "@/utils/storage";
import {
  createDefaultMagicState,
  createDefaultClassResources,
  safeSetItem,
} from "./helpers";
import type {
  CharacterStore,
  ProgressionActions,
  LevelUpOptions,
} from "./types";
import {
  applyHPGain,
  applyASI,
  buildNewTraits,
  buildSubclassTraits,
  buildLevelRecord,
  applyMagicProgression,
  buildFeatTrait,
  getFeatHpBonusPerLevel,
  applyTraitEffectMutations,
  applyFeatEffects,
  resetAbilityScoresToLevel1,
  filterTraitsForLevel1,
} from "./levelUpHelpers";
import {
  useCharacterListStore,
  toCharacterSummary,
} from "@/stores/characterListStore";
import { computeTraitEffectMutations } from "@/utils/traitEffects";

type SetState = (partial: Partial<CharacterStore>) => void;
type GetState = () => CharacterStore;

export function createProgressionSlice(
  set: SetState,
  get: GetState,
): ProgressionActions {
  return {
    addExperience: async (amount: number) => {
      const { character } = get();
      if (!character || amount <= 0) return;

      const newXP = character.experiencia + amount;
      const updatedChar: Character = {
        ...character,
        experiencia: newXP,
        actualizadoEn: now(),
      };
      set({ character: updatedChar });
      await safeSetItem(STORAGE_KEYS.CHARACTER(character.id), updatedChar);
    },

    removeExperience: async (amount: number) => {
      const { character } = get();
      if (!character || amount <= 0) return;

      const newXP = Math.max(0, character.experiencia - amount);
      const updatedChar: Character = {
        ...character,
        experiencia: newXP,
        actualizadoEn: now(),
      };
      set({ character: updatedChar });
      await safeSetItem(STORAGE_KEYS.CHARACTER(character.id), updatedChar);
    },

    setExperience: async (amount: number) => {
      const { character } = get();
      if (!character) return;

      const newXP = Math.max(0, amount);
      const updatedChar: Character = {
        ...character,
        experiencia: newXP,
        actualizadoEn: now(),
      };
      set({ character: updatedChar });
      await safeSetItem(STORAGE_KEYS.CHARACTER(character.id), updatedChar);
    },

    canLevelUp: () => {
      const { character } = get();
      if (!character) return false;
      return canLevelUp(character.experiencia, character.nivel);
    },

    getLevelUpPreview: () => {
      const { character } = get();
      if (!character || character.nivel >= MAX_LEVEL) return null;
      return getLevelUpSummary(character.clase, character.nivel + 1);
    },

    levelUp: async (options: LevelUpOptions) => {
      const { character, magicState } = get();
      if (!character || character.nivel >= MAX_LEVEL) return null;

      const newLevel = character.nivel + 1;
      const summary = getLevelUpSummary(character.clase, newLevel);
      const dieSides = hitDieValue(character.hitDice.die);

      // ── Calcular PG ganados ──
      const subraceData = character.subraza
        ? getSubraceData(character.raza, character.subraza)
        : null;
      const raceData = getRaceData(character.raza);
      const hpBonusPerLevel =
        raceData.hpBonusPerLevel ?? subraceData?.hpBonusPerLevel ?? 0;
      const { hpGained, conMod } = applyHPGain(
        character,
        options,
        dieSides,
        hpBonusPerLevel,
      );

      // ── Aplicar mejoras de característica (ASI) ──
      const { updatedScores, retroactiveHP } = applyASI(
        character.abilityScores,
        summary,
        options,
        conMod,
        character.nivel,
      );

      // ── Nuevo HP máximo ──
      const newMaxHP = character.hp.max + hpGained + retroactiveHP;
      const newCurrentHP = character.hp.current + hpGained + retroactiveHP;

      // ── Registro de nivel ──
      const levelRecord = buildLevelRecord(
        newLevel,
        hpGained,
        options,
        summary,
      );

      // ── Nuevos rasgos (clase + subclase + dote) ──
      const newTraits = [
        ...buildNewTraits(character, summary, newLevel, options),
        ...buildSubclassTraits(character, newLevel, options),
      ];

      // Add feat trait if a feat was chosen instead of ASI
      if (options.featChosen) {
        const featTrait = buildFeatTrait(
          options.featChosen,
          newLevel,
          options.featAsiChoices,
        );
        if (featTrait) newTraits.push(featTrait);
      }

      // ── Computar mutaciones de efectos de rasgos ──
      const effectMutations = computeTraitEffectMutations(character, newTraits);

      // ── Actualizar personaje ──
      let updatedChar: Character = {
        ...character,
        nivel: newLevel,
        abilityScores: updatedScores,
        subclase: options.subclassChosen ?? character.subclase,
        hp: { ...character.hp, max: newMaxHP, current: newCurrentHP },
        hitDice: {
          ...character.hitDice,
          total: newLevel,
          remaining: character.hitDice.remaining + 1,
        },
        proficiencyBonus: calcProficiencyBonus(newLevel),
        traits: [...character.traits, ...newTraits],
        levelHistory: [...character.levelHistory, levelRecord],
        actualizadoEn: now(),
      };

      // ── Aplicar mutaciones de efectos de rasgos ──
      updatedChar = applyTraitEffectMutations(updatedChar, effectMutations);

      // ── Aplicar efectos de la dote elegida ──
      if (options.featChosen) {
        updatedChar = applyFeatEffects(
          updatedChar,
          options.featChosen,
          newLevel,
        );
      }

      set({ character: updatedChar });

      // ── Recalcular recursos de clase ──
      const newClassResources = createDefaultClassResources(updatedChar);
      const { classResources: oldClassResources } = get();
      if (oldClassResources) {
        for (const [id, newRes] of Object.entries(
          newClassResources.resources,
        )) {
          const oldRes = oldClassResources.resources[id];
          if (oldRes) {
            const maxIncrease = newRes.max - oldRes.max;
            newRes.current = Math.min(
              newRes.max,
              oldRes.current + Math.max(0, maxIncrease),
            );
          }
        }
      }
      set({ classResources: newClassResources });

      // ── Persistir ──
      await safeSetItem(
        STORAGE_KEYS.CLASS_RESOURCES(updatedChar.id),
        newClassResources,
      );
      await safeSetItem(STORAGE_KEYS.CHARACTER(character.id), updatedChar);

      // ── Actualizar estado mágico ──
      const updatedMagic = applyMagicProgression(
        updatedChar,
        magicState,
        options,
      );
      if (updatedMagic) {
        set({ magicState: updatedMagic });
        await safeSetItem(STORAGE_KEYS.MAGIC_STATE(character.id), updatedMagic);

        // Sincronizar knownSpellIds del personaje con magicState
        if (
          updatedMagic.knownSpellIds.length !==
            updatedChar.knownSpellIds.length ||
          updatedMagic.knownSpellIds.some(
            (id) => !updatedChar.knownSpellIds.includes(id),
          )
        ) {
          updatedChar = {
            ...updatedChar,
            knownSpellIds: [...updatedMagic.knownSpellIds],
            preparedSpellIds: [...updatedMagic.preparedSpellIds],
            spellbookIds: [...updatedMagic.spellbookIds],
          };
          set({ character: updatedChar });
          await safeSetItem(STORAGE_KEYS.CHARACTER(character.id), updatedChar);
        }
      }

      // ── Sincronizar resumen en la lista de personajes ──
      const charSummary = toCharacterSummary(updatedChar);
      await useCharacterListStore
        .getState()
        .updateCharacterSummary(updatedChar.id, charSummary);

      return summary;
    },

    resetToLevel1: async () => {
      const { character } = get();
      if (!character || character.nivel <= 1) return;

      const classData = getClassData(character.clase);

      // ── Reset ability scores: remove all improvements ──
      const resetAbilityScores = resetAbilityScoresToLevel1(
        character.abilityScores,
      );

      // ── Recalculate HP at level 1 ──
      const conMod = resetAbilityScores.con.modifier;
      const subraceData = character.subraza
        ? getSubraceData(character.raza, character.subraza)
        : null;
      const raceData = getRaceData(character.raza);
      const hpBonusPerLevel =
        raceData.hpBonusPerLevel ?? subraceData?.hpBonusPerLevel ?? 0;
      const level1HP = calcLevel1HP(character.clase, conMod) + hpBonusPerLevel;

      // ── Restore only level-1 spells ──
      const level1Record = character.levelHistory.find((r) => r.level === 1);
      const level1Spells = level1Record?.spellsLearned ?? [];

      // ── Keep only race, background, and level-1 class traits ──
      const finalTraits = filterTraitsForLevel1(
        character.traits,
        classData.level1Features,
        character.levelHistory,
      );

      // ── Build reset character ──
      const timestamp = now();
      const updatedChar: Character = {
        ...character,
        nivel: 1,
        experiencia: 0,
        subclase: null,
        abilityScores: resetAbilityScores,
        hp: { max: level1HP, current: level1HP, temp: 0 },
        hitDice: { die: classData.hitDie, total: 1, remaining: 1 },
        deathSaves: { successes: 0, failures: 0 },
        conditions: [],
        concentration: null,
        proficiencyBonus: calcProficiencyBonus(1),
        traits: finalTraits,
        levelHistory: level1Record
          ? [{ ...level1Record, hpGained: level1HP }]
          : [
              {
                level: 1,
                date: timestamp,
                hpGained: level1HP,
                hpMethod: "fixed" as const,
              },
            ],
        knownSpellIds: [...level1Spells],
        preparedSpellIds: [...level1Spells],
        spellbookIds: character.clase === "mago" ? [...level1Spells] : [],
        actualizadoEn: timestamp,
      };

      set({ character: updatedChar });
      await safeSetItem(STORAGE_KEYS.CHARACTER(character.id), updatedChar);

      // ── Reset magic state ──
      const newMagicState = createDefaultMagicState(updatedChar);
      set({ magicState: newMagicState });
      await safeSetItem(STORAGE_KEYS.MAGIC_STATE(character.id), newMagicState);

      // ── Reset class resources ──
      const newClassResources = createDefaultClassResources(updatedChar);
      set({ classResources: newClassResources });
      await safeSetItem(
        STORAGE_KEYS.CLASS_RESOURCES(character.id),
        newClassResources,
      );

      // ── Sincronizar resumen en la lista de personajes ──
      const resetSummary = toCharacterSummary(updatedChar);
      await useCharacterListStore
        .getState()
        .updateCharacterSummary(updatedChar.id, resetSummary);
    },
  };
}
