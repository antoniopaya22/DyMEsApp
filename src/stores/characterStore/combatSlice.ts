/**
 * Combat Slice — HP, hit dice, death saves, conditions, concentration, traits.
 * Handles all combat-related state management for the character store.
 */

import type {
  Character,
  HitPoints,
  DeathSaves,
  Condition,
} from "@/types/character";
import type { CharacterStore, CombatActions } from "./types";
import { now } from "@/utils/providers";
import { hitDieValue } from "@/utils/character";
import { rollDie, updateCharacterAndPersist } from "./helpers";

type SetState = (partial: Partial<CharacterStore>) => void;
type GetState = () => CharacterStore;

export function createCombatSlice(set: SetState, get: GetState): CombatActions {
  return {
    takeDamage: async (amount: number, description?: string) => {
      const { character } = get();
      if (!character || amount <= 0) return;

      let remaining = amount;
      let newTemp = character.hp.temp;
      let newCurrent = character.hp.current;

      // Temp HP absorbs damage first
      if (newTemp > 0) {
        if (remaining >= newTemp) {
          remaining -= newTemp;
          newTemp = 0;
        } else {
          newTemp -= remaining;
          remaining = 0;
        }
      }

      newCurrent = Math.max(0, newCurrent - remaining);

      const newHp: HitPoints = {
        max: character.hp.max,
        current: newCurrent,
        temp: newTemp,
      };

      await updateCharacterAndPersist(get, set, {
        hp: newHp,
      });
    },

    heal: async (amount: number, description?: string) => {
      const { character } = get();
      if (!character || amount <= 0) return;

      const newCurrent = Math.min(
        character.hp.max,
        character.hp.current + amount,
      );
      const actualHeal = newCurrent - character.hp.current;

      await updateCharacterAndPersist(get, set, {
        hp: { ...character.hp, current: newCurrent },
      });
    },

    setTempHP: async (amount: number) => {
      const { character } = get();
      if (!character) return;

      const newTemp = Math.max(0, amount);

      await updateCharacterAndPersist(get, set, {
        hp: { ...character.hp, temp: newTemp },
      });
    },

    setMaxHP: async (amount: number) => {
      const { character } = get();
      if (!character || amount < 1) return;

      const newCurrent = Math.min(character.hp.current, amount);

      await updateCharacterAndPersist(get, set, {
        hp: { ...character.hp, max: amount, current: newCurrent },
      });
    },

    setCurrentHP: async (amount: number) => {
      const { character } = get();
      if (!character) return;

      const clamped = Math.max(0, Math.min(character.hp.max, amount));

      await updateCharacterAndPersist(get, set, {
        hp: { ...character.hp, current: clamped },
      });
    },

    // ── Hit Dice ──

    useHitDie: async () => {
      const { character } = get();
      if (!character || character.hitDice.remaining <= 0) return null;

      const sides = hitDieValue(character.hitDice.die);
      const rolled = rollDie(sides);
      const conMod = character.abilityScores.con.modifier;
      const healed = Math.max(1, rolled + conMod);
      const newCurrent = Math.min(
        character.hp.max,
        character.hp.current + healed,
      );

      await updateCharacterAndPersist(get, set, {
        hp: { ...character.hp, current: newCurrent },
        hitDice: {
          ...character.hitDice,
          remaining: character.hitDice.remaining - 1,
        },
      });

      return { rolled, healed };
    },

    restoreHitDice: async (count: number) => {
      const { character } = get();
      if (!character) return;

      const newRemaining = Math.min(
        character.hitDice.total,
        character.hitDice.remaining + count,
      );

      await updateCharacterAndPersist(get, set, {
        hitDice: { ...character.hitDice, remaining: newRemaining },
      });
    },

    // ── Death Saves ──

    addDeathSuccess: async () => {
      const { character } = get();
      if (!character) return null;

      const newSuccesses = character.deathSaves.successes + 1;
      const isStable = newSuccesses >= 3;

      const patch: Partial<Character> = {
        deathSaves: {
          ...character.deathSaves,
          successes: newSuccesses,
        },
      };

      if (isStable) {
        patch.deathSaves = { successes: 0, failures: 0 };
        patch.hp = { ...character.hp, current: 1 };
      }

      await updateCharacterAndPersist(get, set, patch);

      return isStable ? "stable" : "success";
    },

    addDeathFailure: async () => {
      const { character } = get();
      if (!character) return null;

      const newFailures = character.deathSaves.failures + 1;
      const isDead = newFailures >= 3;

      await updateCharacterAndPersist(get, set, {
        deathSaves: {
          ...character.deathSaves,
          failures: newFailures,
        },
      });

      return isDead ? "dead" : "failure";
    },

    resetDeathSaves: async () => {
      await updateCharacterAndPersist(get, set, {
        deathSaves: { successes: 0, failures: 0 },
      });
    },

    // ── Conditions ──

    addCondition: async (condition: Condition, note?: string) => {
      const { character } = get();
      if (!character) return;

      // Don't add duplicates
      if (character.conditions.some((c) => c.condition === condition)) return;

      await updateCharacterAndPersist(get, set, {
        conditions: [...character.conditions, { condition, note }],
      });
    },

    removeCondition: async (condition: Condition) => {
      const { character } = get();
      if (!character) return;

      await updateCharacterAndPersist(get, set, {
        conditions: character.conditions.filter(
          (c) => c.condition !== condition,
        ),
      });
    },

    clearConditions: async () => {
      await updateCharacterAndPersist(get, set, {
        conditions: [],
      });
    },

    // ── Concentration ──

    setConcentration: async (spellId: string, spellName: string) => {
      await updateCharacterAndPersist(get, set, {
        concentration: {
          spellId,
          spellName,
          startedAt: now(),
        },
      });
    },

    clearConcentration: async () => {
      await updateCharacterAndPersist(get, set, {
        concentration: null,
      });
    },

    // ── Trait Uses ──

    useTraitCharge: async (traitId: string) => {
      const { character } = get();
      if (!character) return;

      const updatedTraits = character.traits.map((t) => {
        if (t.id === traitId && t.currentUses !== null && t.currentUses > 0) {
          return { ...t, currentUses: t.currentUses - 1 };
        }
        return t;
      });

      await updateCharacterAndPersist(get, set, {
        traits: updatedTraits,
      });
    },

    restoreTraitCharges: async (traitId: string) => {
      const { character } = get();
      if (!character) return;

      const updatedTraits = character.traits.map((t) => {
        if (t.id === traitId && t.maxUses !== null) {
          return { ...t, currentUses: t.maxUses };
        }
        return t;
      });

      await updateCharacterAndPersist(get, set, {
        traits: updatedTraits,
      });
    },
  };
}
