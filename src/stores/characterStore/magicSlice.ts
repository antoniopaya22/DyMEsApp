/**
 * Magic Slice — Spell slots, pact magic, sorcery points, metamagic.
 * Handles all magic-related state management for the character store.
 */

import { STORAGE_KEYS, setItem } from "@/utils/storage";
import { now } from "@/utils/providers";
import type { CharacterStore, MagicSliceState, MagicActions } from "./types";
import type { InternalMagicState, SlotInfo } from "./helpers";
import { safeSetItem } from "./helpers";

type SetState = (partial: Partial<CharacterStore>) => void;
type GetState = () => CharacterStore;

export const MAGIC_INITIAL_STATE: MagicSliceState = {
  magicState: null,
};

export function createMagicSlice(
  set: SetState,
  get: GetState,
): MagicActions {
  return {
    useSpellSlot: async (level: number) => {
      const { character, magicState } = get();
      if (!character || !magicState) return false;

      const slot = magicState.spellSlots[level];
      if (!slot || slot.used >= slot.total) return false;

      const updatedMagicState: InternalMagicState = {
        ...magicState,
        spellSlots: {
          ...magicState.spellSlots,
          [level]: { ...slot, used: slot.used + 1 },
        },
      };

      set({ magicState: updatedMagicState });
      await safeSetItem(STORAGE_KEYS.MAGIC_STATE(character.id), updatedMagicState);
      return true;
    },

    restoreSpellSlot: async (level: number) => {
      const { character, magicState } = get();
      if (!character || !magicState) return;

      const slot = magicState.spellSlots[level];
      if (!slot || slot.used <= 0) return;

      const updatedMagicState: InternalMagicState = {
        ...magicState,
        spellSlots: {
          ...magicState.spellSlots,
          [level]: { ...slot, used: slot.used - 1 },
        },
      };

      set({ magicState: updatedMagicState });
      await safeSetItem(STORAGE_KEYS.MAGIC_STATE(character.id), updatedMagicState);
    },

    restoreAllSpellSlots: async () => {
      const { character, magicState } = get();
      if (!character || !magicState) return;

      const restoredSlots: Record<number, SlotInfo> = {};
      for (const [level, slot] of Object.entries(magicState.spellSlots)) {
        if (slot) {
          restoredSlots[Number(level)] = {
            total: slot.total,
            used: 0,
          };
        }
      }

      const updatedMagicState: InternalMagicState = {
        ...magicState,
        spellSlots: restoredSlots,
      };

      set({ magicState: updatedMagicState });
      await safeSetItem(STORAGE_KEYS.MAGIC_STATE(character.id), updatedMagicState);
    },

    usePactSlot: async () => {
      const { character, magicState } = get();
      if (!character || !magicState || !magicState.pactMagicSlots) return false;

      if (magicState.pactMagicSlots.used >= magicState.pactMagicSlots.total)
        return false;

      const updatedMagicState: InternalMagicState = {
        ...magicState,
        pactMagicSlots: {
          ...magicState.pactMagicSlots,
          used: magicState.pactMagicSlots.used + 1,
        },
      };

      set({ magicState: updatedMagicState });
      await safeSetItem(STORAGE_KEYS.MAGIC_STATE(character.id), updatedMagicState);
      return true;
    },

    restoreAllPactSlots: async () => {
      const { character, magicState } = get();
      if (!character || !magicState || !magicState.pactMagicSlots) return;

      const updatedMagicState: InternalMagicState = {
        ...magicState,
        pactMagicSlots: {
          ...magicState.pactMagicSlots!,
          used: 0,
        },
      };

      set({ magicState: updatedMagicState });
      await safeSetItem(STORAGE_KEYS.MAGIC_STATE(character.id), updatedMagicState);
    },

    getMagicState: () => {
      return get().magicState;
    },

    useSorceryPoints: async (amount: number) => {
      const { character, magicState } = get();
      if (!character || !magicState || !magicState.sorceryPoints) return false;
      if (amount <= 0 || magicState.sorceryPoints.current < amount) return false;

      const updatedMagicState: InternalMagicState = {
        ...magicState,
        sorceryPoints: {
          ...magicState.sorceryPoints,
          current: magicState.sorceryPoints.current - amount,
        },
      };

      set({ magicState: updatedMagicState });
      await safeSetItem(STORAGE_KEYS.MAGIC_STATE(character.id), updatedMagicState);
      return true;
    },

    restoreSorceryPoints: async (amount: number) => {
      const { character, magicState } = get();
      if (!character || !magicState || !magicState.sorceryPoints) return false;
      if (amount <= 0) return false;

      const { current, max } = magicState.sorceryPoints;
      if (current >= max) return false;

      const updatedMagicState: InternalMagicState = {
        ...magicState,
        sorceryPoints: {
          ...magicState.sorceryPoints,
          current: Math.min(current + amount, max),
        },
      };

      set({ magicState: updatedMagicState });
      await safeSetItem(STORAGE_KEYS.MAGIC_STATE(character.id), updatedMagicState);
      return true;
    },

    togglePreparedSpell: async (spellId: string) => {
      const { character, magicState } = get();
      if (!character || !magicState) return false;

      const currentIds = magicState.preparedSpellIds;
      const isPrepared = currentIds.includes(spellId);
      const newPreparedIds = isPrepared
        ? currentIds.filter((id) => id !== spellId)
        : [...currentIds, spellId];

      // Update magicState
      const updatedMagicState: InternalMagicState = {
        ...magicState,
        preparedSpellIds: newPreparedIds,
      };
      // Also update the character record so it persists across reloads
      const updatedChar = {
        ...character,
        preparedSpellIds: newPreparedIds,
        actualizadoEn: now(),
      };

      set({ magicState: updatedMagicState, character: updatedChar });
      await safeSetItem(STORAGE_KEYS.MAGIC_STATE(character.id), updatedMagicState);
      await setItem(STORAGE_KEYS.CHARACTER(character.id), updatedChar);
      return !isPrepared; // returns new prepared state
    },
  };
}
