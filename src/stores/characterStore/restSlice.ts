/**
 * Rest Slice — short rest & long rest orchestration.
 * Rests touch combat, magic, and class resources simultaneously.
 */

import type { Character, DeathSaves, Trait } from "@/types/character";
import { STORAGE_KEYS } from "@/utils/storage";
import { now } from "@/utils/providers";
import { hitDieValue } from "@/utils/character";
import {
  rollDie,
  safeSetItem,
  type InternalMagicState,
  type SlotInfo,
  type ClassResourceInfo,
} from "./helpers";
import type { CharacterStore, RestActions } from "./types";

type SetState = (partial: Partial<CharacterStore>) => void;
type GetState = () => CharacterStore;

// ─── Pure helpers ────────────────────────────────────────────────────

type RechargeType = NonNullable<Trait["recharge"]>;

/**
 * Restore trait uses for traits whose recharge matches one of the given types.
 */
function restoreTraitUses(
  traits: Trait[],
  rechargeTypes: RechargeType[],
): Trait[] {
  const allowed = new Set(rechargeTypes);
  return traits.map((t) => {
    if (t.recharge && allowed.has(t.recharge) && t.maxUses !== null) {
      return { ...t, currentUses: t.maxUses };
    }
    return t;
  });
}

/**
 * Restore class resources.
 *
 * @param resources   Current class resources record.
 * @param recoveryFilter If provided, only restore resources with a matching
 *                       recovery type. If omitted, restore ALL resources.
 */
function restoreClassResources(
  resources: Record<string, ClassResourceInfo>,
  recoveryFilter?: string,
): Record<string, ClassResourceInfo> {
  const restored: Record<string, ClassResourceInfo> = {};
  for (const [id, res] of Object.entries(resources)) {
    restored[id] =
      !recoveryFilter || res.recovery === recoveryFilter
        ? { ...res, current: res.max }
        : { ...res };
  }
  return restored;
}

/**
 * Restore all spell slots (and pact magic / sorcery points) for a long rest.
 */
function restoreMagicStateFull(
  magicState: InternalMagicState,
): InternalMagicState {
  const restoredSlots: Record<number, SlotInfo> = {};
  for (const [level, slot] of Object.entries(magicState.spellSlots)) {
    if (slot) {
      restoredSlots[Number(level)] = { total: slot.total, used: 0 };
    }
  }
  return {
    ...magicState,
    spellSlots: restoredSlots,
    pactMagicSlots: magicState.pactMagicSlots
      ? { ...magicState.pactMagicSlots, used: 0 }
      : undefined,
    sorceryPoints: magicState.sorceryPoints
      ? { ...magicState.sorceryPoints, current: magicState.sorceryPoints.max }
      : undefined,
  };
}

/**
 * Persist rest-related state changes to AsyncStorage.
 */
async function persistRestState(
  charId: string,
  character: Character,
  magicState: InternalMagicState | null,
  classResources: { resources: Record<string, ClassResourceInfo> } | null,
): Promise<void> {
  await safeSetItem(STORAGE_KEYS.CHARACTER(charId), character);
  if (magicState) {
    await safeSetItem(STORAGE_KEYS.MAGIC_STATE(charId), magicState);
  }
  if (classResources) {
    await safeSetItem(STORAGE_KEYS.CLASS_RESOURCES(charId), classResources);
  }
}

// ─── Slice ───────────────────────────────────────────────────────────

export function createRestSlice(set: SetState, get: GetState): RestActions {
  return {
    shortRest: async (hitDiceToUse: number) => {
      const { character, magicState, classResources } = get();
      if (!character) return { hpRestored: 0, diceUsed: 0 };

      const sides = hitDieValue(character.hitDice.die);
      const conMod = character.abilityScores.con.modifier;

      let totalHealed = 0;
      let diceUsed = 0;
      let remaining = character.hitDice.remaining;

      for (let i = 0; i < hitDiceToUse && remaining > 0; i++) {
        const rolled = rollDie(sides);
        const healed = Math.max(1, rolled + conMod);
        totalHealed += healed;
        remaining--;
        diceUsed++;
      }

      const newCurrent = Math.min(
        character.hp.max,
        character.hp.current + totalHealed,
      );

      // Restore short-rest recharge traits
      const updatedTraits = restoreTraitUses(character.traits, ["short_rest"]);

      // Restore warlock pact slots
      let updatedMagicState: InternalMagicState | null = magicState;
      if (
        magicState &&
        character.clase === "brujo" &&
        magicState.pactMagicSlots
      ) {
        updatedMagicState = {
          ...magicState,
          pactMagicSlots: { ...magicState.pactMagicSlots, used: 0 },
        };
      }

      // Restore short_rest class resources
      const updatedClassResources = classResources
        ? {
            resources: restoreClassResources(
              classResources.resources,
              "short_rest",
            ),
          }
        : classResources;

      const updatedChar: Character = {
        ...character,
        hp: { ...character.hp, current: newCurrent },
        hitDice: { ...character.hitDice, remaining },
        traits: updatedTraits,
        actualizadoEn: now(),
      };

      set({
        character: updatedChar,
        magicState: updatedMagicState,
        classResources: updatedClassResources,
      });
      await persistRestState(
        character.id,
        updatedChar,
        updatedMagicState,
        updatedClassResources,
      );

      return { hpRestored: totalHealed, diceUsed };
    },

    longRest: async () => {
      const { character, magicState, classResources } = get();
      if (!character) return;

      // Restore all HP
      const newCurrent = character.hp.max;

      // Restore half of hit dice (minimum 1)
      const dicesToRestore = Math.max(
        1,
        Math.floor(character.hitDice.total / 2),
      );
      const newRemaining = Math.min(
        character.hitDice.total,
        character.hitDice.remaining + dicesToRestore,
      );

      // Reset death saves
      const newDeathSaves: DeathSaves = { successes: 0, failures: 0 };

      // Restore all recharge traits
      const updatedTraits = restoreTraitUses(character.traits, [
        "short_rest",
        "long_rest",
        "dawn",
      ]);

      // Restore all spell slots
      const updatedMagicState = magicState
        ? restoreMagicStateFull(magicState)
        : magicState;

      // Restore ALL class resources on long rest
      const updatedClassResources = classResources
        ? { resources: restoreClassResources(classResources.resources) }
        : classResources;

      const updatedChar: Character = {
        ...character,
        hp: { ...character.hp, current: newCurrent, temp: 0 },
        hitDice: { ...character.hitDice, remaining: newRemaining },
        deathSaves: newDeathSaves,
        conditions: [],
        concentration: null,
        traits: updatedTraits,
        actualizadoEn: now(),
      };

      set({
        character: updatedChar,
        magicState: updatedMagicState,
        classResources: updatedClassResources,
      });
      await persistRestState(
        character.id,
        updatedChar,
        updatedMagicState,
        updatedClassResources,
      );
    },
  };
}
