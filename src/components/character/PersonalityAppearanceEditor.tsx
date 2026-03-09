/**
 * PersonalityAppearanceEditor — Modal para editar personalidad y apariencia
 * desde la hoja de personaje.
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks";
import { withAlpha, type ThemeColors } from "@/utils/theme";
import type { Personality, Appearance, Alignment } from "@/types/character";
import { ALIGNMENT_NAMES } from "@/types/character";

// ─── Types ───────────────────────────────────────────────────────────

type EditorTab = "personality" | "appearance";

interface Props {
  visible: boolean;
  onClose: () => void;
  personality: Personality;
  appearance: Appearance;
  alignment?: Alignment;
  nombre: string;
  onSavePersonality: (p: Personality) => Promise<void>;
  onSaveAppearance: (a: Appearance) => Promise<void>;
  onSaveAlignment: (a: Alignment) => Promise<void>;
  onSaveName: (n: string) => Promise<void>;
  initialTab?: EditorTab;
}

// ─── Constants ───────────────────────────────────────────────────────

const ALIGNMENT_KEYS: Alignment[] = [
  "legal_bueno",
  "neutral_bueno",
  "caotico_bueno",
  "legal_neutral",
  "neutral",
  "caotico_neutral",
  "legal_malvado",
  "neutral_malvado",
  "caotico_malvado",
];

function getAlignmentColors(colors: ThemeColors): Record<string, string> {
  return {
    legal_bueno: colors.accentBlue,
    neutral_bueno: colors.accentGreen,
    caotico_bueno: colors.accentAmber,
    legal_neutral: colors.accentIndigo,
    neutral: colors.textMuted,
    caotico_neutral: colors.accentOrange,
    legal_malvado: colors.accentPurple,
    neutral_malvado: colors.accentDanger,
    caotico_malvado: colors.accentDanger,
  };
}

// ─── Component ───────────────────────────────────────────────────────

export default function PersonalityAppearanceEditor({
  visible,
  onClose,
  personality,
  appearance,
  alignment,
  nombre,
  onSavePersonality,
  onSaveAppearance,
  onSaveAlignment,
  onSaveName,
  initialTab = "personality",
}: Props) {
  const { colors } = useTheme();
  const alignmentColors = useMemo(() => getAlignmentColors(colors), [colors]);

  const [tab, setTab] = useState<EditorTab>(initialTab);
  const [saving, setSaving] = useState(false);

  // ── Personality fields
  const [traits, setTraits] = useState<string[]>([]);
  const [ideals, setIdeals] = useState("");
  const [bonds, setBonds] = useState("");
  const [flaws, setFlaws] = useState("");
  const [backstory, setBackstory] = useState("");
  const [selectedAlignment, setSelectedAlignment] = useState<Alignment | undefined>(alignment);
  const [editName, setEditName] = useState(nombre);

  // ── Appearance fields
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [eyeColor, setEyeColor] = useState("");
  const [hairColor, setHairColor] = useState("");
  const [skinColor, setSkinColor] = useState("");
  const [description, setDescription] = useState("");

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setTab(initialTab);
      // Personality
      setTraits(personality.traits.length > 0 ? [...personality.traits] : [""]);
      setIdeals(personality.ideals);
      setBonds(personality.bonds);
      setFlaws(personality.flaws);
      setBackstory(personality.backstory ?? "");
      setSelectedAlignment(alignment);
      setEditName(nombre);
      // Appearance
      setAge(appearance.age ?? "");
      setHeight(appearance.height ?? "");
      setWeight(appearance.weight ?? "");
      setEyeColor(appearance.eyeColor ?? "");
      setHairColor(appearance.hairColor ?? "");
      setSkinColor(appearance.skinColor ?? "");
      setDescription(appearance.description ?? "");
    }
  }, [visible]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (tab === "personality") {
        const p: Personality = {
          traits: traits.map((t) => t.trim()).filter(Boolean),
          ideals: ideals.trim(),
          bonds: bonds.trim(),
          flaws: flaws.trim(),
          backstory: backstory.trim() || undefined,
        };
        await onSavePersonality(p);
        if (selectedAlignment && selectedAlignment !== alignment) {
          await onSaveAlignment(selectedAlignment);
        }
        const trimmedName = editName.trim();
        if (trimmedName && trimmedName !== nombre) {
          await onSaveName(trimmedName);
        }
      } else {
        const a: Appearance = {
          age: age.trim() || undefined,
          height: height.trim() || undefined,
          weight: weight.trim() || undefined,
          eyeColor: eyeColor.trim() || undefined,
          hairColor: hairColor.trim() || undefined,
          skinColor: skinColor.trim() || undefined,
          description: description.trim() || undefined,
          avatarUri: appearance.avatarUri, // preserve existing
        };
        await onSaveAppearance(a);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const addTrait = () => setTraits([...traits, ""]);
  const removeTrait = (index: number) => {
    if (traits.length <= 1) return;
    setTraits(traits.filter((_, i) => i !== index));
  };
  const updateTrait = (index: number, value: string) => {
    const updated = [...traits];
    updated[index] = value;
    setTraits(updated);
  };

  // ── Render helpers ──

  const renderTextField = (
    label: string,
    value: string,
    onChangeText: (v: string) => void,
    options?: { multiline?: boolean; placeholder?: string; lines?: number },
  ) => (
    <View className="mb-4">
      <Text
        className="text-xs font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: colors.accentGold }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={options?.placeholder ?? `Escribe aquí...`}
        placeholderTextColor={colors.textMuted}
        multiline={options?.multiline ?? false}
        numberOfLines={options?.lines ?? 1}
        textAlignVertical={options?.multiline ? "top" : "center"}
        style={{
          color: colors.textPrimary,
          backgroundColor: colors.bgCard,
          borderColor: colors.borderDefault,
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
          fontSize: 14,
          minHeight: options?.multiline ? (options.lines ?? 3) * 22 : undefined,
        }}
      />
    </View>
  );

  const renderPersonalityTab = () => (
    <View>
      {/* Nombre */}
      {renderTextField("Nombre del Personaje", editName, setEditName, {
        placeholder: "Nombre de tu personaje",
      })}

      {/* Alineamiento */}
      <View className="mb-4">
        <Text
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: colors.accentGold }}
        >
          Alineamiento
        </Text>
        <View className="flex-row flex-wrap" style={{ gap: 6 }}>
          {ALIGNMENT_KEYS.map((al) => {
            const isSelected = al === selectedAlignment;
            const alColor = alignmentColors[al] ?? colors.textMuted;
            return (
              <TouchableOpacity
                key={al}
                onPress={() => setSelectedAlignment(al)}
                className="rounded-lg px-2.5 py-1.5"
                style={{
                  backgroundColor: isSelected
                    ? withAlpha(alColor, 0.2)
                    : colors.chipBg,
                  borderWidth: 1,
                  borderColor: isSelected ? alColor : colors.chipBorder,
                }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: isSelected ? alColor : colors.textSecondary }}
                >
                  {ALIGNMENT_NAMES[al]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Rasgos de personalidad */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-1.5">
          <Text
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: colors.accentGold }}
          >
            Rasgos de Personalidad
          </Text>
          <TouchableOpacity onPress={addTrait} hitSlop={8}>
            <Ionicons name="add-circle-outline" size={20} color={colors.accentGreen} />
          </TouchableOpacity>
        </View>
        {traits.map((trait, idx) => (
          <View key={idx} className="flex-row items-center mb-2">
            <TextInput
              value={trait}
              onChangeText={(v) => updateTrait(idx, v)}
              placeholder={`Rasgo ${idx + 1}...`}
              placeholderTextColor={colors.textMuted}
              multiline
              style={{
                flex: 1,
                color: colors.textPrimary,
                backgroundColor: colors.bgCard,
                borderColor: colors.borderDefault,
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
                fontSize: 14,
                minHeight: 44,
              }}
            />
            {traits.length > 1 && (
              <TouchableOpacity
                onPress={() => removeTrait(idx)}
                hitSlop={8}
                className="ml-2"
              >
                <Ionicons name="close-circle" size={20} color={colors.accentDanger} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {renderTextField("Ideales", ideals, setIdeals, {
        multiline: true,
        placeholder: "Describe los ideales de tu personaje...",
        lines: 2,
      })}
      {renderTextField("Vínculos", bonds, setBonds, {
        multiline: true,
        placeholder: "Describe los vínculos de tu personaje...",
        lines: 2,
      })}
      {renderTextField("Defectos", flaws, setFlaws, {
        multiline: true,
        placeholder: "Describe los defectos de tu personaje...",
        lines: 2,
      })}
      {renderTextField("Historia / Trasfondo", backstory, setBackstory, {
        multiline: true,
        placeholder: "Cuenta la historia de tu personaje...",
        lines: 4,
      })}
    </View>
  );

  const renderAppearanceTab = () => (
    <View>
      <View className="flex-row" style={{ gap: 12 }}>
        <View className="flex-1">
          {renderTextField("Edad", age, setAge, { placeholder: "Ej: 25 años" })}
        </View>
        <View className="flex-1">
          {renderTextField("Altura", height, setHeight, { placeholder: "Ej: 1.75 m" })}
        </View>
      </View>
      <View className="flex-row" style={{ gap: 12 }}>
        <View className="flex-1">
          {renderTextField("Peso", weight, setWeight, { placeholder: "Ej: 70 kg" })}
        </View>
        <View className="flex-1">
          {renderTextField("Color de Ojos", eyeColor, setEyeColor, { placeholder: "Ej: Marrón" })}
        </View>
      </View>
      <View className="flex-row" style={{ gap: 12 }}>
        <View className="flex-1">
          {renderTextField("Color de Pelo", hairColor, setHairColor, { placeholder: "Ej: Negro" })}
        </View>
        <View className="flex-1">
          {renderTextField("Color de Piel", skinColor, setSkinColor, { placeholder: "Ej: Morena" })}
        </View>
      </View>
      {renderTextField("Descripción Física", description, setDescription, {
        multiline: true,
        placeholder: "Describe la apariencia de tu personaje en detalle...",
        lines: 5,
      })}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1" style={{ backgroundColor: colors.backdrop }}>
          <View
            className="flex-1 mt-12 rounded-t-3xl overflow-hidden"
            style={{ backgroundColor: colors.bgPrimary }}
          >
            {/* Header */}
            <LinearGradient
              colors={[
                withAlpha(colors.accentGold, 0.15),
                "transparent",
              ]}
              className="px-5 pt-5 pb-3"
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.textPrimary }}
                >
                  Editar Personaje
                </Text>
                <TouchableOpacity onPress={onClose} hitSlop={12}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Tab bar */}
              <View
                className="flex-row rounded-xl p-1"
                style={{ backgroundColor: colors.bgSecondary }}
              >
                {(
                  [
                    { key: "personality", label: "Personalidad", icon: "heart" },
                    { key: "appearance", label: "Apariencia", icon: "person" },
                  ] as const
                ).map((t) => {
                  const active = tab === t.key;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      onPress={() => setTab(t.key)}
                      className="flex-1 flex-row items-center justify-center rounded-lg py-2"
                      style={
                        active
                          ? { backgroundColor: colors.bgCard }
                          : undefined
                      }
                    >
                      <Ionicons
                        name={t.icon as any}
                        size={16}
                        color={active ? colors.accentGold : colors.textMuted}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        className="text-sm font-semibold"
                        style={{
                          color: active ? colors.textPrimary : colors.textMuted,
                        }}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </LinearGradient>

            {/* Content */}
            <ScrollView
              className="flex-1 px-5"
              contentContainerStyle={{ paddingBottom: 100 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {tab === "personality"
                ? renderPersonalityTab()
                : renderAppearanceTab()}
            </ScrollView>

            {/* Save button */}
            <View
              className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-3"
              style={{ backgroundColor: colors.bgPrimary }}
            >
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="rounded-xl py-3.5 items-center"
                style={{
                  backgroundColor: saving
                    ? colors.textMuted
                    : colors.accentGold,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <Text className="font-bold text-base" style={{ color: colors.textInverted }}>
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
