/**
 * QuickNoteBar - Quick note creation widget
 *
 * Collapsed state shows a prompt; expanded shows a text input + save button.
 * Extracted from NotesTab.tsx
 */

import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks";
import { withAlpha } from "@/utils/theme";

interface QuickNoteBarProps {
  onSubmit: (content: string) => Promise<void>;
  onShowToast: (message: string) => void;
}

export function QuickNoteBar({ onSubmit, onShowToast }: QuickNoteBarProps) {
  const { colors } = useTheme();
  const [showInput, setShowInput] = useState(false);
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) {
      onShowToast("Escribe algo para la nota rápida");
      return;
    }

    try {
      await onSubmit(content.trim());
      setContent("");
      setShowInput(false);
      onShowToast("Nota rápida creada");
    } catch {
      onShowToast("Error al crear la nota rápida");
    }
  };

  return (
    <View
      className="rounded-card border p-3 mb-4"
      style={{ backgroundColor: colors.bgElevated, borderColor: colors.borderDefault }}
    >
      {!showInput ? (
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => setShowInput(true)}
        >
          <View
            className="h-9 w-9 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: withAlpha(colors.accentRed, 0.2) }}
          >
            <Ionicons name="flash" size={18} color={colors.accentRed} />
          </View>
          <Text className="text-sm flex-1" style={{ color: colors.textSecondary }}>
            Nota rápida...
          </Text>
          <Ionicons name="create-outline" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      ) : (
        <View>
          <TextInput
            className="rounded-xl px-4 py-3 text-sm border mb-2 min-h-[70px]"
            style={{
              backgroundColor: colors.bgCard,
              color: colors.textPrimary,
              borderColor: colors.borderDefault,
            }}
            placeholder="Escribe tu nota rápida aquí..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
            autoFocus
            maxLength={500}
          />
          <View className="flex-row justify-end">
            <TouchableOpacity
              className="mr-2 px-4 py-2 rounded-lg"
              onPress={() => {
                setShowInput(false);
                setContent("");
              }}
            >
              <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-4 py-2 rounded-lg"
              style={{
                backgroundColor: content.trim()
                  ? colors.accentRed
                  : colors.bgSecondary,
                opacity: content.trim() ? 1 : 0.5,
              }}
              onPress={handleSubmit}
              disabled={!content.trim()}
            >
              <Text className="text-xs font-semibold" style={{ color: colors.textInverted }}>
                Guardar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
