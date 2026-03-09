/**
 * Store de lista de personajes (modo jugador).
 *
 * Reemplaza al campaignStore para el modo 1 jugador.
 * Gestiona un listado de resúmenes de personajes guardados,
 * con persistencia en AsyncStorage y migración automática
 * desde el formato anterior basado en campañas.
 */

import { create } from "zustand";
import { randomUUID } from "expo-crypto";
import type { Character, ClassId, RaceId, Sexo, SubraceId } from "@/types/character";
import { STORAGE_KEYS, setItem, getItem, removeItem } from "@/utils/storage";
import { now } from "@/utils/providers";
import { useCharacterStore } from "./characterStore";
import { deleteCreationDraft } from "./creationStore";
import { supabase } from "@/lib/supabase";
import { deleteCharacterFromCloud } from "@/services/supabaseService";

// ─── Tipos ───────────────────────────────────────────────────────────

/** Resumen ligero de un personaje para la lista principal */
export interface CharacterSummary {
  /** UUID del personaje */
  id: string;
  /** Nombre del personaje */
  nombre: string;
  /** Clase del personaje */
  clase: ClassId;
  /** Raza del personaje */
  raza: RaceId;
  /** Subraza (si aplica) */
  subraza: SubraceId;
  /** Sexo del personaje */
  sexo?: Sexo;
  /** Nivel actual */
  nivel: number;
  /** Nombre de raza personalizada */
  customRaceName?: string;
  /** Fecha de creación */
  creadoEn: string;
  /** Fecha de última modificación */
  actualizadoEn: string;
}

interface CharacterListState {
  /** Lista de resúmenes de personajes */
  characters: CharacterSummary[];
  /** Si se están cargando datos */
  loading: boolean;
  /** Mensaje de error */
  error: string | null;
  /** Si se ha completado la migración desde campañas */
  migrated: boolean;
}

interface CharacterListActions {
  /** Carga la lista de personajes (con auto-migración desde campañas) */
  loadCharacters: () => Promise<void>;
  /** Añade un personaje a la lista */
  addCharacter: (character: Character) => Promise<void>;
  /** Actualiza los datos de resumen de un personaje */
  updateCharacterSummary: (id: string, updates: Partial<CharacterSummary>) => Promise<void>;
  /** Elimina un personaje y todos sus datos asociados */
  deleteCharacter: (id: string) => Promise<void>;
  /** Obtiene un resumen por ID */
  getCharacterById: (id: string) => CharacterSummary | undefined;
  /** Actualiza la fecha de último acceso */
  touchCharacter: (id: string) => Promise<void>;
  /** Limpia el error */
  clearError: () => void;
}

type CharacterListStore = CharacterListState & CharacterListActions;

// ─── Helpers ─────────────────────────────────────────────────────────

async function persistList(characters: CharacterSummary[]): Promise<void> {
  await setItem(STORAGE_KEYS.CHARACTER_LIST, characters);
}

function sortByLastAccess(characters: CharacterSummary[]): CharacterSummary[] {
  return [...characters].sort(
    (a, b) => new Date(b.actualizadoEn).getTime() - new Date(a.actualizadoEn).getTime(),
  );
}

/** Extrae un resumen ligero del personaje completo */
export function toCharacterSummary(character: Character): CharacterSummary {
  return {
    id: character.id,
    nombre: character.nombre,
    clase: character.clase,
    raza: character.raza,
    subraza: character.subraza,
    sexo: character.sexo,
    nivel: character.nivel,
    customRaceName: character.customRaceName,
    creadoEn: character.creadoEn,
    actualizadoEn: character.actualizadoEn,
  };
}

// ─── Migración desde campañas ────────────────────────────────────────

interface LegacyCampaign {
  id: string;
  nombre: string;
  personajeId?: string;
  creadoEn: string;
  actualizadoEn: string;
}

/**
 * Migra datos del formato campaña → lista de personajes.
 * Lee las campañas existentes, extrae los personajes asociados,
 * y crea la lista de resúmenes.
 */
async function migrateFromCampaigns(): Promise<CharacterSummary[]> {
  try {
    const campaigns = await getItem<LegacyCampaign[]>(STORAGE_KEYS.CAMPAIGNS);
    if (!campaigns || campaigns.length === 0) return [];

    const summaries: CharacterSummary[] = [];

    for (const campaign of campaigns) {
      if (!campaign.personajeId) continue;

      const character = await getItem<Character>(
        STORAGE_KEYS.CHARACTER(campaign.personajeId),
      );
      if (!character) continue;

      summaries.push(toCharacterSummary(character));
    }

    return sortByLastAccess(summaries);
  } catch (err) {
    console.warn("[CharacterListStore] Migration from campaigns failed:", err);
    return [];
  }
}

// ─── Store ───────────────────────────────────────────────────────────

export const useCharacterListStore = create<CharacterListStore>((set, get) => ({
  // ── Estado inicial ──
  characters: [],
  loading: false,
  error: null,
  migrated: false,

  // ── Acciones ──

  loadCharacters: async () => {
    set({ loading: true, error: null });
    try {
      let stored = await getItem<CharacterSummary[]>(STORAGE_KEYS.CHARACTER_LIST);

      // Auto-migración: si no existe la lista, intentar migrar desde campañas
      if (!stored) {
        stored = await migrateFromCampaigns();
        if (stored.length > 0) {
          await persistList(stored);
        }
        set({ migrated: true });
      }

      // Reconciliar resúmenes con los datos reales del personaje
      let needsPersist = false;
      const reconciled: CharacterSummary[] = [];
      for (const summary of stored) {
        const fullChar = await getItem<Character>(STORAGE_KEYS.CHARACTER(summary.id));
        if (fullChar) {
          const fresh = toCharacterSummary(fullChar);
          if (fresh.nivel !== summary.nivel || fresh.nombre !== summary.nombre || fresh.actualizadoEn !== summary.actualizadoEn) {
            needsPersist = true;
          }
          reconciled.push(fresh);
        } else {
          reconciled.push(summary);
        }
      }
      if (needsPersist) {
        await persistList(reconciled);
      }

      const characters = sortByLastAccess(reconciled);
      set({ characters, loading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar los personajes";
      console.error("[CharacterListStore] loadCharacters:", message);
      set({ error: message, loading: false });
    }
  },

  addCharacter: async (character: Character) => {
    try {
      const { characters } = get();
      const summary = toCharacterSummary(character);
      const updated = sortByLastAccess([...characters, summary]);
      await persistList(updated);
      set({ characters: updated, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al añadir el personaje";
      console.error("[CharacterListStore] addCharacter:", message);
      set({ error: message });
      throw new Error(message);
    }
  },

  updateCharacterSummary: async (id: string, updates: Partial<CharacterSummary>) => {
    try {
      const { characters } = get();
      const index = characters.findIndex((c) => c.id === id);
      if (index === -1) return;

      const updatedList = [...characters];
      updatedList[index] = { ...updatedList[index], ...updates, actualizadoEn: now() };
      const sorted = sortByLastAccess(updatedList);
      await persistList(sorted);
      set({ characters: sorted, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al actualizar el personaje";
      console.error("[CharacterListStore] updateCharacterSummary:", message);
      set({ error: message });
    }
  },

  deleteCharacter: async (id: string) => {
    try {
      const { characters } = get();
      const summary = characters.find((c) => c.id === id);
      if (!summary) return;

      // Eliminar todos los datos del personaje
      await useCharacterStore.getState().deleteAllCharacterData(id);

      // Eliminar borrador de creación si existe
      await deleteCreationDraft();

      // Eliminar de la nube
      deleteCharacterFromCloud(id).catch((err) =>
        console.warn("[CharacterListStore] Cloud delete failed:", err),
      );

      // Actualizar la lista
      const filtered = characters.filter((c) => c.id !== id);
      await persistList(filtered);
      set({ characters: filtered, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al eliminar el personaje";
      console.error("[CharacterListStore] deleteCharacter:", message);
      set({ error: message });
      throw new Error(message);
    }
  },

  getCharacterById: (id: string) => {
    return get().characters.find((c) => c.id === id);
  },

  touchCharacter: async (id: string) => {
    try {
      const { characters } = get();
      const index = characters.findIndex((c) => c.id === id);
      if (index === -1) return;

      const updatedList = [...characters];
      updatedList[index] = { ...updatedList[index], actualizadoEn: now() };
      const sorted = sortByLastAccess(updatedList);
      await persistList(sorted);
      set({ characters: sorted });
    } catch {
      console.warn("[CharacterListStore] touchCharacter: no se pudo actualizar");
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
