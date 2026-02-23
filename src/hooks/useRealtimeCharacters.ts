/**
 * useRealtimeCharacters — Real-time subscription for character updates.
 *
 * Used by the Master panel (HU-10.8) to receive live updates when
 * players modify their characters. Subscribes to Supabase Realtime
 * on the `personajes` table filtered by the IDs relevant to the campaign.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
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
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [status, setStatus] = useState<"idle" | "connected" | "error">("idle");

  const handlePayload = useCallback(
    (payload: { eventType: string; new: PersonajeRow | null; old: { id: string } | null }) => {
      if (payload.eventType === "DELETE" && payload.old?.id) {
        onDelete?.(payload.old.id);
      } else if (payload.new) {
        onUpdate(payload.new);
      }
    },
    [onUpdate, onDelete],
  );

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

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "personajes",
          filter,
        },
        (payload) => handlePayload(payload as unknown as { eventType: string; new: PersonajeRow | null; old: { id: string } | null }),
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setStatus("connected");
        } else if (status === "CHANNEL_ERROR") {
          setStatus("error");
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
      setStatus("idle");
    };
  }, [characterIds, enabled, handlePayload]);

  return { status };
}
