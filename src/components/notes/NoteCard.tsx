/**
 * NoteCard - Expandable note card with actions
 *
 * Shows note title, preview text, tags, and date. Expands to show full
 * content, metadata, and action buttons (pin, edit, delete).
 * Extracted from NotesTab.tsx
 */

import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getPredefinedTags,
  getNotePreview,
  type Note,
  type NoteTag,
} from "@/types/notes";
import { useTheme } from "@/hooks";
import { withAlpha } from "@/utils/theme";
import { formatDate } from "@/utils/date";

const PREDEFINED_TAGS = getPredefinedTags();

function getTagById(id: string, customTags: NoteTag[]): NoteTag | undefined {
  return (
    PREDEFINED_TAGS.find((t) => t.id === id) ??
    customTags.find((t) => t.id === id)
  );
}

interface NoteCardProps {
  note: Note;
  customTags: NoteTag[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

export function NoteCard({
  note,
  customTags,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onTogglePin,
}: NoteCardProps) {
  const { colors } = useTheme();

  const noteTags = note.etiquetas
    .map((id) => getTagById(id, customTags))
    .filter(Boolean) as NoteTag[];

  return (
    <TouchableOpacity
      key={note.id}
      className="rounded-card border mb-2 overflow-hidden"
      style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}
      onPress={onToggleExpand}
      onLongPress={onEdit}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="p-3">
        <View className="flex-row items-start">
          {/* Pin indicator */}
          {note.fijada && (
            <View className="mr-2 mt-0.5">
              <Ionicons name="pin" size={14} color={colors.accentRed} />
            </View>
          )}

          {/* Type indicator */}
          <View
            className="h-8 w-8 rounded-lg items-center justify-center mr-3"
            style={{
              backgroundColor:
                note.tipo === "diario"
                  ? withAlpha(colors.accentRed, 0.12)
                  : `${colors.textMuted}20`,
            }}
          >
            <Ionicons
              name={
                note.tipo === "diario"
                  ? "journal-outline"
                  : "document-text-outline"
              }
              size={16}
              color={
                note.tipo === "diario" ? colors.accentRed : colors.textMuted
              }
            />
          </View>

          {/* Note info */}
          <View className="flex-1">
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.textPrimary }}
              numberOfLines={isExpanded ? undefined : 1}
            >
              {note.titulo}
            </Text>

            {/* Session info for diary notes */}
            {note.tipo === "diario" && note.numeroSesion !== null && (
              <Text className="text-[10px] font-medium mt-0.5" style={{ color: colors.accentRed }}>
                Sesión #{note.numeroSesion}
                {note.fechaSesion ? ` · ${note.fechaSesion}` : ""}
              </Text>
            )}

            {/* Preview (only when not expanded) */}
            {!isExpanded && note.contenido.trim().length > 0 && (
              <Text
                className="text-xs mt-0.5"
                style={{ color: colors.textMuted }}
                numberOfLines={2}
              >
                {getNotePreview(note.contenido, 100)}
              </Text>
            )}

            {/* Tags */}
            {noteTags.length > 0 && (
              <View className="flex-row flex-wrap mt-1.5">
                {noteTags.map((tag) => (
                  <View
                    key={tag.id}
                    className="flex-row items-center rounded-full px-2 py-0.5 mr-1.5 mb-1"
                    style={{ backgroundColor: `${tag.color}20` }}
                  >
                    <Ionicons name={tag.icon as any} size={10} color={tag.color} />
                    <Text
                      className="text-[10px] font-medium ml-0.5"
                      style={{ color: tag.color }}
                    >
                      {tag.nombre}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Date */}
            <Text className="text-[10px] mt-1" style={{ color: colors.textMuted }}>
              {formatDate(note.fechaModificacion)}
            </Text>
          </View>

          {/* Actions indicator */}
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.textMuted}
            style={{ marginTop: 2 }}
          />
        </View>
      </View>

      {/* Expanded content */}
      {isExpanded && (
        <View className="px-3 pb-3 border-t" style={{ borderColor: colors.borderDefault }}>
          {/* Full content */}
          {note.contenido.trim().length > 0 ? (
            <Text className="text-sm leading-6 mt-3 mb-3" style={{ color: colors.textSecondary }}>
              {note.contenido}
            </Text>
          ) : (
            <Text className="text-sm italic mt-3 mb-3" style={{ color: colors.textMuted }}>
              Sin contenido
            </Text>
          )}

          {/* Master visibility badge */}
          {note.visibleParaMaster && (
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="eye-outline"
                size={12}
                color={colors.accentRed}
              />
              <Text className="text-[10px] ml-1" style={{ color: colors.accentRed }}>
                Visible para el Master
              </Text>
            </View>
          )}

          {/* Sent by master badge */}
          {note.enviadaPorMaster && (
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="person-circle-outline"
                size={12}
                color={colors.accentRed}
              />
              <Text className="text-[10px] ml-1" style={{ color: colors.accentRed }}>
                Enviada por el Master
              </Text>
            </View>
          )}

          {/* Metadata */}
          <View className="rounded-lg p-2.5 mb-3" style={{ backgroundColor: colors.bgSecondary }}>
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-[10px]" style={{ color: colors.textMuted }}>
                Creada
              </Text>
              <Text className="text-[10px]" style={{ color: colors.textMuted }}>
                {formatDate(note.fechaCreacion)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-[10px]" style={{ color: colors.textMuted }}>
                Modificada
              </Text>
              <Text className="text-[10px]" style={{ color: colors.textMuted }}>
                {formatDate(note.fechaModificacion)}
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row">
              <TouchableOpacity
                className="flex-row items-center rounded-lg px-3 py-2 mr-2 border active:opacity-70"
                style={{
                  backgroundColor: note.fijada
                    ? withAlpha(colors.accentRed, 0.15)
                    : colors.bgCard,
                  borderColor: note.fijada
                    ? withAlpha(colors.accentRed, 0.3)
                    : colors.borderDefault,
                }}
                onPress={onTogglePin}
              >
                <Ionicons
                  name={note.fijada ? "pin" : "pin-outline"}
                  size={14}
                  color={note.fijada ? colors.accentRed : colors.textMuted}
                />
                <Text
                  className="text-xs font-semibold ml-1"
                  style={{
                    color: note.fijada
                      ? colors.accentRed
                      : colors.textSecondary,
                  }}
                >
                  {note.fijada ? "Desanclar" : "Fijar"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center border rounded-lg px-3 py-2 mr-2"
                style={{ backgroundColor: colors.bgCard, borderColor: colors.borderDefault }}
                onPress={onEdit}
              >
                <Ionicons
                  name="create-outline"
                  size={14}
                  color={colors.accentRed}
                />
                <Text className="text-xs font-semibold ml-1" style={{ color: colors.accentRed }}>
                  Editar
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="flex-row items-center border rounded-lg px-3 py-2"
              style={{ backgroundColor: withAlpha(colors.accentDanger, 0.1), borderColor: withAlpha(colors.accentDanger, 0.2) }}
              onPress={onDelete}
            >
              <Ionicons
                name="trash-outline"
                size={14}
                color={colors.accentDanger}
              />
              <Text className="text-xs font-semibold ml-1" style={{ color: colors.accentDanger }}>
                Eliminar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
