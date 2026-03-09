/**
 * Character CRUD Slice — load, save, clear, and utility getters.
 * Also contains computed helpers (ability modifier, skill bonus, AC, etc.)
 */

import type {
  Character,
  AbilityKey,
  SkillKey,
  Personality,
  Appearance,
} from "@/types/character";
import {
  calcModifier,
  calcProficiencyBonus,
  SKILLS,
} from "@/types/character";
import { now } from "@/utils/providers";
import type { Inventory } from "@/types/item";
import { createDefaultInventory } from "@/types/item";
import type { Note, NoteTag } from "@/types/notes";
import { STORAGE_KEYS, setItem, getItem, removeItem } from "@/utils/storage";
import {
  createDefaultMagicState,
  createDefaultClassResources,
  type InternalMagicState,
  type ClassResourcesState,
} from "./helpers";
import type { CharacterStore, CharacterCrudState, CharacterCrudActions } from "./types";
import { useCharacterListStore, toCharacterSummary } from "@/stores/characterListStore";

type SetState = (partial: Partial<CharacterStore>) => void;
type GetState = () => CharacterStore;

export const CRUD_INITIAL_STATE: CharacterCrudState = {
  character: null,
  loading: false,
  error: null,
};

export function createCharacterCrudSlice(
  set: SetState,
  get: GetState,
): CharacterCrudActions {
  return {
    loadCharacter: async (characterId: string) => {
      set({ loading: true, error: null });
      try {
        const charKey = STORAGE_KEYS.CHARACTER(characterId);
        const character = await getItem<Character>(charKey);

        if (!character) {
          set({ loading: false, error: "Personaje no encontrado" });
          return;
        }

        // Load inventory
        const invKey = STORAGE_KEYS.INVENTORY(characterId);
        let inventory = await getItem<Inventory>(invKey);
        if (!inventory) {
          inventory = createDefaultInventory(
            character.inventoryId,
            characterId,
          );
          await setItem(invKey, inventory);
        }

        // Load notes
        const notesKey = STORAGE_KEYS.NOTES(characterId);
        const notes = (await getItem<Note[]>(notesKey)) ?? [];

        // Load custom tags
        const customTags =
          (await getItem<NoteTag[]>(STORAGE_KEYS.CUSTOM_TAGS)) ?? [];

        // Load magic state
        const magicKey = STORAGE_KEYS.MAGIC_STATE(characterId);
        let magicState = await getItem<InternalMagicState>(magicKey);
        if (!magicState) {
          magicState = createDefaultMagicState(character);
          await setItem(magicKey, magicState);
        }

        // Load class resources (Ki, Rage, etc.)
        const classResKey = STORAGE_KEYS.CLASS_RESOURCES(characterId);
        let classResources = await getItem<ClassResourcesState>(classResKey);
        if (!classResources) {
          classResources = createDefaultClassResources(character);
          await setItem(classResKey, classResources);
        }

        set({
          character,
          inventory,
          notes,
          customTags,
          magicState,
          classResources,
          loading: false,
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Error al cargar el personaje";
        console.error("[CharacterCrudSlice] loadCharacter:", message);
        set({ error: message, loading: false });
      }
    },

    saveCharacter: async () => {
      const { character, inventory, notes, magicState, classResources } =
        get();
      if (!character) return;

      try {
        const updatedChar = {
          ...character,
          actualizadoEn: now(),
        };
        await setItem(STORAGE_KEYS.CHARACTER(character.id), updatedChar);
        set({ character: updatedChar });

        if (inventory) {
          await setItem(STORAGE_KEYS.INVENTORY(character.id), inventory);
        }
        if (notes) {
          await setItem(STORAGE_KEYS.NOTES(character.id), notes);
        }
        if (magicState) {
          await setItem(
            STORAGE_KEYS.MAGIC_STATE(character.id),
            magicState,
          );
        }
        if (classResources) {
          await setItem(
            STORAGE_KEYS.CLASS_RESOURCES(character.id),
            classResources,
          );
        }

        // Sync summary to character list store
        const summary = toCharacterSummary(updatedChar);
        await useCharacterListStore.getState().updateCharacterSummary(character.id, summary);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al guardar";
        console.error("[CharacterCrudSlice] saveCharacter:", message);
        set({ error: message });
      }
    },

    clearCharacter: () => {
      set({
        character: null,
        inventory: null,
        notes: [],
        customTags: [],
        magicState: null,
        classResources: null,
        loading: false,
        error: null,
      });
    },

    deleteAllCharacterData: async (characterId: string) => {
      await Promise.allSettled([
        removeItem(STORAGE_KEYS.CHARACTER(characterId)),
        removeItem(STORAGE_KEYS.INVENTORY(characterId)),
        removeItem(STORAGE_KEYS.NOTES(characterId)),
        removeItem(STORAGE_KEYS.MAGIC_STATE(characterId)),
        removeItem(STORAGE_KEYS.SPELL_FAVORITES(characterId)),
        removeItem(STORAGE_KEYS.CLASS_RESOURCES(characterId)),
      ]);

      // If the deleted character is currently loaded, clear it
      const { character } = get();
      if (character?.id === characterId) {
        set({
          character: null,
          inventory: null,
          notes: [],
          customTags: [],
          magicState: null,
          classResources: null,
        });
      }
    },

    clearError: () => {
      set({ error: null });
    },

    // ── Computed Getters ──

    getAbilityModifier: (ability: AbilityKey) => {
      const { character } = get();
      if (!character) return 0;
      return character.abilityScores[ability].modifier;
    },

    getSkillBonus: (skill: SkillKey) => {
      const { character } = get();
      if (!character) return 0;

      const skillDef = SKILLS[skill];
      const abilityMod =
        character.abilityScores[skillDef.habilidad].modifier;
      const proficiency = character.skillProficiencies[skill];
      const profBonus = character.proficiencyBonus;

      if (proficiency.level === "expertise") {
        return abilityMod + profBonus * 2;
      } else if (proficiency.level === "proficient") {
        return abilityMod + profBonus;
      }

      return abilityMod;
    },

    getSavingThrowBonus: (ability: AbilityKey) => {
      const { character } = get();
      if (!character) return 0;

      const mod = character.abilityScores[ability].modifier;
      const proficient = character.savingThrows[ability].proficient;
      return proficient ? mod + character.proficiencyBonus : mod;
    },

    getProficiencyBonus: () => {
      const { character } = get();
      if (!character) return 2;
      return character.proficiencyBonus;
    },

    getArmorClass: () => {
      const { character, inventory } = get();
      if (!character) return 10;

      const dexMod = character.abilityScores.des.modifier;
      let baseAC = 10 + dexMod;

      if (inventory) {
        const equippedArmor = inventory.items.find(
          (i) =>
            i.equipado &&
            i.categoria === "armadura" &&
            i.armorDetails,
        );
        const equippedShield = inventory.items.find(
          (i) =>
            i.equipado &&
            i.categoria === "escudo" &&
            i.armorDetails,
        );

        if (equippedArmor?.armorDetails) {
          const armor = equippedArmor.armorDetails;
          if (!armor.addDexModifier) {
            baseAC = armor.baseAC;
          } else if (armor.maxDexBonus !== null) {
            baseAC =
              armor.baseAC + Math.min(dexMod, armor.maxDexBonus);
          } else {
            baseAC = armor.baseAC + dexMod;
          }
        }

        if (equippedShield?.armorDetails) {
          baseAC += equippedShield.armorDetails.baseAC;
        }
      }

      return baseAC;
    },

    updatePersonality: async (personality: Personality) => {
      const { character } = get();
      if (!character) return;
      const updated = { ...character, personality, actualizadoEn: now() };
      await setItem(STORAGE_KEYS.CHARACTER(character.id), updated);
      set({ character: updated });
    },

    updateAppearance: async (appearance: Appearance) => {
      const { character } = get();
      if (!character) return;
      const updated = { ...character, appearance, actualizadoEn: now() };
      await setItem(STORAGE_KEYS.CHARACTER(character.id), updated);
      set({ character: updated });
    },

    updateAlignment: async (alineamiento: Character["alineamiento"]) => {
      const { character } = get();
      if (!character) return;
      const updated = { ...character, alineamiento, actualizadoEn: now() };
      await setItem(STORAGE_KEYS.CHARACTER(character.id), updated);
      set({ character: updated });
    },

    updateName: async (nombre: string) => {
      const { character } = get();
      if (!character) return;
      const updated = { ...character, nombre, actualizadoEn: now() };
      await setItem(STORAGE_KEYS.CHARACTER(character.id), updated);
      set({ character: updated });
    },
  };
}
