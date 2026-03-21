/**
 * Notes utility functions — create, filter, sort, preview.
 * Extracted from types/notes.ts for separation of concerns.
 */
import type {
  Note,
  NoteTag,
  PredefinedTag,
  QuickNoteInput,
  NoteFilters,
  NoteSortOptions,
} from "@/types/notes";
import {
  PREDEFINED_TAG_NAMES,
  PREDEFINED_TAG_ICONS,
  PREDEFINED_TAG_COLORS,
} from "@/constants/notes";
import { now } from "./providers";

/**
 * Crea una nota vacía por defecto con los campos mínimos.
 */
export function createDefaultNote(
  id: string,
  personajeId: string,
  partidaId: string
): Note {
  const timestamp = now();
  return {
    id,
    personajeId,
    partidaId,
    titulo: "",
    contenido: "",
    etiquetas: [],
    fijada: false,
    tipo: "general",
    numeroSesion: null,
    fechaSesion: null,
    visibleParaMaster: false,
    enviadaPorMaster: false,
    masterRemitenteId: null,
    fechaCreacion: timestamp,
    fechaModificacion: timestamp,
  };
}

/**
 * Crea una nota rápida con título auto-generado basado en la fecha actual.
 */
export function createQuickNote(
  id: string,
  input: QuickNoteInput
): Note {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = currentDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    id,
    personajeId: input.personajeId,
    partidaId: input.partidaId,
    titulo: `Nota rápida - ${formattedDate} ${formattedTime}`,
    contenido: input.contenido,
    etiquetas: [],
    fijada: false,
    tipo: "general",
    numeroSesion: null,
    fechaSesion: null,
    visibleParaMaster: false,
    enviadaPorMaster: false,
    masterRemitenteId: null,
    fechaCreacion: now(),
    fechaModificacion: now(),
  };
}

/**
 * Genera las etiquetas predefinidas como objetos NoteTag.
 */
export function getPredefinedTags(): NoteTag[] {
  const predefinedKeys: PredefinedTag[] = [
    "npc",
    "lugar",
    "mision",
    "objeto",
    "lore",
    "pista",
    "comercio",
    "general",
  ];

  return predefinedKeys.map((key) => ({
    id: `predefined_${key}`,
    nombre: PREDEFINED_TAG_NAMES[key],
    icon: PREDEFINED_TAG_ICONS[key],
    color: PREDEFINED_TAG_COLORS[key],
    predefined: true,
  }));
}

/**
 * Filtra notas según los filtros proporcionados.
 */
export function filterNotes(notes: Note[], filters: NoteFilters): Note[] {
  let result = [...notes];

  if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
    const query = filters.searchQuery.toLowerCase().trim();
    result = result.filter(
      (note) =>
        note.titulo.toLowerCase().includes(query) ||
        note.contenido.toLowerCase().includes(query)
    );
  }

  if (filters.tagIds && filters.tagIds.length > 0) {
    result = result.filter((note) =>
      filters.tagIds!.some((tagId) => note.etiquetas.includes(tagId))
    );
  }

  if (filters.tipo) {
    result = result.filter((note) => note.tipo === filters.tipo);
  }

  if (filters.soloFijadas) {
    result = result.filter((note) => note.fijada);
  }

  if (filters.soloDelMaster) {
    result = result.filter((note) => note.enviadaPorMaster);
  }

  if (filters.soloVisiblesParaMaster) {
    result = result.filter((note) => note.visibleParaMaster);
  }

  return result;
}

/**
 * Ordena notas según las opciones de ordenamiento.
 * Las notas fijadas siempre aparecen primero.
 */
export function sortNotes(notes: Note[], options: NoteSortOptions): Note[] {
  const pinned = notes.filter((n) => n.fijada);
  const unpinned = notes.filter((n) => !n.fijada);

  const compareFn = (a: Note, b: Note): number => {
    let comparison = 0;

    switch (options.field) {
      case "fechaModificacion":
        comparison =
          (new Date(a.fechaModificacion).getTime() || 0) -
          (new Date(b.fechaModificacion).getTime() || 0);
        break;
      case "fechaCreacion":
        comparison =
          (new Date(a.fechaCreacion).getTime() || 0) -
          (new Date(b.fechaCreacion).getTime() || 0);
        break;
      case "titulo":
        comparison = a.titulo.localeCompare(b.titulo, "es");
        break;
      case "numeroSesion":
        comparison = (a.numeroSesion ?? 0) - (b.numeroSesion ?? 0);
        break;
    }

    return options.order === "desc" ? -comparison : comparison;
  };

  pinned.sort(compareFn);
  unpinned.sort(compareFn);

  return [...pinned, ...unpinned];
}

/**
 * Genera la vista previa de una nota (primeras líneas del contenido).
 */
export function getNotePreview(contenido: string, maxLength: number = 120): string {
  if (!contenido || contenido.trim().length === 0) {
    return "Sin contenido";
  }

  const trimmed = contenido.trim().replace(/\n+/g, " ");

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return trimmed.substring(0, maxLength).trim() + "...";
}

/**
 * Calcula el siguiente número de sesión.
 */
export function getNextSessionNumber(notes: Note[]): number {
  const diaryNotes = notes.filter(
    (n) => n.tipo === "diario" && n.numeroSesion !== null
  );

  if (diaryNotes.length === 0) return 1;

  const maxSession = Math.max(
    ...diaryNotes.map((n) => n.numeroSesion ?? 0)
  );

  return maxSession + 1;
}
