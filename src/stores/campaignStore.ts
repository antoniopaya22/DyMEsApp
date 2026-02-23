/**
 * Store de partidas/campañas con Zustand y persistencia en AsyncStorage.
 * Implementa las operaciones CRUD de HU-01.
 */

import { create } from "zustand";
import { randomUUID } from "expo-crypto";
import type { Campaign, CreateCampaignInput, UpdateCampaignInput } from "@/types/campaign";
import { STORAGE_KEYS, setItem, getItem } from "@/utils/storage";
import { now } from "@/utils/providers";
import { useCharacterStore } from "./characterStore";
import { deleteCreationDraft } from "./creationStore";
import { syncLocalCampaign, deleteLocalCampaignBackup, deleteCharacterFromCloud } from "@/services/supabaseService";
import { supabase } from "@/lib/supabase";

// ─── Tipos del store ─────────────────────────────────────────────────

interface CampaignState {
  /** Lista de todas las partidas */
  campaigns: Campaign[];
  /** Partida actualmente seleccionada (para navegación) */
  activeCampaignId: string | null;
  /** Si se están cargando datos del almacenamiento */
  loading: boolean;
  /** Mensaje de error (null si no hay error) */
  error: string | null;
}

interface CampaignActions {
  /** Carga todas las partidas desde AsyncStorage */
  loadCampaigns: () => Promise<void>;
  /** Crea una nueva partida y la persiste */
  createCampaign: (input: CreateCampaignInput) => Promise<Campaign>;
  /** Actualiza una partida existente */
  updateCampaign: (id: string, input: UpdateCampaignInput) => Promise<Campaign | null>;
  /** Elimina una partida y su personaje asociado */
  deleteCampaign: (id: string) => Promise<void>;
  /** Obtiene una partida por su ID */
  getCampaignById: (id: string) => Campaign | undefined;
  /** Establece la partida activa */
  setActiveCampaign: (id: string | null) => void;
  /** Asocia un personaje a una partida */
  linkCharacter: (campaignId: string, characterId: string) => Promise<void>;
  /** Desasocia el personaje de una partida */
  unlinkCharacter: (campaignId: string) => Promise<void>;
  /** Actualiza la fecha de último acceso de una partida */
  touchCampaign: (id: string) => Promise<void>;
  /** Limpia el error actual */
  clearError: () => void;
}

type CampaignStore = CampaignState & CampaignActions;

// ─── Helpers internos ────────────────────────────────────────────────

/**
 * Persiste la lista completa de partidas en AsyncStorage.
 */
async function persistCampaigns(campaigns: Campaign[]): Promise<void> {
  await setItem(STORAGE_KEYS.CAMPAIGNS, campaigns);
}

/**
 * Ordena las partidas por fecha de último acceso (más reciente primero).
 */
function sortByLastAccess(campaigns: Campaign[]): Campaign[] {
  return [...campaigns].sort(
    (a, b) => new Date(b.actualizadoEn).getTime() - new Date(a.actualizadoEn).getTime()
  );
}

/**
 * Sync a campaign to Supabase in the background (fire-and-forget).
 * Uses supabase.auth directly to avoid a circular import with authStore.
 * Silently fails if the user is not logged in or sync fails.
 */
function syncCampaignToCloud(campaign: Campaign): void {
  supabase.auth.getUser().then(({ data }) => {
    const userId = data.user?.id;
    if (!userId) return;
    syncLocalCampaign(userId, campaign).catch((err) =>
      console.warn("[CampaignStore] Cloud sync failed:", err),
    );
  }).catch(() => {});
}

/** Delete a campaign backup from Supabase in the background */
function deleteCampaignFromCloud(campaignId: string): void {
  supabase.auth.getUser().then(({ data }) => {
    if (!data.user?.id) return;
    deleteLocalCampaignBackup(campaignId).catch((err) =>
      console.warn("[CampaignStore] Cloud delete failed:", err),
    );
  }).catch(() => {});
}

// ─── Store ───────────────────────────────────────────────────────────

export const useCampaignStore = create<CampaignStore>((set, get) => ({
  // ── Estado inicial ──
  campaigns: [],
  activeCampaignId: null,
  loading: false,
  error: null,

  // ── Acciones ──

  loadCampaigns: async () => {
    set({ loading: true, error: null });
    try {
      const stored = await getItem<Campaign[]>(STORAGE_KEYS.CAMPAIGNS);
      const campaigns = stored ? sortByLastAccess(stored) : [];
      set({ campaigns, loading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar las partidas";
      console.error("[CampaignStore] loadCampaigns:", message);
      set({ error: message, loading: false });
    }
  },

  createCampaign: async (input: CreateCampaignInput) => {
    const timestamp = now();
    const newCampaign: Campaign = {
      id: randomUUID(),
      nombre: input.nombre.trim(),
      descripcion: input.descripcion?.trim() || undefined,
      imagen: input.imagen || undefined,
      personajeId: undefined,
      creadoEn: timestamp,
      actualizadoEn: timestamp,
    };

    try {
      const { campaigns } = get();
      const updated = sortByLastAccess([...campaigns, newCampaign]);
      await persistCampaigns(updated);
      set({ campaigns: updated, error: null });
      syncCampaignToCloud(newCampaign);
      return newCampaign;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al crear la partida";
      console.error("[CampaignStore] createCampaign:", message);
      set({ error: message });
      throw new Error(message);
    }
  },

  updateCampaign: async (id: string, input: UpdateCampaignInput) => {
    try {
      const { campaigns } = get();
      const index = campaigns.findIndex((c) => c.id === id);
      if (index === -1) {
        set({ error: `Partida con id "${id}" no encontrada` });
        return null;
      }

      const existing = campaigns[index];
      const updatedCampaign: Campaign = {
        ...existing,
        nombre: input.nombre !== undefined ? input.nombre.trim() : existing.nombre,
        descripcion:
          input.descripcion !== undefined
            ? input.descripcion?.trim() || undefined
            : existing.descripcion,
        imagen: input.imagen !== undefined ? input.imagen : existing.imagen,
        actualizadoEn: now(),
      };

      const updatedList = [...campaigns];
      updatedList[index] = updatedCampaign;
      const sorted = sortByLastAccess(updatedList);

      await persistCampaigns(sorted);
      set({ campaigns: sorted, error: null });
      syncCampaignToCloud(updatedCampaign);
      return updatedCampaign;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al actualizar la partida";
      console.error("[CampaignStore] updateCampaign:", message);
      set({ error: message });
      throw new Error(message);
    }
  },

  deleteCampaign: async (id: string) => {
    try {
      const { campaigns, activeCampaignId } = get();
      const campaign = campaigns.find((c) => c.id === id);
      if (!campaign) return;

      // Eliminar datos asociados del personaje si existen
      if (campaign.personajeId) {
        await useCharacterStore
          .getState()
          .deleteAllCharacterData(campaign.personajeId);
        // Also remove the character from Supabase so the master sees the deletion
        deleteCharacterFromCloud(campaign.personajeId).catch((err) =>
          console.warn("[CampaignStore] Cloud character delete failed:", err),
        );
      }

      // Eliminar borrador de creación si existe
      await deleteCreationDraft(id);

      // Actualizar la lista
      const filtered = campaigns.filter((c) => c.id !== id);
      await persistCampaigns(filtered);
      deleteCampaignFromCloud(id);

      set({
        campaigns: filtered,
        activeCampaignId: activeCampaignId === id ? null : activeCampaignId,
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al eliminar la partida";
      console.error("[CampaignStore] deleteCampaign:", message);
      set({ error: message });
      throw new Error(message);
    }
  },

  getCampaignById: (id: string) => {
    return get().campaigns.find((c) => c.id === id);
  },

  setActiveCampaign: (id: string | null) => {
    set({ activeCampaignId: id });
  },

  linkCharacter: async (campaignId: string, characterId: string) => {
    try {
      const { campaigns } = get();
      const index = campaigns.findIndex((c) => c.id === campaignId);
      if (index === -1) return;

      const updatedList = [...campaigns];
      updatedList[index] = {
        ...updatedList[index],
        personajeId: characterId,
        actualizadoEn: now(),
      };

      const sorted = sortByLastAccess(updatedList);
      await persistCampaigns(sorted);
      set({ campaigns: sorted, error: null });
      syncCampaignToCloud(sorted.find((c) => c.id === campaignId)!);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al vincular el personaje";
      console.error("[CampaignStore] linkCharacter:", message);
      set({ error: message });
    }
  },

  unlinkCharacter: async (campaignId: string) => {
    try {
      const { campaigns } = get();
      const index = campaigns.findIndex((c) => c.id === campaignId);
      if (index === -1) return;

      const updatedList = [...campaigns];
      updatedList[index] = {
        ...updatedList[index],
        personajeId: undefined,
        actualizadoEn: now(),
      };

      const sorted = sortByLastAccess(updatedList);
      await persistCampaigns(sorted);
      set({ campaigns: sorted, error: null });
      syncCampaignToCloud(sorted.find((c) => c.id === campaignId)!);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al desvincular el personaje";
      console.error("[CampaignStore] unlinkCharacter:", message);
      set({ error: message });
    }
  },

  touchCampaign: async (id: string) => {
    try {
      const { campaigns } = get();
      const index = campaigns.findIndex((c) => c.id === id);
      if (index === -1) return;

      const updatedList = [...campaigns];
      updatedList[index] = {
        ...updatedList[index],
        actualizadoEn: now(),
      };

      const sorted = sortByLastAccess(updatedList);
      await persistCampaigns(sorted);
      set({ campaigns: sorted });
    } catch (err) {
      // Silenciar errores de touch, no es crítico
      console.warn("[CampaignStore] touchCampaign: no se pudo actualizar la fecha");
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
