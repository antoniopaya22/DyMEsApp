/**
 * useRealtimeCharacters — Real-time subscription for character updates.
 *
 * Used by the Master panel (HU-10.8) to receive live updates when
 * players modify their characters. Subscribes to Supabase Realtime
 * on the `personajes` table filtered by the IDs relevant to the campaign.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import {
  createCharactersRealtimeChannel,
  removeRealtimeChannel,
} from "@/services/supabaseService";
import type { PersonajeRow } from "@/types/supabase";

interface UseRealtimeCharactersOptions {
  /** The character IDs to subscribe to */
  characterIds: string[];
  /** Called whenever a character row is inserted or updated */
  onUpdate: (character: PersonajeRow) => void;
  /** Called whenever a character row is deleted */
  onDelete?: (characterId: string) => void;
  /** Whether the subscription is active */
  enabled?: boolean;
}

/**
 * Subscribes to real-time changes on `personajes` for the given IDs.
 * Returns the subscription status.
 */
export function useRealtimeCharacters({
  characterIds,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeCharactersOptions) {
  const channelRef = useRef<unknown | null>(null);
  const [status, setStatus] = useState<"idle" | "connected" | "error">("idle");

  // Use refs for callbacks to avoid subscription churn when callers pass inline fns
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);
  onUpdateRef.current = onUpdate;
  onDeleteRef.current = onDelete;

  useEffect(() => {
    if (!enabled || characterIds.length === 0) {
      setStatus("idle");
      return;
    }

    // Build a filter: id=in.(uuid1,uuid2,...)
    const filter = `id=in.(${characterIds.join(",")})`;

    // Use a simple hash of all IDs to avoid channel name collisions
    const sortedIds = [...characterIds].sort((a, b) => a.localeCompare(b));
    const idHash = sortedIds.join(",");
    let hashCode = 0;
    for (const ch of idHash) {
      hashCode = Math.trunc(((hashCode << 5) - hashCode + (ch.codePointAt(0) ?? 0)));
    }
    const channelName = `rt-chars-${Math.abs(hashCode).toString(36)}`;

    const channel = createCharactersRealtimeChannel(
      channelName,
      filter,
      (payload) => {
        const p = payload as { eventType: string; new: PersonajeRow | null; old: { id: string } | null };
        if (p.eventType === "DELETE" && p.old?.id) {
          onDeleteRef.current?.(p.old.id);
        } else if (p.new) {
          onUpdateRef.current(p.new);
        }
      },
      (subStatus) => {
        if (subStatus === "SUBSCRIBED") {
          setStatus("connected");
        } else if (subStatus === "CHANNEL_ERROR") {
          setStatus("error");
        }
      },
    );

    channelRef.current = channel;

    return () => {
      removeRealtimeChannel(channel);
      channelRef.current = null;
      setStatus("idle");
    };
  }, [characterIds, enabled]);

  return { status };
}
