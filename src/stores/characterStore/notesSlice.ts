/**
 * Notes Slice — character notes CRUD.
 * Mirrors the original store's notes section exactly.
 */

import { randomUUID } from "expo-crypto";
import type {
  Note,
  CreateNoteInput,
  UpdateNoteInput,
  NoteTag,
} from "@/types/notes";
import { createDefaultNote, createQuickNote } from "@/types/notes";
import { STORAGE_KEYS, getItem } from "@/utils/storage";
import { now } from "@/utils/providers";
import { safeSetItem } from "./helpers";
import type { CharacterStore, NotesSliceState, NotesActions } from "./types";

type SetState = (partial: Partial<CharacterStore>) => void;
type GetState = () => CharacterStore;

export const NOTES_INITIAL_STATE: NotesSliceState = {
  notes: [],
  customTags: [],
};

export function createNotesSlice(
  set: SetState,
  get: GetState,
): NotesActions {
  return {
    loadNotes: async (characterId: string) => {
      try {
        const notesKey = STORAGE_KEYS.NOTES(characterId);
        const notes = (await getItem<Note[]>(notesKey)) ?? [];
        const customTags =
          (await getItem<NoteTag[]>(STORAGE_KEYS.CUSTOM_TAGS)) ?? [];
        set({ notes, customTags });
      } catch (err) {
        console.error("[NotesSlice] loadNotes:", err);
      }
    },

    addNote: async (input: CreateNoteInput) => {
      const { character, notes } = get();
      if (!character) throw new Error("No character loaded");

      const noteId = randomUUID();
      const note = createDefaultNote(noteId, input.personajeId, input.partidaId);
      const newNote: Note = {
        ...note,
        titulo: input.titulo,
        contenido: input.contenido,
        etiquetas: input.etiquetas ?? [],
        tipo: input.tipo ?? "general",
        numeroSesion: input.numeroSesion ?? null,
        fechaSesion: input.fechaSesion ?? null,
        visibleParaMaster: input.visibleParaMaster ?? false,
      };

      const updatedNotes = [newNote, ...notes];
      set({ notes: updatedNotes });
      await safeSetItem(STORAGE_KEYS.NOTES(character.id), updatedNotes);

      return newNote;
    },

    updateNote: async (noteId: string, updates: UpdateNoteInput) => {
      const { character, notes } = get();
      if (!character) return;

      const updatedNotes = notes.map((note) => {
        if (note.id !== noteId) return note;
        return {
          ...note,
          ...updates,
          fechaModificacion: now(),
        };
      });

      set({ notes: updatedNotes });
      await safeSetItem(STORAGE_KEYS.NOTES(character.id), updatedNotes);
    },

    deleteNote: async (noteId: string) => {
      const { character, notes } = get();
      if (!character) return;

      const updatedNotes = notes.filter((n) => n.id !== noteId);
      set({ notes: updatedNotes });
      await safeSetItem(STORAGE_KEYS.NOTES(character.id), updatedNotes);
    },

    togglePinNote: async (noteId: string) => {
      const { character, notes } = get();
      if (!character) return;

      const updatedNotes = notes.map((note) => {
        if (note.id !== noteId) return note;
        return {
          ...note,
          fijada: !note.fijada,
          fechaModificacion: now(),
        };
      });

      set({ notes: updatedNotes });
      await safeSetItem(STORAGE_KEYS.NOTES(character.id), updatedNotes);
    },

    addQuickNote: async (content: string) => {
      const { character, notes } = get();
      if (!character) throw new Error("No character loaded");

      const noteId = randomUUID();
      const newNote = createQuickNote(noteId, {
        personajeId: character.id,
        partidaId: character.campaignId ?? character.id,
        contenido: content,
      });

      const updatedNotes = [newNote, ...notes];
      set({ notes: updatedNotes });
      await safeSetItem(STORAGE_KEYS.NOTES(character.id), updatedNotes);

      return newNote;
    },
  };
}
