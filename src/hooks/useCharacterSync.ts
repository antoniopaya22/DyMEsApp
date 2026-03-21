/**
 * useCharacterSync — Bi-directional sync between local character data and Supabase.
 *
 * OUTBOUND: Watches ALL character-related state (character, magic, class resources,
 * inventory, notes) and debounces pushes to the `personajes` table.
 *
 * INBOUND: Subscribes to Supabase Realtime so that changes made by the Master
 * (HP, conditions, inventory, traits, etc.) are applied to the local store
 * immediately — preventing the player's next outbound sync from overwriting them.
 *
 * Key design choices:
 *   - Deep JSON fingerprint: catches ALL mutations.
 *   - Flush-on-unmount: pending sync is sent immediately on navigate-away.
 *   - Notes included: notes are synced alongside the character data.
 *   - Inbound guard: a `skipNextSync` ref prevents the outbound push that would
 *     be triggered by applying the remote update to the Zustand store.
 *
 * Returns the `codigo_personaje` once the first sync completes.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useCharacterStore } from "@/stores/characterStore";
import {
  upsertCharacter,
  fetchCharacterDatos,
  createSingleCharacterChannel,
  removeRealtimeChannel,
} from "@/services/supabaseService";
import { STORAGE_KEYS, setItem } from "@/utils/storage";
import type { Character } from "@/types/character";
import type { Note } from "@/types/notes";
import type { Inventory } from "@/types/item";
import type { InternalMagicState } from "@/stores/characterStore/helpers";
import type { ClassResourcesState } from "@/stores/characterStore/classResourceTypes";

const SYNC_DEBOUNCE_MS = 2_000;

/**
 * Extended payload that bundles all character-related data for the master view.
 * Stored as a single JSONB object in Supabase `personajes.datos`.
 */
export interface SyncedCharacterData extends Character {
  _magicState?: InternalMagicState | null;
  _classResources?: ClassResourcesState | null;
  _inventory?: Inventory | null;
  _notes?: Note[] | null;
}

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Builds a deep fingerprint that covers every mutable field across all slices.
 * Whenever ANY field changes, the fingerprint changes → sync triggers.
 */
function buildFingerprint(
  character: Character,
  magicState: InternalMagicState | null,
  classResources: ClassResourcesState | null,
  inventory: Inventory | null,
  notes: Note[],
): string {
  // Character: use actualizadoEn + volatile combat/progression fields
  // that may NOT always bump actualizadoEn (e.g. from older store versions).
  const charPrint = `${character.actualizadoEn}|${character.hp.current}/${character.hp.max}/${character.hp.temp}|${character.hitDice.remaining}|${character.deathSaves.successes}/${character.deathSaves.failures}|${character.conditions.length}|${character.concentration?.spellId ?? ""}|${character.traits.map(t => `${t.id}:${t.currentUses}`).join(",")}|${character.nivel}|${character.experiencia}|${character.preparedSpellIds.join(",")}|${character.knownSpellIds.length}`;

  // Magic state: full serialisation (spell slots, pact magic, sorcery points)
  const magicPrint = magicState
    ? JSON.stringify(magicState)
    : "";

  // Class resources: all current values
  const resPrint = classResources
    ? JSON.stringify(classResources)
    : "";

  // Inventory: full serialisation (coins + every item field)
  const invPrint = inventory
    ? JSON.stringify(inventory)
    : "";

  // Notes: count + all modification timestamps (so edits to any note trigger sync)
  const notesPrint = notes.length > 0
    ? `${notes.length}|${notes.map((n) => n.fechaModificacion ?? n.fechaCreacion ?? '').join(',')}`
    : "";

  return `${charPrint}||${magicPrint}||${resPrint}||${invPrint}||${notesPrint}`;
}

/**
 * Builds the payload for Supabase sync.
 * Bundles the Character object with magic state, class resources, inventory and notes.
 */
function buildSyncPayload(
  character: Character,
  magicState: InternalMagicState | null,
  classResources: ClassResourcesState | null,
  inventory: Inventory | null,
  notes: Note[],
): SyncedCharacterData {
  return {
    ...character,
    _magicState: magicState,
    _classResources: classResources,
    _inventory: inventory,
    _notes: notes.length > 0 ? notes : null,
  };
}

// ── Hook ─────────────────────────────────────────────────────────────

/**
 * Call this hook in the character sheet screen.
 * It watches the character store and pushes updates to Supabase,
 * and also listens for inbound changes (e.g. from the Master).
 * Returns the `characterCode` (codigo_personaje) once synced.
 */
export function useCharacterSync(): string | null {
  const user = useAuthStore((s) => s.user);
  const character = useCharacterStore((s) => s.character);
  const magicState = useCharacterStore((s) => s.magicState);
  const classResources = useCharacterStore((s) => s.classResources);
  const inventory = useCharacterStore((s) => s.inventory);
  const notes = useCharacterStore((s) => s.notes);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedRef = useRef<string | null>(null);
  const [characterCode, setCharacterCode] = useState<string | null>(null);

  // Guard: when we apply a remote update to the Zustand store, the
  // outbound sync effect will fire because the store changed.
  // This flag tells it to skip the next push cycle.
  const skipNextSyncRef = useRef(false);

  // Blocks outbound sync until the initial remote fetch completes,
  // preventing stale local data from overwriting master edits.
  const hasInitialFetchRef = useRef(false);

  // Ref holding the pending (un-synced) payload for flush-on-unmount.
  const pendingRef = useRef<{
    charId: string;
    userId: string;
    payload: Record<string, unknown>;
  } | null>(null);

  // ── Inbound: apply remote changes from Master ─────────────────────
  const applyRemoteUpdate = useCallback(
    async (datos: Record<string, unknown>) => {
      const store = useCharacterStore.getState();
      const localChar = store.character;
      if (!localChar) return;

      const remote = datos as unknown as SyncedCharacterData;
      // Basic sanity: same character
      if (remote.id !== localChar.id) return;

      const { _magicState, _classResources, _inventory, _notes, ...charData } =
        remote;

      // Echo detection: if the remote data produces the same fingerprint as
      // our last sync, this is our own write echoed back — ignore it.
      const remoteFingerprint = buildFingerprint(
        charData as Character,
        _magicState ?? null,
        _classResources ?? null,
        _inventory ?? null,
        _notes ?? [],
      );
      if (remoteFingerprint === lastSyncedRef.current) return;

      // Build a Zustand-compatible state patch
      const patch: Record<string, unknown> = {};

      // Character fields the master can edit
      patch.character = { ...localChar, ...charData };

      if (_inventory !== undefined) {
        patch.inventory = _inventory;
      }
      if (_magicState !== undefined) {
        patch.magicState = _magicState;
      }
      if (_classResources !== undefined) {
        patch.classResources = _classResources;
      }
      if (_notes !== undefined && _notes !== null) {
        patch.notes = _notes;
      }

      // Tell outbound sync to skip the next cycle
      skipNextSyncRef.current = true;

      // Apply to Zustand store
      useCharacterStore.setState(patch);

      // Persist to local AsyncStorage so it survives app restarts
      try {
        const updatedChar = patch.character as Character;
        await setItem(STORAGE_KEYS.CHARACTER(localChar.id), updatedChar);
        if (_inventory !== undefined)
          await setItem(STORAGE_KEYS.INVENTORY(localChar.id), _inventory);
        if (_magicState !== undefined)
          await setItem(STORAGE_KEYS.MAGIC_STATE(localChar.id), _magicState);
        if (_classResources !== undefined)
          await setItem(
            STORAGE_KEYS.CLASS_RESOURCES(localChar.id),
            _classResources,
          );
        if (_notes !== undefined && _notes !== null)
          await setItem(STORAGE_KEYS.NOTES(localChar.id), _notes);
      } catch (err) {
        console.error("[CharacterSync] Failed to persist remote update:", err);
      }

      // Update the fingerprint so the outbound sync won't re-push
      const updatedStore = useCharacterStore.getState();
      if (updatedStore.character) {
        lastSyncedRef.current = buildFingerprint(
          updatedStore.character,
          updatedStore.magicState,
          updatedStore.classResources,
          updatedStore.inventory,
          updatedStore.notes,
        );
      }

      console.log("[CharacterSync] Applied remote update for", localChar.id);
    },
    [],
  );

  // ── Realtime subscription ──────────────────────────────────────────
  useEffect(() => {
    if (!character) return;

    const channel = createSingleCharacterChannel(
      character.id,
      applyRemoteUpdate,
      'player-sync',
    );

    return () => {
      removeRealtimeChannel(channel);
    };
  }, [character?.id, applyRemoteUpdate]);

  // ── Initial fetch: pull remote data before first outbound push ─────
  // Prevents stale AsyncStorage data from overwriting master edits.
  useEffect(() => {
    if (!user || !character) return;
    if (hasInitialFetchRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        const remoteDatos = await fetchCharacterDatos(character.id);
        if (cancelled || !remoteDatos) {
          hasInitialFetchRef.current = true;
          return;
        }

        const remote = remoteDatos as unknown as SyncedCharacterData;
        if (remote.id !== character.id) {
          hasInitialFetchRef.current = true;
          return;
        }

        const { _magicState, _classResources, _inventory, _notes, ...charData } = remote;

        // If remote is identical to local, skip the store update
        const remoteFingerprint = buildFingerprint(
          charData as Character,
          _magicState ?? null,
          _classResources ?? null,
          _inventory ?? null,
          _notes ?? [],
        );
        const localFingerprint = buildFingerprint(
          character, magicState, classResources, inventory, notes,
        );

        if (remoteFingerprint !== localFingerprint) {
          // Remote has changes (e.g. master edited HP) — apply them
          const patch: Record<string, unknown> = {};
          patch.character = { ...character, ...charData };
          if (_inventory !== undefined) patch.inventory = _inventory;
          if (_magicState !== undefined) patch.magicState = _magicState;
          if (_classResources !== undefined) patch.classResources = _classResources;
          if (_notes !== undefined && _notes !== null) patch.notes = _notes;

          skipNextSyncRef.current = true;
          useCharacterStore.setState(patch);

          // Persist to AsyncStorage
          const updatedChar = patch.character as Character;
          await setItem(STORAGE_KEYS.CHARACTER(character.id), updatedChar);
          if (_inventory !== undefined)
            await setItem(STORAGE_KEYS.INVENTORY(character.id), _inventory);
          if (_magicState !== undefined)
            await setItem(STORAGE_KEYS.MAGIC_STATE(character.id), _magicState);
          if (_classResources !== undefined)
            await setItem(STORAGE_KEYS.CLASS_RESOURCES(character.id), _classResources);
          if (_notes !== undefined && _notes !== null)
            await setItem(STORAGE_KEYS.NOTES(character.id), _notes);

          console.log('[CharacterSync] Initial fetch: applied remote data');
        }

        // Set fingerprint based on final state (remote or unchanged local)
        const finalStore = useCharacterStore.getState();
        if (finalStore.character) {
          lastSyncedRef.current = buildFingerprint(
            finalStore.character,
            finalStore.magicState,
            finalStore.classResources,
            finalStore.inventory,
            finalStore.notes,
          );
        }
      } catch (err) {
        console.warn('[CharacterSync] Initial fetch failed (offline?):', err);
      } finally {
        if (!cancelled) hasInitialFetchRef.current = true;
      }
    })();

    return () => { cancelled = true; };
  }, [user, character?.id]);

  // ── Main sync effect (debounced, outbound) ─────────────────────────
  useEffect(() => {
    if (!user || !character) return;

    // Block outbound pushes until we've compared with remote data
    if (!hasInitialFetchRef.current) return;

    // If we just applied a remote update, skip this sync cycle
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }

    const fingerprint = buildFingerprint(
      character, magicState, classResources, inventory, notes,
    );

    // Skip if nothing changed since the last successful sync.
    if (fingerprint === lastSyncedRef.current) return;

    // Prepare the payload eagerly so flush-on-unmount has it.
    const syncData = buildSyncPayload(
      character, magicState, classResources, inventory, notes,
    ) as unknown as Record<string, unknown>;

    pendingRef.current = {
      charId: character.id,
      userId: user.id,
      payload: syncData,
    };

    // Debounce: cancel previous timer, start a new one.
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const result = await upsertCharacter(
          character.id, user.id, syncData,
        );
        lastSyncedRef.current = fingerprint;
        pendingRef.current = null;
        setCharacterCode(result.codigo_personaje);
        console.log(
          "[CharacterSync] Synced", character.id,
          "code:", result.codigo_personaje,
        );
      } catch (err) {
        console.error("[CharacterSync] Failed to sync:", err);
        // pendingRef stays set → will retry on next change or flush on unmount
      }
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, character, magicState, classResources, inventory, notes]);

  // ── Flush on unmount ───────────────────────────────────────────────
  // If the user navigates away before the debounce fires, push the
  // pending payload immediately (fire-and-forget).
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (pendingRef.current) {
        const { charId, userId, payload } = pendingRef.current;
        upsertCharacter(charId, userId, payload)
          .then(() => console.log("[CharacterSync] Flushed on unmount", charId))
          .catch((err) => console.error("[CharacterSync] Flush failed:", err));
        pendingRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return characterCode;
}
