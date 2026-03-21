/**
 * ProficiencyEditor — Modal para editar competencias de armas, herramientas e idiomas
 * desde la hoja de personaje.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks';
import { withAlpha } from '@/utils/theme';
import type { Proficiencies } from '@/types/character';
import { AVAILABLE_LANGUAGES } from '@/data/srd/races';

// ─── Types ───────────────────────────────────────────────────────────

type ProficiencyCategory = 'weapons' | 'tools' | 'languages';

interface Props {
  visible: boolean;
  onClose: () => void;
  proficiencies: Proficiencies;
  onSave: (p: Proficiencies) => Promise<void>;
}

// ─── Suggestion lists ────────────────────────────────────────────────

const WEAPON_SUGGESTIONS = [
  'Armas sencillas',
  'Armas marciales',
  'Bastones',
  'Dagas',
  'Dardos',
  'Jabalinas',
  'Mazas',
  'Hoces',
  'Lanzas',
  'Clavas',
  'Cimitarras',
  'Hachas de mano',
  'Ballestas ligeras',
  'Ballestas de mano',
  'Arcos cortos',
  'Arcos largos',
  'Espadas cortas',
  'Espadas largas',
  'Estoques',
  'Hondas',
  'Martillos de guerra',
  'Hachas a dos manos',
];

const TOOL_SUGGESTIONS = [
  'Herramientas de ladrón',
  'Kit de herboristería',
  'Kit de disfraz',
  'Kit de falsificación',
  'Kit de navegante',
  'Kit de venenos',
  'Herramientas de alquimista',
  'Herramientas de calígrafo',
  'Herramientas de carpintero',
  'Herramientas de cartógrafo',
  'Herramientas de cervecero',
  'Herramientas de cocinero',
  'Herramientas de curtidor',
  'Herramientas de herrero',
  'Herramientas de joyero',
  'Herramientas de juegos',
  'Herramientas de pintor',
  'Herramientas de soplador de vidrio',
  'Herramientas de tejedor',
  'Herramientas de zapatero',
  'Herramientas de alfarero',
  'Herramientas de albañil',
  'Herramientas de tallista',
  'Laúd',
  'Flauta',
  'Lira',
  'Cuerno',
  'Viola',
  'Tambor',
  'Dulcémele',
  'Gaita',
  'Chirimía',
  'Zanfona',
];

const LANGUAGE_SUGGESTIONS = [
  ...AVAILABLE_LANGUAGES.standard,
  ...AVAILABLE_LANGUAGES.exotic,
];

const TABS: { key: ProficiencyCategory; label: string; icon: string }[] = [
  { key: 'weapons', label: 'Armas', icon: 'flash-outline' },
  { key: 'tools', label: 'Herramientas', icon: 'hammer-outline' },
  { key: 'languages', label: 'Idiomas', icon: 'chatbubbles-outline' },
];

function getSuggestions(category: ProficiencyCategory): string[] {
  switch (category) {
    case 'weapons':
      return WEAPON_SUGGESTIONS;
    case 'tools':
      return TOOL_SUGGESTIONS;
    case 'languages':
      return LANGUAGE_SUGGESTIONS;
  }
}

// ─── Component ───────────────────────────────────────────────────────

export default function ProficiencyEditor({ visible, onClose, proficiencies, onSave }: Props) {
  const { colors } = useTheme();

  const [tab, setTab] = useState<ProficiencyCategory>('weapons');
  const [saving, setSaving] = useState(false);
  const [weapons, setWeapons] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');

  useEffect(() => {
    if (visible) {
      setTab('weapons');
      setWeapons([...proficiencies.weapons]);
      setTools([...proficiencies.tools]);
      setLanguages([...proficiencies.languages]);
      setCustomInput('');
    }
  }, [visible]);

  const currentItems = tab === 'weapons' ? weapons : tab === 'tools' ? tools : languages;
  const setCurrentItems =
    tab === 'weapons' ? setWeapons : tab === 'tools' ? setTools : setLanguages;

  const suggestions = useMemo(() => {
    const all = getSuggestions(tab);
    return all.filter((s) => !currentItems.includes(s));
  }, [tab, currentItems]);

  const addItem = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed || currentItems.includes(trimmed)) return;
    setCurrentItems([...currentItems, trimmed]);
    setCustomInput('');
  };

  const removeItem = (item: string) => {
    setCurrentItems(currentItems.filter((i) => i !== item));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        armors: proficiencies.armors,
        weapons,
        tools,
        languages,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const renderCurrentItems = () => (
    <View className="mb-4">
      <Text
        className="text-xs font-semibold uppercase tracking-wider mb-2"
        style={{ color: colors.accentGold }}
      >
        Competencias actuales
      </Text>
      {currentItems.length === 0 ? (
        <Text className="text-sm italic" style={{ color: colors.textMuted }}>
          Sin competencias de este tipo
        </Text>
      ) : (
        <View className="flex-row flex-wrap" style={{ gap: 6 }}>
          {currentItems.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => removeItem(item)}
              className="flex-row items-center rounded-lg px-2.5 py-1.5 border"
              style={{
                backgroundColor: withAlpha(colors.accentGold, 0.1),
                borderColor: withAlpha(colors.accentGold, 0.3),
              }}
            >
              <Text className="text-xs font-medium mr-1.5" style={{ color: colors.textPrimary }}>
                {item}
              </Text>
              <Ionicons name="close-circle" size={14} color={colors.accentDanger} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderCustomInput = () => (
    <View className="mb-4">
      <Text
        className="text-xs font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: colors.accentGold }}
      >
        Añadir manualmente
      </Text>
      <View className="flex-row items-center" style={{ gap: 8 }}>
        <TextInput
          value={customInput}
          onChangeText={setCustomInput}
          placeholder="Escribe una competencia..."
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={() => addItem(customInput)}
          returnKeyType="done"
          style={{
            flex: 1,
            color: colors.textPrimary,
            backgroundColor: colors.bgCard,
            borderColor: colors.borderDefault,
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            fontSize: 14,
          }}
        />
        <TouchableOpacity
          onPress={() => addItem(customInput)}
          disabled={!customInput.trim()}
          className="rounded-xl p-3"
          style={{
            backgroundColor: customInput.trim() ? colors.accentGold : colors.bgSecondary,
          }}
        >
          <Ionicons
            name="add"
            size={20}
            color={customInput.trim() ? colors.textInverted : colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSuggestions = () => {
    if (suggestions.length === 0) return null;
    return (
      <View>
        <Text
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: colors.textSecondary }}
        >
          Sugerencias
        </Text>
        <View className="flex-row flex-wrap" style={{ gap: 6 }}>
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => addItem(item)}
              className="flex-row items-center rounded-lg px-2.5 py-1.5 border"
              style={{
                backgroundColor: colors.chipBg,
                borderColor: colors.chipBorder,
              }}
            >
              <Ionicons
                name="add-circle-outline"
                size={14}
                color={colors.accentGreen}
                style={{ marginRight: 4 }}
              />
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1" style={{ backgroundColor: colors.backdrop }}>
          <View
            className="flex-1 mt-12 rounded-t-3xl overflow-hidden"
            style={{ backgroundColor: colors.bgPrimary }}
          >
            {/* Header */}
            <LinearGradient
              colors={[withAlpha(colors.accentGold, 0.15), 'transparent']}
              className="px-5 pt-5 pb-3"
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                  Editar Competencias
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
                {TABS.map((t) => {
                  const active = tab === t.key;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      onPress={() => {
                        setTab(t.key);
                        setCustomInput('');
                      }}
                      className="flex-1 flex-row items-center justify-center rounded-lg py-2"
                      style={active ? { backgroundColor: colors.bgCard } : undefined}
                    >
                      <Ionicons
                        name={t.icon as any}
                        size={16}
                        color={active ? colors.accentGold : colors.textMuted}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        className="text-xs font-semibold"
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
              className="flex-1 px-5 pt-3"
              contentContainerStyle={{ paddingBottom: 100 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {renderCurrentItems()}
              {renderCustomInput()}
              {renderSuggestions()}
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
                  backgroundColor: saving ? colors.textMuted : colors.accentGold,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <Text className="font-bold text-base" style={{ color: colors.textInverted }}>
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
