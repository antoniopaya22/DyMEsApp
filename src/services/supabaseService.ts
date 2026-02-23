/**
 * Supabase Service Layer — Data access functions for Master Mode.
 *
 * All Supabase queries are centralised here so stores and components
 * don't need to import the client directly.
 */

import { supabase } from "@/lib/supabase";
import type {
  CampanaMasterRow,
  CampanaJugadorRow,
  CampanaJugadorInsert,
  CampanaJugadorLocalRow,
  PersonajeRow,
  ProfileRow,
} from "@/types/supabase";
import type {
  CreateMasterCampaignInput,
  UpdateMasterCampaignInput,
  LobbyPlayer,
} from "@/types/master";
import { STORAGE_KEYS, setItem, getItem } from "@/utils/storage";
import type { Campaign } from "@/types/campaign";
import type { Character } from "@/types/character";
import type { Inventory } from "@/types/item";
import type { InternalMagicState } from "@/stores/characterStore/helpers";
import type { ClassResourcesState } from "@/stores/characterStore/classResourceTypes";
import type { Note } from "@/types/notes";

// ═══════════════════════════════════════════════════════════════════
// Character lookup by code
// ═══════════════════════════════════════════════════════════════════

/** Look up a character (personaje) by its short shareable code */
export async function findCharacterByCode(
  code: string,
): Promise<(PersonajeRow & { profile: ProfileRow }) | null> {
  const { data, error } = await supabase
    .from("personajes")
    .select("*, profile:profiles!usuario_id(*)")
    .eq("codigo_personaje", code.toUpperCase().trim())
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw error;
  }
  const row = data as Record<string, unknown>;
  return {
    ...(row as unknown as PersonajeRow),
    profile: row.profile as ProfileRow,
  };
}

// ═══════════════════════════════════════════════════════════════════
// Profile
// ═══════════════════════════════════════════════════════════════════

/** Look up a player profile by their short shareable code */
export async function findPlayerByCode(
  code: string,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("codigo_jugador", code.toUpperCase().trim())
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw error;
  }
  return data as ProfileRow;
}

// ═══════════════════════════════════════════════════════════════════
// Master Campaigns
// ═══════════════════════════════════════════════════════════════════

/** Fetch all campaigns owned by the given master */
export async function fetchMasterCampaigns(
  masterId: string,
): Promise<CampanaMasterRow[]> {
  const { data, error } = await supabase
    .from("campanas_master")
    .select("*")
    .eq("master_id", masterId)
    .order("actualizado_en", { ascending: false });

  if (error) {
    // Table/relation doesn't exist yet — return empty instead of crashing.
    // Supabase returns various codes depending on version (42P01, PGRST204, etc.)
    const isTableMissing =
      error.code === "42P01" ||
      error.code === "PGRST204" ||
      error.message?.includes("does not exist") ||
      error.message?.includes("Not Found");

    if (isTableMissing) {
      console.warn(
        "[supabaseService] Table campanas_master not available:",
        error.code,
        error.message,
        "— Run supabase/migrations/001_master_mode.sql",
      );
      return [];
    }
    throw new Error(error.message);
  }
  return (data ?? []) as CampanaMasterRow[];
}

/** Create a new master campaign */
export async function createMasterCampaign(
  masterId: string,
  input: CreateMasterCampaignInput,
): Promise<CampanaMasterRow> {
  const { data, error } = await supabase
    .from("campanas_master")
    .insert({
      master_id: masterId,
      nombre: input.nombre.trim(),
      descripcion: input.descripcion?.trim() || null,
      imagen: input.imagen || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CampanaMasterRow;
}

/** Update an existing master campaign */
export async function updateMasterCampaign(
  campaignId: string,
  input: UpdateMasterCampaignInput,
): Promise<CampanaMasterRow> {
  const payload: Record<string, unknown> = {};
  if (input.nombre !== undefined) payload.nombre = input.nombre.trim();
  if (input.descripcion !== undefined)
    payload.descripcion = input.descripcion?.trim() || null;
  if (input.imagen !== undefined) payload.imagen = input.imagen || null;

  const { data, error } = await supabase
    .from("campanas_master")
    .update(payload)
    .eq("id", campaignId)
    .select()
    .single();

  if (error) throw error;
  return data as CampanaMasterRow;
}

/** Delete a master campaign (cascade removes player links) */
export async function deleteMasterCampaign(
  campaignId: string,
): Promise<void> {
  const { error } = await supabase
    .from("campanas_master")
    .delete()
    .eq("id", campaignId);

  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════════
// Campaign Players
// ═══════════════════════════════════════════════════════════════════

/** Fetch players (with profile + character) for a campaign */
export async function fetchCampaignPlayers(
  campaignId: string,
): Promise<LobbyPlayer[]> {
  const { data, error } = await supabase
    .from("campana_jugadores")
    .select(
      `
      *,
      profile:profiles!jugador_id(*),
      character:personajes!personaje_id(*)
    `,
    )
    .eq("campana_id", campaignId);

  if (error) throw error;

  return ((data ?? []) as unknown[]).map((row: unknown) => {
    const r = row as Record<string, unknown>;
    return {
      membership: {
        id: r.id,
        campana_id: r.campana_id,
        jugador_id: r.jugador_id,
        personaje_id: r.personaje_id,
        unido_en: r.unido_en,
      } as CampanaJugadorRow,
      profile: r.profile as ProfileRow,
      character: (r.character as PersonajeRow) ?? null,
    };
  });
}

/** Add a player to a campaign (optionally with a character pre-assigned) */
export async function addPlayerToCampaign(
  campaignId: string,
  playerId: string,
  personajeId?: string,
): Promise<CampanaJugadorRow> {
  const payload: CampanaJugadorInsert = {
    campana_id: campaignId,
    jugador_id: playerId,
    personaje_id: personajeId ?? null,
  };

  const { data, error } = await supabase
    .from("campana_jugadores")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as CampanaJugadorRow;
}

/** Remove a player from a campaign */
export async function removePlayerFromCampaign(
  campaignId: string,
  playerId: string,
): Promise<void> {
  const { error } = await supabase
    .from("campana_jugadores")
    .delete()
    .eq("campana_id", campaignId)
    .eq("jugador_id", playerId);

  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════════
// Synced Characters
// ═══════════════════════════════════════════════════════════════════

/** Upsert a character snapshot to Supabase (used by the sync layer) */
export async function upsertCharacter(
  characterId: string,
  userId: string,
  datos: Record<string, unknown>,
): Promise<PersonajeRow> {
  const { data, error } = await supabase
    .from("personajes")
    .upsert(
      {
        id: characterId,
        usuario_id: userId,
        datos,
      },
      { onConflict: "id" },
    )
    .select()
    .single();

  if (error) throw error;
  return data as PersonajeRow;
}

/** Fetch all characters owned by a user */
export async function fetchUserCharacters(
  userId: string,
): Promise<PersonajeRow[]> {
  const { data, error } = await supabase
    .from("personajes")
    .select("*")
    .eq("usuario_id", userId)
    .order("actualizado_en", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PersonajeRow[];
}

/** Delete a character from Supabase (fire-and-forget, used when player deletes locally) */
export async function deleteCharacterFromCloud(
  characterId: string,
): Promise<void> {
  const { error } = await supabase
    .from("personajes")
    .delete()
    .eq("id", characterId);

  if (error) console.warn("[supabaseService] deleteCharacterFromCloud:", error.message);
}

/** Assign (or un-assign) a character to a campaign membership */
export async function assignCharacterToCampaign(
  campaignId: string,
  playerId: string,
  characterId: string | null,
): Promise<void> {
  const { error } = await supabase
    .from("campana_jugadores")
    .update({ personaje_id: characterId })
    .eq("campana_id", campaignId)
    .eq("jugador_id", playerId);

  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════════
// Local Campaign Sync (backup player campaigns to Supabase)
// ═══════════════════════════════════════════════════════════════════

/** Sync a local campaign to Supabase for backup */
export async function syncLocalCampaign(
  userId: string,
  campaign: {
    id: string;
    nombre: string;
    descripcion?: string;
    imagen?: string;
    personajeId?: string;
    creadoEn: string;
    actualizadoEn: string;
  },
): Promise<void> {
  const { error } = await supabase.from("campanas_jugador").upsert(
    {
      id: campaign.id,
      usuario_id: userId,
      nombre: campaign.nombre,
      descripcion: campaign.descripcion || null,
      imagen: campaign.imagen || null,
      personaje_id: campaign.personajeId || null,
      creado_en: campaign.creadoEn,
      actualizado_en: campaign.actualizadoEn,
    },
    { onConflict: "id" },
  );

  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════════
// Fetch player campaigns from Supabase
// ═══════════════════════════════════════════════════════════════════

/** Fetch all local (player-mode) campaigns backed up by a user */
export async function fetchUserLocalCampaigns(
  userId: string,
): Promise<CampanaJugadorLocalRow[]> {
  const { data, error } = await supabase
    .from("campanas_jugador")
    .select("*")
    .eq("usuario_id", userId)
    .order("actualizado_en", { ascending: false });

  if (error) {
    // Table may not exist yet
    const isTableMissing =
      error.code === "42P01" ||
      error.code === "PGRST204" ||
      error.message?.includes("does not exist");
    if (isTableMissing) return [];
    throw error;
  }
  return (data ?? []) as CampanaJugadorLocalRow[];
}

/** Delete a player campaign backup from Supabase */
export async function deleteLocalCampaignBackup(
  campaignId: string,
): Promise<void> {
  const { error } = await supabase
    .from("campanas_jugador")
    .delete()
    .eq("id", campaignId);

  // Ignore errors (table might not exist, row might not exist)
  if (error) console.warn("[supabaseService] deleteLocalCampaignBackup:", error.message);
}

// ═══════════════════════════════════════════════════════════════════
// Cloud Restore — Download user data from Supabase → AsyncStorage
// ═══════════════════════════════════════════════════════════════════

/**
 * Restore the user's campaigns and characters from Supabase into AsyncStorage.
 * Called after login when local storage is empty (first login or after sign-out).
 * Returns the number of items restored, or 0 if nothing was restored.
 */
export async function restoreFromCloud(userId: string): Promise<number> {
  try {
    // Check if local character list already exists — don't overwrite
    const existingCharacterList = await getItem<unknown[]>(STORAGE_KEYS.CHARACTER_LIST);
    const existingCampaigns = await getItem<Campaign[]>(STORAGE_KEYS.CAMPAIGNS);
    if (
      (existingCharacterList && existingCharacterList.length > 0) ||
      (existingCampaigns && existingCampaigns.length > 0)
    ) {
      console.log("[CloudRestore] Local data exists, skipping restore");
      return 0;
    }

    // 1. Fetch campaigns backed up to Supabase (legacy, for master mode compat)
    const cloudCampaigns = await fetchUserLocalCampaigns(userId);

    // 2. Fetch all characters owned by this user
    const cloudCharacters = await fetchUserCharacters(userId);

    if (cloudCampaigns.length === 0 && cloudCharacters.length === 0) {
      console.log("[CloudRestore] No cloud data found for user");
      return 0;
    }

    console.log(
      `[CloudRestore] Restoring ${cloudCampaigns.length} campaigns, ${cloudCharacters.length} characters`,
    );

    // 3. Write characters to AsyncStorage + build character list
    interface RestoredCharacterSummary {
      id: string;
      nombre: string;
      clase: string;
      raza: string;
      subraza: string;
      nivel: number;
      customRaceName?: string;
      creadoEn: string;
      actualizadoEn: string;
    }
    const characterSummaries: RestoredCharacterSummary[] = [];

    for (const row of cloudCharacters) {
      const datos = row.datos as Record<string, unknown>;
      // Extract the character base data (everything except underscore-prefixed extras)
      const { _magicState, _classResources, _inventory, _notes, ...characterData } =
        datos as Record<string, unknown> & {
          _magicState?: InternalMagicState | null;
          _classResources?: ClassResourcesState | null;
          _inventory?: Inventory | null;
          _notes?: Note[] | null;
        };

      const charId = row.id;
      const char = characterData as unknown as Character;

      // Write character
      await setItem(STORAGE_KEYS.CHARACTER(charId), char);

      // Write magic state if present
      if (_magicState) {
        await setItem(STORAGE_KEYS.MAGIC_STATE(charId), _magicState);
      }

      // Write class resources if present
      if (_classResources) {
        await setItem(STORAGE_KEYS.CLASS_RESOURCES(charId), _classResources);
      }

      // Write inventory if present
      if (_inventory) {
        await setItem(STORAGE_KEYS.INVENTORY(charId), _inventory);
      }

      // Write notes if present
      if (_notes && _notes.length > 0) {
        await setItem(STORAGE_KEYS.NOTES(charId), _notes);
      }

      // Build character summary for the character list
      characterSummaries.push({
        id: charId,
        nombre: char.nombre || "Personaje",
        clase: char.clase || "",
        raza: char.raza || "",
        subraza: char.subraza || "",
        nivel: char.nivel || 1,
        customRaceName: char.customRaceName,
        creadoEn: char.creadoEn || row.actualizado_en,
        actualizadoEn: char.actualizadoEn || row.actualizado_en,
      });
    }

    // 4. Write character list to AsyncStorage (new single-player format)
    if (characterSummaries.length > 0) {
      await setItem(STORAGE_KEYS.CHARACTER_LIST, characterSummaries);
      console.log(`[CloudRestore] Restored ${characterSummaries.length} characters to character list`);
    }

    // 5. Write campaigns to AsyncStorage (legacy format, used by migration + master mode)
    const localCampaigns: Campaign[] = cloudCampaigns.map((row) => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion ?? undefined,
      imagen: row.imagen ?? undefined,
      personajeId: row.personaje_id ?? undefined,
      creadoEn: row.creado_en,
      actualizadoEn: row.actualizado_en,
    }));

    // Also create campaigns for characters that don't have a campaign
    // (orphaned characters backed up via useCharacterSync)
    const campaignCharacterIds = new Set(
      localCampaigns.map((c) => c.personajeId).filter(Boolean),
    );
    for (const row of cloudCharacters) {
      if (!campaignCharacterIds.has(row.id)) {
        const datos = row.datos as Record<string, unknown>;
        const charName = (datos.nombre as string) || "Personaje";
        localCampaigns.push({
          id: `restored-${row.id}`,
          nombre: `Partida de ${charName}`,
          personajeId: row.id,
          creadoEn: row.actualizado_en,
          actualizadoEn: row.actualizado_en,
        });
      }
    }

    if (localCampaigns.length > 0) {
      await setItem(STORAGE_KEYS.CAMPAIGNS, localCampaigns);
    }

    const totalRestored = characterSummaries.length || localCampaigns.length;
    console.log(`[CloudRestore] Restore complete (${totalRestored} items)`);
    return totalRestored;
  } catch (err) {
    console.error("[CloudRestore] Failed to restore:", err);
    return 0;
  }
}