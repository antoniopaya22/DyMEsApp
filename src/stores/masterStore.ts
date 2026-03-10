/**
 * Master Store — Zustand store for Master Mode campaign management (HU-10).
 *
 * Manages: master campaigns, players, and real-time state.
 * All data lives in Supabase; this store is a thin cache.
 */

import { create } from "zustand";
import type {
  MasterCampaign,
  LobbyPlayer,
  CreateMasterCampaignInput,
  UpdateMasterCampaignInput,
} from "@/types/master";
import {
  fetchMasterCampaigns,
  createMasterCampaign,
  updateMasterCampaign,
  deleteMasterCampaign,
  fetchCampaignPlayers,
  addPlayerToCampaign,
  removePlayerFromCampaign,
  findCharacterByCode,
} from "@/services/supabaseService";
import { extractErrorMessage } from "@/utils/storage";

// ─── Types ───────────────────────────────────────────────────────────

interface MasterState {
  /** All campaigns owned by the current master */
  campaigns: MasterCampaign[];
  /** Currently selected campaign ID */
  activeCampaignId: string | null;
  /** Players in the active campaign */
  players: LobbyPlayer[];
  /** Loading states */
  loadingCampaigns: boolean;
  loadingPlayers: boolean;
  /** Error message */
  error: string | null;
}

interface MasterActions {
  // ── Campaigns ──
  loadCampaigns: (masterId: string) => Promise<void>;
  createCampaign: (
    masterId: string,
    input: CreateMasterCampaignInput,
  ) => Promise<MasterCampaign>;
  updateCampaign: (
    campaignId: string,
    input: UpdateMasterCampaignInput,
  ) => Promise<void>;
  deleteCampaign: (campaignId: string) => Promise<void>;
  setActiveCampaign: (id: string | null) => void;

  // ── Players ──
  loadPlayers: (campaignId: string) => Promise<void>;
  addPlayer: (campaignId: string, characterCode: string) => Promise<string>;
  removePlayer: (campaignId: string, playerId: string) => Promise<void>;

  // ── Misc ──
  clearError: () => void;
}

type MasterStore = MasterState & MasterActions;

// ─── Store ───────────────────────────────────────────────────────────

export const useMasterStore = create<MasterStore>((set, get) => ({
  // ── Initial state ──
  campaigns: [],
  activeCampaignId: null,
  players: [],
  loadingCampaigns: false,
  loadingPlayers: false,
  error: null,

  // ── Campaign Actions ──

  loadCampaigns: async (masterId) => {
    set({ loadingCampaigns: true, error: null });
    try {
      const campaigns = await fetchMasterCampaigns(masterId);
      set({ campaigns, loadingCampaigns: false });
    } catch (err) {
      const msg = extractErrorMessage(err, "Error al cargar campañas");
      console.error("[MasterStore] loadCampaigns:", msg);
      set({ error: msg, loadingCampaigns: false });
    }
  },

  createCampaign: async (masterId, input) => {
    set({ error: null });
    try {
      const campaign = await createMasterCampaign(masterId, input);
      set((s) => ({ campaigns: [campaign, ...s.campaigns] }));
      return campaign;
    } catch (err) {
      const msg = extractErrorMessage(err, "Error al crear campaña");
      console.error("[MasterStore] createCampaign:", msg);
      set({ error: msg });
      throw err;
    }
  },

  updateCampaign: async (campaignId, input) => {
    set({ error: null });
    try {
      const updated = await updateMasterCampaign(campaignId, input);
      set((s) => ({
        campaigns: s.campaigns.map((c) => (c.id === campaignId ? updated : c)),
      }));
    } catch (err) {
      const msg = extractErrorMessage(err, "Error al actualizar campaña");
      console.error("[MasterStore] updateCampaign:", msg);
      set({ error: msg });
    }
  },

  deleteCampaign: async (campaignId) => {
    set({ error: null });
    try {
      await deleteMasterCampaign(campaignId);
      set((s) => ({
        campaigns: s.campaigns.filter((c) => c.id !== campaignId),
        activeCampaignId:
          s.activeCampaignId === campaignId ? null : s.activeCampaignId,
      }));
    } catch (err) {
      const msg = extractErrorMessage(err, "Error al eliminar campaña");
      console.error("[MasterStore] deleteCampaign:", msg);
      set({ error: msg });
    }
  },

  setActiveCampaign: (id) => {
    set({ activeCampaignId: id, players: [] });
  },

  // ── Player Actions ──

  loadPlayers: async (campaignId) => {
    set({ loadingPlayers: true, error: null });
    try {
      const players = await fetchCampaignPlayers(campaignId);
      set({ players, loadingPlayers: false });
    } catch (err) {
      const msg = extractErrorMessage(err, "Error al cargar jugadores");
      console.error("[MasterStore] loadPlayers:", msg);
      set({ error: msg, loadingPlayers: false });
    }
  },

  addPlayer: async (campaignId, characterCode) => {
    set({ error: null });
    try {
      // 1. Find character (and its owner profile) by code
      const result = await findCharacterByCode(characterCode);
      if (!result) {
        throw new Error(
          `No se encontró ningún personaje con el código "${characterCode}"`,
        );
      }

      const { profile, ...character } = result;

      // 2. Check player not already in campaign
      const existing = get().players.find((p) => p.profile.id === profile.id);
      if (existing) {
        throw new Error(
          `${profile.nombre || "Este jugador"} ya está en la campaña`,
        );
      }

      // 3. Add to campaign with character pre-assigned
      const membership = await addPlayerToCampaign(
        campaignId,
        profile.id,
        character.id,
      );

      // 4. Update local state
      const newPlayer: LobbyPlayer = {
        membership,
        profile,
        character,
      };
      set((s) => ({ players: [...s.players, newPlayer] }));

      // Return display name
      const charData = character.datos as Record<string, unknown> | undefined;
      const charName = (charData?.nombre as string) || "";
      const displayName = charName
        ? `${charName} (${profile.nombre || profile.codigo_jugador})`
        : profile.nombre || profile.codigo_jugador;
      return displayName;
    } catch (err) {
      const msg = extractErrorMessage(err, "Error al añadir jugador");
      console.error("[MasterStore] addPlayer:", msg);
      set({ error: msg });
      throw err;
    }
  },

  removePlayer: async (campaignId, playerId) => {
    set({ error: null });
    try {
      await removePlayerFromCampaign(campaignId, playerId);
      set((s) => ({
        players: s.players.filter((p) => p.profile.id !== playerId),
      }));
    } catch (err) {
      const msg = extractErrorMessage(err, "Error al eliminar jugador");
      console.error("[MasterStore] removePlayer:", msg);
      set({ error: msg });
    }
  },

  // ── Misc ──
  clearError: () => set({ error: null }),
}));
