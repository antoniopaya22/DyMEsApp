/**
 * CustomRaceEditor — Form to configure a custom race during character creation.
 * Allows setting ability bonuses, traits, languages, proficiencies, spells, etc.
 */

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks";
import { withAlpha } from "@/utils/theme";
import { useUnidadesActuales } from "@/stores/settingsStore";
import { formatDistancia, etiquetaDistancia } from "@/utils/units";
import type { AbilityKey, SkillKey, DamageType, Size } from "@/types/character";
import { ABILITY_NAMES, SKILLS } from "@/types/character";
import { ABILITY_KEYS } from "@/constants/abilities";
import type {
  CustomRaceConfig,
  CustomRaceTrait,
  CustomRacialSpell,
} from "@/types/creation";

// ─── Constants ───────────────────────────────────────────────────────

const SIZE_OPTIONS: { value: Size; label: string }[] = [
  { value: "diminuto", label: "Diminuto" },
  { value: "pequeno", label: "Pequeño" },
  { value: "mediano", label: "Mediano" },
  { value: "grande", label: "Grande" },
];

const DAMAGE_TYPE_OPTIONS: { value: DamageType; label: string }[] = [
  { value: "acido", label: "Ácido" },
  { value: "contundente", label: "Contundente" },
  { value: "cortante", label: "Cortante" },
  { value: "frio", label: "Frío" },
  { value: "fuego", label: "Fuego" },
  { value: "fuerza", label: "Fuerza" },
  { value: "necrotico", label: "Necrótico" },
  { value: "perforante", label: "Perforante" },
  { value: "psiquico", label: "Psíquico" },
  { value: "radiante", label: "Radiante" },
  { value: "relampago", label: "Relámpago" },
  { value: "trueno", label: "Trueno" },
  { value: "veneno", label: "Veneno" },
];

const SKILL_OPTIONS: { value: SkillKey; label: string }[] = (
  Object.entries(SKILLS) as [SkillKey, { nombre: string }][]
).map(([key, def]) => ({ value: key, label: def.nombre }));

const DEFAULT_CONFIG: CustomRaceConfig = {
  nombre: "",
  descripcion: "",
  abilityBonuses: {},
  size: "mediano",
  speed: 30,
  darkvision: false,
  traits: [],
  languages: ["Común"],
};

// ─── Component ───────────────────────────────────────────────────────

interface CustomRaceEditorProps {
  initialData?: CustomRaceConfig;
  onChange: (data: CustomRaceConfig) => void;
}

export default function CustomRaceEditor({
  initialData,
  onChange,
}: CustomRaceEditorProps) {
  const { colors } = useTheme();
  const unidades = useUnidadesActuales();
  const [data, setData] = useState<CustomRaceConfig>(
    initialData ?? { ...DEFAULT_CONFIG },
  );

  // Sections collapsed state
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    basic: true,
    abilities: true,
    traits: false,
    languages: false,
    proficiencies: false,
    spells: false,
  });

  const update = (partial: Partial<CustomRaceConfig>) => {
    const next = { ...data, ...partial };
    setData(next);
    onChange(next);
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ── Ability Bonuses ──

  const setAbilityBonus = (key: AbilityKey, delta: number) => {
    const current = data.abilityBonuses[key] ?? 0;
    const next = current + delta;
    if (next < -2 || next > 3) return;
    const bonuses = { ...data.abilityBonuses };
    if (next === 0) {
      delete bonuses[key];
    } else {
      bonuses[key] = next;
    }
    update({ abilityBonuses: bonuses });
  };

  // ── Traits ──

  const addTrait = () => {
    update({ traits: [...data.traits, { nombre: "", descripcion: "" }] });
  };

  const updateTrait = (
    index: number,
    field: keyof CustomRaceTrait,
    value: string,
  ) => {
    const traits = [...data.traits];
    traits[index] = { ...traits[index], [field]: value };
    update({ traits });
  };

  const removeTrait = (index: number) => {
    update({ traits: data.traits.filter((_, i) => i !== index) });
  };

  // ── Languages ──

  const [newLang, setNewLang] = useState("");

  const addLanguage = () => {
    const lang = newLang.trim();
    if (!lang || data.languages.includes(lang)) return;
    update({ languages: [...data.languages, lang] });
    setNewLang("");
  };

  const removeLanguage = (lang: string) => {
    update({ languages: data.languages.filter((l) => l !== lang) });
  };

  // ── Proficiencies (free text) ──

  const [newWeaponProf, setNewWeaponProf] = useState("");
  const [newArmorProf, setNewArmorProf] = useState("");
  const [newToolProf, setNewToolProf] = useState("");

  const addToList = (
    field: "weaponProficiencies" | "armorProficiencies" | "toolProficiencies",
    value: string,
    setter: (v: string) => void,
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const list = data[field] ?? [];
    if (list.includes(trimmed)) return;
    update({ [field]: [...list, trimmed] });
    setter("");
  };

  const removeFromList = (
    field: "weaponProficiencies" | "armorProficiencies" | "toolProficiencies",
    value: string,
  ) => {
    update({ [field]: (data[field] ?? []).filter((v) => v !== value) });
  };

  // ── Skill proficiencies (toggle) ──

  const toggleSkill = (skill: SkillKey) => {
    const current = data.skillProficiencies ?? [];
    if (current.includes(skill)) {
      update({
        skillProficiencies: current.filter((s) => s !== skill),
      });
    } else {
      update({ skillProficiencies: [...current, skill] });
    }
  };

  // ── Damage resistances (toggle) ──

  const toggleResistance = (type: DamageType) => {
    const current = data.damageResistances ?? [];
    if (current.includes(type)) {
      update({
        damageResistances: current.filter((t) => t !== type),
      });
    } else {
      update({ damageResistances: [...current, type] });
    }
  };

  // ── Racial Spells ──

  const addSpell = () => {
    const spells = data.racialSpells ?? [];
    update({
      racialSpells: [...spells, { nombre: "", minLevel: 1, isCantrip: false }],
    });
  };

  const updateSpell = (index: number, partial: Partial<CustomRacialSpell>) => {
    const spells = [...(data.racialSpells ?? [])];
    spells[index] = { ...spells[index], ...partial };
    update({ racialSpells: spells });
  };

  const removeSpell = (index: number) => {
    update({
      racialSpells: (data.racialSpells ?? []).filter((_, i) => i !== index),
    });
  };

  // ── Render helpers ──

  const SectionHeader = ({
    sectionKey,
    title,
    icon,
    count,
  }: {
    sectionKey: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    count?: number;
  }) => (
    <TouchableOpacity
      className="flex-row items-center justify-between py-3 mb-1"
      onPress={() => toggleSection(sectionKey)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        <Ionicons
          name={icon}
          size={18}
          color={colors.accentRed}
          style={{ marginRight: 8 }}
        />
        <Text
          className="text-base font-bold"
          style={{ color: colors.textPrimary }}
        >
          {title}
        </Text>
        {count !== undefined && count > 0 && (
          <View
            className="rounded-full px-2 py-0.5 ml-2"
            style={{ backgroundColor: withAlpha(colors.accentRed, 0.2) }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: colors.accentRed }}
            >
              {count}
            </Text>
          </View>
        )}
      </View>
      <Ionicons
        name={expandedSections[sectionKey] ? "chevron-up" : "chevron-down"}
        size={18}
        color={colors.textMuted}
      />
    </TouchableOpacity>
  );

  const ChipList = ({
    items,
    onRemove,
  }: {
    items: string[];
    onRemove: (item: string) => void;
  }) => (
    <View className="flex-row flex-wrap mt-1">
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          className="flex-row items-center border rounded-full px-3 py-1.5 mr-2 mb-2 active:opacity-70"
          onPress={() => onRemove(item)}
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.borderDefault,
          }}
        >
          <Text className="text-sm mr-1" style={{ color: colors.textPrimary }}>
            {item}
          </Text>
          <Ionicons name="close-circle" size={14} color={colors.textMuted} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const AddRow = ({
    value,
    onChangeText,
    onAdd,
    placeholder,
  }: {
    value: string;
    onChangeText: (t: string) => void;
    onAdd: () => void;
    placeholder: string;
  }) => (
    <View className="flex-row items-center mt-1 mb-2">
      <TextInput
        className="flex-1 border rounded-xl px-3 py-2.5 text-sm mr-2"
        style={{
          backgroundColor: colors.bgInput,
          borderColor: colors.borderDefault,
          color: colors.textPrimary,
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onSubmitEditing={onAdd}
        returnKeyType="done"
      />
      <TouchableOpacity
        className="h-10 w-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: withAlpha(colors.accentRed, 0.15) }}
        onPress={onAdd}
      >
        <Ionicons name="add" size={20} color={colors.accentRed} />
      </TouchableOpacity>
    </View>
  );

  const formatBonus = (v: number) => (v > 0 ? `+${v}` : `${v}`);

  // ── Main Render ──

  return (
    <View>
      {/* ── Básico ── */}
      <SectionHeader
        sectionKey="basic"
        title="Datos Básicos"
        icon="create-outline"
      />
      {expandedSections.basic && (
        <View className="mb-4">
          {/* Nombre */}
          <Text
            className="text-xs font-semibold mb-1 uppercase tracking-wider"
            style={{ color: colors.textSecondary }}
          >
            Nombre de la raza <Text style={{ color: colors.accentRed }}>*</Text>
          </Text>
          <TextInput
            className="border rounded-xl px-4 py-3 text-base mb-3"
            style={{
              backgroundColor: colors.bgInput,
              borderColor: colors.borderDefault,
              color: colors.textPrimary,
            }}
            value={data.nombre}
            onChangeText={(t) => update({ nombre: t })}
            placeholder="Ej: Aarakocra, Aasimar..."
            placeholderTextColor={colors.textMuted}
          />

          {/* Descripcion */}
          <Text
            className="text-xs font-semibold mb-1 uppercase tracking-wider"
            style={{ color: colors.textSecondary }}
          >
            Descripción
          </Text>
          <TextInput
            className="border rounded-xl px-4 py-3 text-sm mb-3"
            style={{
              minHeight: 70,
              backgroundColor: colors.bgInput,
              borderColor: colors.borderDefault,
              color: colors.textPrimary,
            }}
            value={data.descripcion}
            onChangeText={(t) => update({ descripcion: t })}
            placeholder="Breve descripción de la raza..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Size */}
          <Text
            className="text-xs font-semibold mb-2 uppercase tracking-wider"
            style={{ color: colors.textSecondary }}
          >
            Tamaño
          </Text>
          <View className="flex-row mb-3">
            {SIZE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                className="flex-1 rounded-xl py-2.5 items-center mr-2 border"
                onPress={() => update({ size: opt.value })}
                style={{
                  backgroundColor:
                    data.size === opt.value
                      ? withAlpha(colors.accentRed, 0.15)
                      : colors.bgCard,
                  borderColor:
                    data.size === opt.value
                      ? withAlpha(colors.accentRed, 0.5)
                      : colors.borderDefault,
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color:
                      data.size === opt.value
                        ? colors.accentRed
                        : colors.textSecondary,
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Speed */}
          <Text
            className="text-xs font-semibold mb-1 uppercase tracking-wider"
            style={{ color: colors.textSecondary }}
          >
            {`Velocidad base (${etiquetaDistancia(unidades)})`}
          </Text>
          <View className="flex-row items-center mb-3">
            <TouchableOpacity
              className="h-10 w-10 rounded-xl items-center justify-center"
              onPress={() => update({ speed: Math.max(5, data.speed - 5) })}
              style={{ backgroundColor: colors.bgSecondary }}
            >
              <Ionicons name="remove" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text
              className="text-lg font-bold mx-4 min-w-[50px] text-center"
              style={{ color: colors.textPrimary }}
            >
              {data.speed}
            </Text>
            <TouchableOpacity
              className="h-10 w-10 rounded-xl items-center justify-center"
              onPress={() => update({ speed: Math.min(60, data.speed + 5) })}
              style={{ backgroundColor: colors.bgSecondary }}
            >
              <Ionicons name="add" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text className="text-sm ml-3" style={{ color: colors.textMuted }}>
              ({formatDistancia(data.speed, unidades)})
            </Text>
          </View>

          {/* Optional speeds: fly, swim, climb */}
          {[
            { key: "flySpeed" as const, label: "Vuelo", icon: "🪽" },
            { key: "swimSpeed" as const, label: "Nado", icon: "🏊" },
            { key: "climbSpeed" as const, label: "Trepar", icon: "🧗" },
          ].map(({ key, label, icon }) => {
            const value = data[key];
            const enabled = value !== undefined && value > 0;
            return (
              <View key={key} className="mb-2">
                <TouchableOpacity
                  className="flex-row items-center justify-between border rounded-xl px-4 py-2.5"
                  onPress={() => update({ [key]: enabled ? undefined : 30 })}
                  style={{
                    backgroundColor: colors.bgCard,
                    borderColor: colors.borderDefault,
                  }}
                >
                  <View className="flex-row items-center">
                    <Text className="text-base mr-2">{icon}</Text>
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: colors.textPrimary }}
                    >
                      Velocidad de {label}
                    </Text>
                  </View>
                  <View
                    className="h-6 w-6 rounded-md border-2 items-center justify-center"
                    style={{
                      backgroundColor: enabled
                        ? colors.accentRed
                        : "transparent",
                      borderColor: enabled
                        ? colors.accentRed
                        : colors.textMuted,
                    }}
                  >
                    {enabled && (
                      <Ionicons name="checkmark" size={14} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
                {enabled && (
                  <View className="flex-row items-center mt-1 ml-10">
                    <TouchableOpacity
                      className="h-8 w-8 rounded-lg items-center justify-center"
                      onPress={() =>
                        update({ [key]: Math.max(5, (value ?? 30) - 5) })
                      }
                      style={{ backgroundColor: colors.bgSecondary }}
                    >
                      <Ionicons
                        name="remove"
                        size={16}
                        color={colors.textPrimary}
                      />
                    </TouchableOpacity>
                    <Text
                      className="text-sm font-bold mx-3 min-w-[40px] text-center"
                      style={{ color: colors.textPrimary }}
                    >
                      {value}
                    </Text>
                    <TouchableOpacity
                      className="h-8 w-8 rounded-lg items-center justify-center"
                      onPress={() =>
                        update({ [key]: Math.min(120, (value ?? 30) + 5) })
                      }
                      style={{ backgroundColor: colors.bgSecondary }}
                    >
                      <Ionicons
                        name="add"
                        size={16}
                        color={colors.textPrimary}
                      />
                    </TouchableOpacity>
                    <Text
                      className="text-xs ml-2"
                      style={{ color: colors.textMuted }}
                    >
                      ({formatDistancia(value ?? 30, unidades)})
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
          <View className="h-1" />

          {/* Darkvision */}
          <TouchableOpacity
            className="flex-row items-center justify-between border rounded-xl px-4 py-3 mb-3"
            onPress={() =>
              update({
                darkvision: !data.darkvision,
                darkvisionRange: !data.darkvision ? 60 : undefined,
              })
            }
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.borderDefault,
            }}
          >
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">👁️</Text>
              <Text
                className="text-sm font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Visión en la Oscuridad
              </Text>
            </View>
            <View
              className="h-6 w-6 rounded-md border-2 items-center justify-center"
              style={{
                backgroundColor: data.darkvision
                  ? colors.accentRed
                  : "transparent",
                borderColor: data.darkvision
                  ? colors.accentRed
                  : colors.textMuted,
              }}
            >
              {data.darkvision && (
                <Ionicons name="checkmark" size={14} color="white" />
              )}
            </View>
          </TouchableOpacity>

          {data.darkvision && (
            <View className="flex-row items-center mb-3 pl-4">
              <Text
                className="text-sm mr-3"
                style={{ color: colors.textSecondary }}
              >
                Alcance:
              </Text>
              <TouchableOpacity
                className="h-8 w-8 rounded-lg items-center justify-center"
                onPress={() =>
                  update({
                    darkvisionRange: Math.max(
                      30,
                      (data.darkvisionRange ?? 60) - 30,
                    ),
                  })
                }
                style={{ backgroundColor: colors.bgSecondary }}
              >
                <Ionicons name="remove" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text
                className="text-sm font-bold mx-3"
                style={{ color: colors.textPrimary }}
              >
                {formatDistancia(data.darkvisionRange ?? 60, unidades)}
              </Text>
              <TouchableOpacity
                className="h-8 w-8 rounded-lg items-center justify-center"
                onPress={() =>
                  update({
                    darkvisionRange: Math.min(
                      120,
                      (data.darkvisionRange ?? 60) + 30,
                    ),
                  })
                }
                style={{ backgroundColor: colors.bgSecondary }}
              >
                <Ionicons name="add" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ── Bonificadores de Característica ── */}
      <SectionHeader
        sectionKey="abilities"
        title="Bonificadores"
        icon="stats-chart-outline"
        count={Object.keys(data.abilityBonuses).length}
      />
      {expandedSections.abilities && (
        <View className="mb-4">
          <Text
            className="text-xs mb-3"
            style={{ color: colors.textMuted }}
          ></Text>
          {ABILITY_KEYS.map((key) => {
            const val = data.abilityBonuses[key] ?? 0;
            return (
              <View
                key={key}
                className="flex-row items-center justify-between border rounded-xl px-4 py-2.5 mb-2"
                style={{
                  backgroundColor: colors.bgCard,
                  borderColor: colors.borderDefault,
                }}
              >
                <Text
                  className="text-sm font-semibold w-28"
                  style={{ color: colors.textPrimary }}
                >
                  {ABILITY_NAMES[key]}
                </Text>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    className={`h-8 w-8 rounded-lg items-center justify-center ${
                      val <= -2 ? "opacity-30" : ""
                    }`}
                    onPress={() => setAbilityBonus(key, -1)}
                    disabled={val <= -2}
                    style={{
                      backgroundColor:
                        val <= -2 ? colors.bgInput : colors.bgSecondary,
                    }}
                  >
                    <Ionicons
                      name="remove"
                      size={16}
                      color={colors.textPrimary}
                    />
                  </TouchableOpacity>
                  <Text
                    className={`text-base font-bold mx-3 min-w-[35px] text-center ${
                      val > 0
                        ? "text-hp-full"
                        : val < 0
                          ? "text-hp-critical"
                          : ""
                    }`}
                    style={val === 0 ? { color: colors.textMuted } : undefined}
                  >
                    {formatBonus(val)}
                  </Text>
                  <TouchableOpacity
                    className={`h-8 w-8 rounded-lg items-center justify-center ${
                      val >= 3 ? "opacity-30" : ""
                    }`}
                    onPress={() => setAbilityBonus(key, 1)}
                    disabled={val >= 3}
                    style={{
                      backgroundColor:
                        val >= 3 ? colors.bgInput : colors.bgSecondary,
                    }}
                  >
                    <Ionicons name="add" size={16} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* ── Rasgos ── */}
      <SectionHeader
        sectionKey="traits"
        title="Rasgos Raciales"
        icon="book-outline"
        count={data.traits.length}
      />
      {expandedSections.traits && (
        <View className="mb-4">
          {data.traits.map((trait, idx) => (
            <View
              key={idx}
              className="border rounded-xl p-3 mb-2"
              style={{
                backgroundColor: colors.bgCard,
                borderColor: colors.borderDefault,
              }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text
                  className="text-xs font-semibold"
                  style={{ color: colors.textMuted }}
                >
                  Rasgo #{idx + 1}
                </Text>
                <TouchableOpacity
                  onPress={() => removeTrait(idx)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={colors.accentDanger}
                  />
                </TouchableOpacity>
              </View>
              <TextInput
                className="border rounded-lg px-3 py-2 text-sm mb-2"
                style={{
                  backgroundColor: colors.bgInput,
                  borderColor: colors.borderDefault,
                  color: colors.textPrimary,
                }}
                value={trait.nombre}
                onChangeText={(t) => updateTrait(idx, "nombre", t)}
                placeholder="Nombre del rasgo"
                placeholderTextColor={colors.textMuted}
              />
              <TextInput
                className="border rounded-lg px-3 py-2 text-sm"
                style={{
                  minHeight: 50,
                  backgroundColor: colors.bgInput,
                  borderColor: colors.borderDefault,
                  color: colors.textPrimary,
                }}
                value={trait.descripcion}
                onChangeText={(t) => updateTrait(idx, "descripcion", t)}
                placeholder="Descripción del rasgo..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
          ))}
          <TouchableOpacity
            className="flex-row items-center justify-center py-3 rounded-xl border border-dashed"
            onPress={addTrait}
            style={{ borderColor: colors.borderDefault }}
          >
            <Ionicons name="add" size={18} color={colors.accentRed} />
            <Text
              className="text-sm font-semibold ml-1"
              style={{ color: colors.accentRed }}
            >
              Añadir rasgo
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Idiomas ── */}
      <SectionHeader
        sectionKey="languages"
        title="Idiomas y Resistencias"
        icon="language-outline"
        count={data.languages.length + (data.damageResistances?.length ?? 0)}
      />
      {expandedSections.languages && (
        <View className="mb-4">
          <Text
            className="text-xs font-semibold mb-1 uppercase tracking-wider"
            style={{ color: colors.textSecondary }}
          >
            Idiomas
          </Text>
          <ChipList items={data.languages} onRemove={removeLanguage} />
          <AddRow
            value={newLang}
            onChangeText={setNewLang}
            onAdd={addLanguage}
            placeholder="Añadir idioma..."
          />

          {/* Damage Resistances */}
          <Text
            className="text-xs font-semibold mb-2 mt-2 uppercase tracking-wider"
            style={{ color: colors.textSecondary }}
          >
            Resistencias a daño
          </Text>
          <View className="flex-row flex-wrap">
            {DAMAGE_TYPE_OPTIONS.map((opt) => {
              const active = (data.damageResistances ?? []).includes(opt.value);
              return (
                <TouchableOpacity
                  key={opt.value}
                  className="rounded-full px-3 py-1.5 mr-2 mb-2 border"
                  onPress={() => toggleResistance(opt.value)}
                  style={{
                    backgroundColor: active
                      ? withAlpha(colors.accentRed, 0.15)
                      : colors.bgCard,
                    borderColor: active
                      ? withAlpha(colors.accentRed, 0.5)
                      : colors.borderDefault,
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{
                      color: active ? colors.accentRed : colors.textSecondary,
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* ── Competencias ── */}
      <SectionHeader
        sectionKey="proficiencies"
        title="Competencias"
        icon="shield-outline"
        count={
          (data.weaponProficiencies?.length ?? 0) +
          (data.armorProficiencies?.length ?? 0) +
          (data.toolProficiencies?.length ?? 0) +
          (data.skillProficiencies?.length ?? 0)
        }
      />
      {expandedSections.proficiencies && (
        <View className="mb-4">
          {/* Weapon Proficiencies */}
          <Text
            className="text-xs font-semibold mb-1 uppercase tracking-wider"
            style={{ color: colors.textSecondary }}
          >
            Armas
          </Text>
          <ChipList
            items={data.weaponProficiencies ?? []}
            onRemove={(v) => removeFromList("weaponProficiencies", v)}
          />
          <AddRow
            value={newWeaponProf}
            onChangeText={setNewWeaponProf}
            onAdd={() =>
              addToList("weaponProficiencies", newWeaponProf, setNewWeaponProf)
            }
            placeholder="Ej: Espada larga, Arco largo..."
          />

          {/* Armor Proficiencies */}
          <Text
            className="text-xs font-semibold mb-1 mt-1 uppercase tracking-wider"
            style={{ color: colors.textSecondary }}
          >
            Armaduras
          </Text>
          <ChipList
            items={data.armorProficiencies ?? []}
            onRemove={(v) => removeFromList("armorProficiencies", v)}
          />
          <AddRow
            value={newArmorProf}
            onChangeText={setNewArmorProf}
            onAdd={() =>
              addToList("armorProficiencies", newArmorProf, setNewArmorProf)
            }
            placeholder="Ej: Ligera, Media..."
          />

          {/* Tool Proficiencies */}
          <Text
            className="text-xs font-semibold mb-1 mt-1 uppercase tracking-wider"
            style={{ color: colors.textSecondary }}
          >
            Herramientas
          </Text>
          <ChipList
            items={data.toolProficiencies ?? []}
            onRemove={(v) => removeFromList("toolProficiencies", v)}
          />
          <AddRow
            value={newToolProf}
            onChangeText={setNewToolProf}
            onAdd={() =>
              addToList("toolProficiencies", newToolProf, setNewToolProf)
            }
            placeholder="Ej: Herramientas de herrero..."
          />

          {/* Skill Proficiencies */}
          <Text
            className="text-xs font-semibold mb-2 mt-2 uppercase tracking-wider"
            style={{ color: colors.textSecondary }}
          >
            Habilidades
          </Text>
          <View className="flex-row flex-wrap">
            {SKILL_OPTIONS.map((opt) => {
              const active = (data.skillProficiencies ?? []).includes(
                opt.value,
              );
              return (
                <TouchableOpacity
                  key={opt.value}
                  className={`rounded-full px-3 py-1.5 mr-2 mb-2 border ${
                    active ? "bg-hp-full/10 border-hp-full/30" : ""
                  }`}
                  onPress={() => toggleSkill(opt.value)}
                  style={
                    !active
                      ? {
                          backgroundColor: colors.bgCard,
                          borderColor: colors.borderDefault,
                        }
                      : undefined
                  }
                >
                  <Text
                    className={`text-xs font-semibold ${
                      active ? "text-hp-full" : ""
                    }`}
                    style={
                      !active ? { color: colors.textSecondary } : undefined
                    }
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* ── Conjuros Innatos ── */}
      <SectionHeader
        sectionKey="spells"
        title="Conjuros Innatos"
        icon="sparkles-outline"
        count={data.racialSpells?.length ?? 0}
      />
      {expandedSections.spells && (
        <View className="mb-4">
          <Text className="text-xs mb-3" style={{ color: colors.textMuted }}>
            Conjuros que la raza otorga de forma innata (trucos y conjuros por
            nivel).
          </Text>
          {(data.racialSpells ?? []).map((spell, idx) => (
            <View
              key={idx}
              className="border rounded-xl p-3 mb-2"
              style={{
                backgroundColor: colors.bgCard,
                borderColor: colors.borderDefault,
              }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text
                  className="text-xs font-semibold"
                  style={{ color: colors.textMuted }}
                >
                  Conjuro #{idx + 1}
                </Text>
                <TouchableOpacity
                  onPress={() => removeSpell(idx)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={colors.accentDanger}
                  />
                </TouchableOpacity>
              </View>
              <TextInput
                className="border rounded-lg px-3 py-2 text-sm mb-2"
                style={{
                  backgroundColor: colors.bgInput,
                  borderColor: colors.borderDefault,
                  color: colors.textPrimary,
                }}
                value={spell.nombre}
                onChangeText={(t) => updateSpell(idx, { nombre: t })}
                placeholder="Nombre del conjuro"
                placeholderTextColor={colors.textMuted}
              />
              <View className="flex-row items-center">
                {/* Is cantrip toggle */}
                <TouchableOpacity
                  className="flex-row items-center rounded-full px-3 py-1.5 mr-3 border"
                  style={{
                    backgroundColor: spell.isCantrip
                      ? withAlpha(colors.accentGold, 0.15)
                      : colors.bgCard,
                    borderColor: spell.isCantrip
                      ? withAlpha(colors.accentGold, 0.5)
                      : colors.borderDefault,
                  }}
                  onPress={() =>
                    updateSpell(idx, {
                      isCantrip: !spell.isCantrip,
                      minLevel: !spell.isCantrip ? 1 : spell.minLevel,
                    })
                  }
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{
                      color: spell.isCantrip
                        ? colors.accentGold
                        : colors.textSecondary,
                    }}
                  >
                    Truco
                  </Text>
                </TouchableOpacity>

                {/* Min level (only if not cantrip) */}
                {!spell.isCantrip && (
                  <View className="flex-row items-center">
                    <Text
                      className="text-xs mr-2"
                      style={{ color: colors.textSecondary }}
                    >
                      Nivel mín:
                    </Text>
                    <TouchableOpacity
                      className="h-7 w-7 rounded-lg items-center justify-center"
                      onPress={() =>
                        updateSpell(idx, {
                          minLevel: Math.max(1, spell.minLevel - 1),
                        })
                      }
                      style={{ backgroundColor: colors.bgSecondary }}
                    >
                      <Ionicons
                        name="remove"
                        size={14}
                        color={colors.textPrimary}
                      />
                    </TouchableOpacity>
                    <Text
                      className="text-sm font-bold mx-2"
                      style={{ color: colors.textPrimary }}
                    >
                      {spell.minLevel}
                    </Text>
                    <TouchableOpacity
                      className="h-7 w-7 rounded-lg items-center justify-center"
                      onPress={() =>
                        updateSpell(idx, {
                          minLevel: Math.min(20, spell.minLevel + 1),
                        })
                      }
                      style={{ backgroundColor: colors.bgSecondary }}
                    >
                      <Ionicons
                        name="add"
                        size={14}
                        color={colors.textPrimary}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
          <TouchableOpacity
            className="flex-row items-center justify-center py-3 rounded-xl border border-dashed"
            onPress={addSpell}
            style={{ borderColor: colors.borderDefault }}
          >
            <Ionicons name="add" size={18} color={colors.accentRed} />
            <Text
              className="text-sm font-semibold ml-1"
              style={{ color: colors.accentRed }}
            >
              Añadir conjuro innato
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
