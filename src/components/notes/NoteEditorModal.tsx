/**
 * NoteEditorModal - Full-screen modal for creating/editing notes
 *
 * Manages its own form state. Resets form when opened based on
 * editingNote (null = new note). Calls store directly for addNote/updateNote.
 * Extracted from NotesTab.tsx
 */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCharacterStore } from "@/stores/characterStore";
import {
  getPredefinedTags,
  getNextSessionNumber,
  type Note,
  type NoteType,
} from "@/types/notes";
import { useTheme } from "@/hooks";
import type { DialogType } from "@/components/ui/ConfirmDialog";

const PREDEFINED_TAGS = getPredefinedTags();

interface NoteEditorModalProps {
  visible: boolean;
  editingNote: Note | null;
  /** When creating new note, the initial type ('general' | 'diario') */
  initialType?: NoteType;
  onClose: () => void;
  onShowToast: (message: string) => void;
  onShowDestructive: (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string; type?: DialogType },
  ) => void;
}

export function NoteEditorModal({
  visible,
  editingNote,
  initialType = "general",
  onClose,
  onShowToast,
  onShowDestructive,
}: NoteEditorModalProps) {
  const { colors } = useTheme();
  const { character, notes, addNote, updateNote } = useCharacterStore();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("general");
  const [tags, setTags] = useState<string[]>([]);
  const [sessionNumber, setSessionNumber] = useState("");
  const [sessionDate, setSessionDate] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (!visible) return;

    if (editingNote) {
      setTitle(editingNote.titulo);
      setContent(editingNote.contenido);
      setNoteType(editingNote.tipo);
      setTags([...editingNote.etiquetas]);
      setSessionNumber(
        editingNote.numeroSesion !== null
          ? String(editingNote.numeroSesion)
          : "",
      );
      setSessionDate(editingNote.fechaSesion ?? "");
    } else {
      setTitle("");
      setContent("");
      setNoteType(initialType);
      setTags([]);
      if (initialType === "diario") {
        setSessionNumber(String(getNextSessionNumber(notes)));
        setSessionDate(new Date().toISOString().split("T")[0]);
      } else {
        setSessionNumber("");
        setSessionDate("");
      }
    }
  }, [visible, editingNote, initialType]);

  const handleToggleTag = (tagId: string) => {
    setTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId],
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      onShowToast("El título es obligatorio");
      return;
    }

    try {
      if (editingNote) {
        await updateNote(editingNote.id, {
          titulo: title.trim(),
          contenido: content.trim(),
          tipo: noteType,
          etiquetas: tags,
          numeroSesion:
            noteType === "diario" && sessionNumber
              ? parseInt(sessionNumber, 10)
              : null,
          fechaSesion:
            noteType === "diario" && sessionDate ? sessionDate : null,
        });
        onShowToast("Nota actualizada");
      } else {
        await addNote({
          personajeId: character!.id,
          partidaId: character!.campaignId ?? character!.id,
          titulo: title.trim(),
          contenido: content.trim(),
          tipo: noteType,
          etiquetas: tags,
          numeroSesion:
            noteType === "diario" && sessionNumber
              ? parseInt(sessionNumber, 10)
              : null,
          fechaSesion:
            noteType === "diario" && sessionDate ? sessionDate : null,
        });
        onShowToast("Nota creada");
      }
      onClose();
    } catch {
      onShowToast("Error al guardar la nota");
    }
  };

  const handleRequestClose = () => {
    if (title.trim() || content.trim()) {
      onShowDestructive(
        "Descartar cambios",
        "¿Estás seguro de que quieres salir? Se perderán los cambios.",
        onClose,
        { confirmText: "Descartar", cancelText: "Seguir editando" },
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleRequestClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        style={{ backgroundColor: colors.bgPrimary }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-14 pb-3 border-b" style={{ borderColor: colors.borderDefault }}>
          <TouchableOpacity
            className="h-10 w-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.bgInput }}
            onPress={handleRequestClose}
          >
            <Ionicons name="close" size={22} color="white" />
          </TouchableOpacity>

          <Text className="text-base font-semibold" style={{ color: colors.textPrimary }}>
            {editingNote ? "Editar Nota" : "Nueva Nota"}
          </Text>

          <TouchableOpacity
            className={`rounded-lg px-4 py-2 ${!title.trim() ? "opacity-50" : ""}`}
            style={{ backgroundColor: title.trim() ? colors.accentRed : colors.bgSecondary }}
            onPress={handleSave}
            disabled={!title.trim()}
          >
            <Text className="text-white text-sm font-semibold">Guardar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Note type toggle */}
          <View className="flex-row mt-4 mb-4 rounded-xl p-1" style={{ backgroundColor: colors.bgSecondary }}>
            <TouchableOpacity
              className="flex-1 rounded-lg py-2.5 items-center flex-row justify-center"
              style={noteType === "general" ? { backgroundColor: colors.bgCard } : undefined}
              onPress={() => setNoteType("general")}
            >
              <Ionicons
                name="document-text-outline"
                size={16}
                color={
                  noteType === "general"
                    ? colors.textPrimary
                    : colors.textMuted
                }
              />
              <Text
                className="text-sm font-medium ml-1.5"
                style={{ color: noteType === "general" ? colors.textPrimary : colors.textMuted }}
              >
                General
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-lg py-2.5 items-center flex-row justify-center"
              style={noteType === "diario" ? { backgroundColor: colors.bgCard } : undefined}
              onPress={() => setNoteType("diario")}
            >
              <Ionicons
                name="journal-outline"
                size={16}
                color={
                  noteType === "diario" ? colors.accentBlue : colors.textMuted
                }
              />
              <Text
                className="text-sm font-medium ml-1.5"
                style={{ color: noteType === "diario" ? colors.accentBlue : colors.textMuted }}
              >
                Diario
              </Text>
            </TouchableOpacity>
          </View>

          {/* Session fields (diary only) */}
          {noteType === "diario" && (
            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: colors.textSecondary }}>
                  Nº Sesión
                </Text>
                <TextInput
                  className="rounded-xl px-4 py-3 text-sm border"
                  style={{ backgroundColor: colors.bgInput, color: colors.textPrimary, borderColor: colors.borderDefault }}
                  placeholder={String(getNextSessionNumber(notes))}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={sessionNumber}
                  onChangeText={setSessionNumber}
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: colors.textSecondary }}>
                  Fecha de sesión
                </Text>
                <TextInput
                  className="rounded-xl px-4 py-3 text-sm border"
                  style={{ backgroundColor: colors.bgInput, color: colors.textPrimary, borderColor: colors.borderDefault }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  value={sessionDate}
                  onChangeText={setSessionDate}
                />
              </View>
            </View>
          )}

          {/* Title */}
          <Text className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: colors.textSecondary }}>
            Título <Text style={{ color: colors.accentRed }}>*</Text>
          </Text>
          <TextInput
            className="rounded-xl px-4 py-3 text-base border mb-4"
            style={{ backgroundColor: colors.bgInput, color: colors.textPrimary, borderColor: colors.borderDefault }}
            placeholder="Título de la nota"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={200}
            autoFocus={!editingNote}
          />

          {/* Content */}
          <Text className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: colors.textSecondary }}>
            Contenido
          </Text>
          <TextInput
            className="rounded-xl px-4 py-3 text-sm border mb-4 min-h-[200px]"
            style={{ backgroundColor: colors.bgInput, color: colors.textPrimary, borderColor: colors.borderDefault }}
            placeholder="Escribe el contenido de tu nota aquí..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
            maxLength={5000}
          />

          {/* Tags */}
          <Text className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.textSecondary }}>
            Etiquetas
          </Text>
          <View className="flex-row flex-wrap mb-4">
            {PREDEFINED_TAGS.map((tag) => {
              const isSelected = tags.includes(tag.id);
              return (
                <TouchableOpacity
                  key={tag.id}
                  className="flex-row items-center rounded-full px-3 py-2 mr-2 mb-2 border"
                  style={
                    isSelected
                      ? {
                          backgroundColor: `${tag.color}20`,
                          borderColor: `${tag.color}50`,
                        }
                      : { backgroundColor: colors.bgSecondary, borderColor: colors.borderDefault }
                  }
                  onPress={() => handleToggleTag(tag.id)}
                >
                  <Text className="text-xs mr-1">{tag.icon}</Text>
                  <Text
                    className="text-xs font-medium"
                    style={{
                      color: isSelected ? tag.color : colors.textSecondary,
                    }}
                  >
                    {tag.nombre}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={12}
                      color={tag.color}
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Character count */}
          <View className="flex-row justify-end mb-4">
            <Text className="text-[10px]" style={{ color: colors.textMuted }}>
              {content.length}/5000 caracteres
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
