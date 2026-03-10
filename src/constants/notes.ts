/**
 * Notes constants — type/tag names, icons, colors.
 * Extracted from types/notes.ts for separation of concerns.
 */
import type { NoteType, PredefinedTag } from "@/types/notes";

export const NOTE_TYPE_NAMES: Record<NoteType, string> = {
  general: "General",
  diario: "Diario de Sesión",
};

export const PREDEFINED_TAG_NAMES: Record<PredefinedTag, string> = {
  npc: "NPC",
  lugar: "Lugar",
  mision: "Misión",
  objeto: "Objeto",
  lore: "Lore / Historia",
  pista: "Pista",
  comercio: "Comercio",
  general: "General",
};

export const PREDEFINED_TAG_ICONS: Record<PredefinedTag, string> = {
  npc: "person",
  lugar: "location",
  mision: "shield",
  objeto: "diamond",
  lore: "book",
  pista: "bulb",
  comercio: "cash",
  general: "document-text",
};

/**
 * Static tag colors — dark-mode optimized (Tailwind 500 shades).
 * These are domain-specific category colors, not theme tokens.
 * They may need a light-mode variant if contrast becomes an issue.
 */
export const PREDEFINED_TAG_COLORS: Record<PredefinedTag, string> = {
  npc: "#f59e0b",
  lugar: "#22c55e",
  mision: "#ef4444",
  objeto: "#a855f7",
  lore: "#3b82f6",
  pista: "#eab308",
  comercio: "#f97316",
  general: "#6b7280",
};
