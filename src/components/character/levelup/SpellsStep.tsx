import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks";
import { withAlpha } from "@/utils/theme";
import {
  getCantripsForClass,
  getSpellsForClassUpToLevel,
  getSpellById,
  type SrdSpell,
} from "@/data/srd/spells";
import { getSpellDescription } from "@/data/srd/spellDescriptions";
import { SPELL_LEVEL_NAMES, type SpellLevel } from "@/types/spell";
import { type Character, type ClassId } from "@/types/character";
import { SPELLS_KNOWN } from "@/constants/spells";
import type { LevelUpSummary } from "@/data/srd/leveling";
import { useUnidadesActuales } from "@/stores/settingsStore";
import { formatAlcanceRaw } from "@/utils/spells";

interface SpellsStepProps {
  summary: LevelUpSummary;
  character: Character;
  newLevel: number;
  newCantrips: string[];
  setNewCantrips: React.Dispatch<React.SetStateAction<string[]>>;
  newSpells: string[];
  setNewSpells: React.Dispatch<React.SetStateAction<string[]>>;
  newSpellbook: string[];
  setNewSpellbook: React.Dispatch<React.SetStateAction<string[]>>;
  swapOldSpell: string;
  setSwapOldSpell: React.Dispatch<React.SetStateAction<string>>;
  swapNewSpell: string;
  setSwapNewSpell: React.Dispatch<React.SetStateAction<string>>;
  wantsToSwap: boolean;
  setWantsToSwap: React.Dispatch<React.SetStateAction<boolean>>;
  spellSearch: string;
  setSpellSearch: React.Dispatch<React.SetStateAction<string>>;
  customCantripName: string;
  setCustomCantripName: React.Dispatch<React.SetStateAction<string>>;
  customSpellName: string;
  setCustomSpellName: React.Dispatch<React.SetStateAction<string>>;
  expandedSpellIds: Set<string>;
  setExpandedSpellIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  getMagicState: () => any;
}

export default function SpellsStep({
  summary,
  character,
  newLevel,
  newCantrips,
  setNewCantrips,
  newSpells,
  setNewSpells,
  newSpellbook,
  setNewSpellbook,
  swapOldSpell,
  setSwapOldSpell,
  swapNewSpell,
  setSwapNewSpell,
  wantsToSwap,
  setWantsToSwap,
  spellSearch,
  setSpellSearch,
  customCantripName,
  setCustomCantripName,
  customSpellName,
  setCustomSpellName,
  expandedSpellIds,
  setExpandedSpellIds,
  getMagicState,
}: SpellsStepProps) {
  const { colors } = useTheme();
  const unidades = useUnidadesActuales();

  if (!summary?.spellLearning || !character) return null;
  const sl = summary.spellLearning;
  const classId = character.clase as any;
  const magicState = getMagicState();
  const alreadyKnown = new Set([
    ...(magicState?.knownSpellIds ?? []),
    ...(magicState?.spellbookIds ?? []),
  ]);

  // Prepared casters (Clérigo, Druida, Paladín) don't learn spells here — they prepare from class list
  const isPreparedCaster =
    sl.preparationType === "prepared" &&
    !SPELLS_KNOWN[character.clase as ClassId];

  const prepLabel: Record<string, string> = {
    known: "Aprendes hechizos automáticamente",
    prepared: "Preparas hechizos de tu lista de clase",
    spellbook: "Anotas hechizos en tu libro de conjuros",
    pact: "Aprendes hechizos de pacto",
    none: "",
  };

  // ── Helpers ──

  const addCustomCantrip = () => {
    const name = customCantripName.trim();
    if (!name) return;
    const customId = `custom:truco:${name}`;
    if (newCantrips.includes(customId) || alreadyKnown.has(customId)) return;
    if (sl.newCantrips > 0 && newCantrips.length >= sl.newCantrips) return;
    setNewCantrips((prev) => [...prev, customId]);
    setCustomCantripName("");
  };

  const addCustomSpell = () => {
    const name = customSpellName.trim();
    if (!name) return;
    const customId = `custom:${name}`;
    if (newSpells.includes(customId) || alreadyKnown.has(customId)) return;
    if (sl.newSpellsKnown > 0 && newSpells.length >= sl.newSpellsKnown) return;
    setNewSpells((prev) => [...prev, customId]);
    setCustomSpellName("");
  };

  const toggleSpell = (
    id: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    max: number,
  ) => {
    if (list.includes(id)) {
      setList(list.filter((s) => s !== id));
    } else if (list.length < max) {
      setList([...list, id]);
    }
  };

  const matchesSearch = (spell: SrdSpell) => {
    if (!spellSearch.trim()) return true;
    const q = spellSearch.toLowerCase();
    return (
      spell.nombre.toLowerCase().includes(q) ||
      spell.escuela.toLowerCase().includes(q)
    );
  };

  // IDs already chosen in another section (prevent duplicates across sections)
  const allChosenIds = new Set([
    ...newCantrips,
    ...newSpells,
    ...newSpellbook,
    ...(swapNewSpell ? [swapNewSpell] : []),
  ]);

  const renderSpellCard = (
    spell: SrdSpell,
    selected: boolean,
    onPress: () => void,
    disabled: boolean,
  ) => {
    const bgColor = selected
      ? withAlpha(colors.accentRed, 0.12)
      : colors.bgCard;
    const cardBorderColor = selected ? colors.accentRed : colors.borderDefault;
    const isExpanded = expandedSpellIds.has(spell.id);
    const desc = getSpellDescription(spell.id);

    const toggleExpand = () => {
      setExpandedSpellIds((prev) => {
        const next = new Set(prev);
        if (next.has(spell.id)) next.delete(spell.id);
        else next.add(spell.id);
        return next;
      });
    };

    return (
      <View
        key={spell.id}
        style={{
          backgroundColor: bgColor,
          borderRadius: 12,
          borderWidth: selected ? 2 : 1,
          borderColor: cardBorderColor,
          marginBottom: 8,
          opacity: disabled && !selected ? 0.45 : 1,
        }}
      >
        <TouchableOpacity
          onPress={disabled && !selected ? undefined : onPress}
          activeOpacity={0.7}
          style={{
            padding: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* Check indicator */}
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: selected
                ? colors.accentRed
                : withAlpha(colors.textMuted, 0.27),
              backgroundColor: selected ? colors.accentRed : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {selected && (
              <Ionicons
                name="checkmark"
                size={14}
                color={colors.textInverted}
              />
            )}
          </View>
          {/* Spell info */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: selected ? colors.accentRed : colors.textPrimary,
                fontSize: 14,
                fontWeight: "700",
              }}
            >
              {spell.nombre}
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 12,
                fontWeight: "500",
                marginTop: 2,
              }}
            >
              {spell.escuela}
              {spell.nivel > 0
                ? ` — ${SPELL_LEVEL_NAMES[spell.nivel as SpellLevel]}`
                : " — Truco"}
              {desc ? `  ·  ⏱ ${desc.tiempo}` : ""}
            </Text>
          </View>
          {/* Expand/collapse */}
          {desc && (
            <TouchableOpacity
              onPress={toggleExpand}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ padding: 4 }}
            >
              <Ionicons
                name={isExpanded ? "chevron-up" : "information-circle-outline"}
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Expanded description */}
        {isExpanded && desc && (
          <View
            style={{
              paddingHorizontal: 12,
              paddingBottom: 12,
              paddingTop: 0,
              borderTopWidth: 1,
              borderTopColor: colors.borderDefault,
              marginHorizontal: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 6,
                marginTop: 8,
                marginBottom: 6,
              }}
            >
              {desc.alcance ? (
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                  📏 {formatAlcanceRaw(desc.alcance, unidades)}
                </Text>
              ) : null}
              {desc.duracion ? (
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                  · ⏳ {desc.duracion}
                </Text>
              ) : null}
              {desc.componentes ? (
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                  · 🧩 {desc.componentes}
                </Text>
              ) : null}
            </View>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                lineHeight: 18,
              }}
            >
              {desc.descripcion}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Helper to build spell cards for a list, avoiding deep nesting
  const buildSpellCards = (
    spellsInLevel: SrdSpell[],
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
    max: number,
  ) =>
    spellsInLevel.map((spell) =>
      renderSpellCard(
        spell,
        selected.includes(spell.id),
        () => toggleSpell(spell.id, selected, setSelected, max),
        selected.length >= max && !selected.includes(spell.id),
      ),
    );

  // ── Section: Selectable spell list ──
  const renderSpellSection = (opts: {
    title: string;
    subtitle: string;
    spells: SrdSpell[];
    selected: string[];
    setSelected: React.Dispatch<React.SetStateAction<string[]>>;
    max: number;
    accentColor: string;
    excludeIds?: Set<string>;
  }) => {
    const {
      title,
      subtitle,
      spells,
      selected,
      setSelected,
      max,
      accentColor,
      excludeIds,
    } = opts;
    const filteredSpells = spells.filter(
      (s) =>
        matchesSearch(s) && !alreadyKnown.has(s.id) && !excludeIds?.has(s.id),
    );

    // Group by level for non-cantrip sections
    const grouped = new Map<number, SrdSpell[]>();
    for (const s of filteredSpells) {
      const key = s.nivel;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(s);
    }
    const sortedLevels = Array.from(grouped.keys()).sort((a, b) => a - b);

    const levelCards = sortedLevels.map((lvl) => ({
      lvl,
      cards: buildSpellCards(grouped.get(lvl)!, selected, setSelected, max),
    }));

    return (
      <View style={{ marginBottom: 20 }}>
        {/* Section header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {title}
          </Text>
          <View
            style={{
              backgroundColor:
                selected.length === max
                  ? withAlpha(colors.accentRed, 0.15)
                  : withAlpha(colors.accentRed, 0.12),
              paddingHorizontal: 10,
              paddingVertical: 3,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color:
                  selected.length === max ? colors.accentRed : colors.accentRed,
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              {selected.length}/{max}
            </Text>
          </View>
        </View>
        {subtitle ? (
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 13,
              fontWeight: "500",
              marginBottom: 10,
              lineHeight: 18,
            }}
          >
            {subtitle}
          </Text>
        ) : null}

        {/* Spell list grouped by level */}
        {levelCards.map(({ lvl, cards }) => (
          <View key={`lvl-${lvl}`}>
            {sortedLevels.length > 1 && (
              <Text
                style={{
                  color: accentColor,
                  fontSize: 11,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginTop: 8,
                  marginBottom: 6,
                  paddingLeft: 4,
                }}
              >
                {lvl === 0 ? "Trucos" : SPELL_LEVEL_NAMES[lvl as SpellLevel]}
              </Text>
            )}
            {cards}
          </View>
        ))}

        {filteredSpells.length === 0 && (
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 13,
              fontWeight: "500",
              textAlign: "center",
              paddingVertical: 16,
            }}
          >
            No se encontraron hechizos
          </Text>
        )}
      </View>
    );
  };

  // ── Available spell lists ──
  const availableCantrips = getCantripsForClass(classId);
  const availableSpells = getSpellsForClassUpToLevel(classId, sl.maxSpellLevel);

  // Exclude IDs already selected in other sections
  const cantripExclude = new Set([...newSpells, ...newSpellbook]);
  const spellExclude = new Set([...newCantrips, ...newSpellbook]);
  const bookExclude = new Set([...newCantrips, ...newSpells]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {/* Header */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: withAlpha(colors.accentRed, 0.1),
            borderWidth: 1,
            borderColor: withAlpha(colors.accentRed, 0.2),
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Ionicons name="sparkles" size={28} color={colors.accentRed} />
        </View>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 18,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          Hechizos Nuevos
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 14,
            fontWeight: "500",
            textAlign: "center",
            marginTop: 6,
            lineHeight: 20,
            paddingHorizontal: 20,
          }}
        >
          {prepLabel[sl.preparationType] ?? ""}
        </Text>
      </View>

      {/* Spell level info badge */}
      {sl.gainsNewSpellLevel && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: withAlpha(colors.accentRed, 0.12),
            borderRadius: 12,
            borderWidth: 1,
            borderColor: withAlpha(colors.accentRed, 0.3),
            padding: 12,
            marginBottom: 16,
            gap: 10,
          }}
        >
          <Ionicons name="star" size={18} color={colors.accentRed} />
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 14,
              fontWeight: "600",
              flex: 1,
            }}
          >
            ¡Desbloqueas hechizos de{" "}
            {SPELL_LEVEL_NAMES[sl.maxSpellLevel as SpellLevel]}!
          </Text>
        </View>
      )}

      {/* Max spell level info */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.bgCard,
          borderRadius: 10,
          padding: 10,
          marginBottom: 16,
          gap: 8,
        }}
      >
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={colors.textMuted}
        />
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 13,
            fontWeight: "500",
            flex: 1,
          }}
        >
          Nivel máximo de hechizo disponible:{" "}
          {SPELL_LEVEL_NAMES[sl.maxSpellLevel as SpellLevel]}
        </Text>
      </View>

      {/* Prepared caster info: spells are managed from Abilities tab */}
      {isPreparedCaster && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: withAlpha(colors.accentRed, 0.08),
            borderRadius: 10,
            padding: 10,
            marginBottom: 16,
            gap: 8,
          }}
        >
          <Ionicons name="book-outline" size={16} color={colors.accentRed} />
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 13,
              fontWeight: "500",
              flex: 1,
              lineHeight: 18,
            }}
          >
            Puedes preparar conjuros de tu lista de clase desde la pestaña
            Habilidades. Aquí solo seleccionas trucos nuevos.
          </Text>
        </View>
      )}

      {/* Search filter */}
      <View
        style={{
          backgroundColor: colors.bgCard,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: spellSearch
            ? withAlpha(colors.accentRed, 0.4)
            : colors.borderDefault,
          paddingHorizontal: 14,
          paddingVertical: Platform.OS === "ios" ? 10 : 4,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Ionicons name="search-outline" size={16} color={colors.textMuted} />
        <TextInput
          value={spellSearch}
          onChangeText={setSpellSearch}
          placeholder="Buscar hechizo..."
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          style={{
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: "500",
            flex: 1,
            paddingVertical: Platform.OS === "ios" ? 0 : 6,
          }}
        />
        {spellSearch.length > 0 && (
          <TouchableOpacity onPress={() => setSpellSearch("")}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── New Cantrips ── */}
      {sl.newCantrips > 0 &&
        renderSpellSection({
          title: "Trucos Nuevos",
          subtitle: "",
          spells: availableCantrips,
          selected: newCantrips,
          setSelected: setNewCantrips,
          max: sl.newCantrips,
          accentColor: colors.accentRed,
          excludeIds: cantripExclude,
        })}

      {/* ── Custom cantrips already added ── */}
      {newCantrips.filter((id) => id.startsWith("custom:")).length > 0 && (
        <View style={{ marginBottom: 8 }}>
          {newCantrips
            .filter((id) => id.startsWith("custom:"))
            .map((id) => {
              const name = id
                .replace(/^custom:truco:/, "")
                .replace(/^custom:/, "");
              return (
                <View
                  key={id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: withAlpha(colors.accentRed, 0.12),
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: colors.accentRed,
                    padding: 12,
                    marginBottom: 8,
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: colors.accentRed,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={colors.textInverted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.accentRed,
                        fontSize: 14,
                        fontWeight: "700",
                      }}
                    >
                      {name}
                    </Text>
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontSize: 12,
                        fontWeight: "500",
                        marginTop: 2,
                      }}
                    >
                      Personalizado — Truco
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      setNewCantrips((prev) => prev.filter((s) => s !== id))
                    }
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
        </View>
      )}

      {/* ── Add custom cantrip ── */}
      {sl.newCantrips > 0 && newCantrips.length < sl.newCantrips && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.bgCard,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: customCantripName.trim()
              ? withAlpha(colors.accentRed, 0.4)
              : colors.borderDefault,
            paddingHorizontal: 12,
            paddingVertical: Platform.OS === "ios" ? 8 : 4,
            marginBottom: 20,
            gap: 8,
          }}
        >
          <Ionicons name="create-outline" size={16} color={colors.textMuted} />
          <TextInput
            value={customCantripName}
            onChangeText={setCustomCantripName}
            placeholder="Añadir truco personalizado..."
            placeholderTextColor={colors.textMuted}
            autoCapitalize="sentences"
            onSubmitEditing={addCustomCantrip}
            returnKeyType="done"
            style={{
              color: colors.textPrimary,
              fontSize: 14,
              fontWeight: "500",
              flex: 1,
              paddingVertical: Platform.OS === "ios" ? 0 : 6,
            }}
          />
          {customCantripName.trim().length > 0 && (
            <TouchableOpacity
              onPress={addCustomCantrip}
              style={{
                backgroundColor: withAlpha(colors.accentRed, 0.15),
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text
                style={{
                  color: colors.accentRed,
                  fontSize: 13,
                  fontWeight: "700",
                }}
              >
                Añadir
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── New Spells Known ── */}
      {sl.newSpellsKnown > 0 &&
        renderSpellSection({
          title: "Hechizos Nuevos",
          subtitle: `Elige hechizos de hasta ${SPELL_LEVEL_NAMES[sl.maxSpellLevel as SpellLevel]}.`,
          spells: availableSpells,
          selected: newSpells,
          setSelected: setNewSpells,
          max: sl.newSpellsKnown,
          accentColor: colors.accentRed,
          excludeIds: spellExclude,
        })}

      {/* ── Custom spells already added ── */}
      {newSpells.filter((id) => id.startsWith("custom:")).length > 0 && (
        <View style={{ marginBottom: 8 }}>
          {newSpells
            .filter((id) => id.startsWith("custom:"))
            .map((id) => {
              const name = id.replace(/^custom:/, "");
              return (
                <View
                  key={id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: withAlpha(colors.accentRed, 0.12),
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: colors.accentRed,
                    padding: 12,
                    marginBottom: 8,
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: colors.accentRed,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={colors.textInverted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.accentRed,
                        fontSize: 14,
                        fontWeight: "700",
                      }}
                    >
                      {name}
                    </Text>
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontSize: 12,
                        fontWeight: "500",
                        marginTop: 2,
                      }}
                    >
                      Personalizado
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      setNewSpells((prev) => prev.filter((s) => s !== id))
                    }
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
        </View>
      )}

      {/* ── Add custom spell ── */}
      {sl.newSpellsKnown > 0 && newSpells.length < sl.newSpellsKnown && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.bgCard,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: customSpellName.trim()
              ? withAlpha(colors.accentRed, 0.4)
              : colors.borderDefault,
            paddingHorizontal: 12,
            paddingVertical: Platform.OS === "ios" ? 8 : 4,
            marginBottom: 20,
            gap: 8,
          }}
        >
          <Ionicons name="create-outline" size={16} color={colors.textMuted} />
          <TextInput
            value={customSpellName}
            onChangeText={setCustomSpellName}
            placeholder="Añadir conjuro personalizado..."
            placeholderTextColor={colors.textMuted}
            autoCapitalize="sentences"
            onSubmitEditing={addCustomSpell}
            returnKeyType="done"
            style={{
              color: colors.textPrimary,
              fontSize: 14,
              fontWeight: "500",
              flex: 1,
              paddingVertical: Platform.OS === "ios" ? 0 : 6,
            }}
          />
          {customSpellName.trim().length > 0 && (
            <TouchableOpacity
              onPress={addCustomSpell}
              style={{
                backgroundColor: withAlpha(colors.accentRed, 0.15),
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text
                style={{
                  color: colors.accentRed,
                  fontSize: 13,
                  fontWeight: "700",
                }}
              >
                Añadir
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── New Spellbook Spells (Wizard only) ── */}
      {sl.newSpellbookSpells > 0 &&
        renderSpellSection({
          title: "Libro de Conjuros",
          subtitle: "Añade hechizos de mago a tu libro de conjuros.",
          spells: availableSpells,
          selected: newSpellbook,
          setSelected: setNewSpellbook,
          max: sl.newSpellbookSpells,
          accentColor: colors.accentRed,
          excludeIds: bookExclude,
        })}

      {/* ── Spell Swap ── */}
      {sl.canSwapSpell && (
        <View style={{ marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => {
              setWantsToSwap(!wantsToSwap);
              if (wantsToSwap) {
                setSwapOldSpell("");
                setSwapNewSpell("");
              }
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: wantsToSwap
                ? withAlpha(colors.accentRed, 0.12)
                : colors.bgCard,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: wantsToSwap
                ? withAlpha(colors.accentRed, 0.4)
                : colors.borderDefault,
              padding: 14,
              gap: 10,
            }}
          >
            <Ionicons
              name={wantsToSwap ? "swap-horizontal" : "swap-horizontal-outline"}
              size={20}
              color={wantsToSwap ? colors.accentRed : colors.textMuted}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Intercambiar un hechizo
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 12,
                  fontWeight: "500",
                  marginTop: 2,
                }}
              >
                Reemplaza un hechizo conocido por otro
              </Text>
            </View>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: wantsToSwap
                  ? colors.accentRed
                  : withAlpha(colors.textMuted, 0.27),
                backgroundColor: wantsToSwap ? colors.accentRed : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {wantsToSwap && (
                <Ionicons
                  name="checkmark"
                  size={14}
                  color={colors.textInverted}
                />
              )}
            </View>
          </TouchableOpacity>

          {wantsToSwap && (
            <View style={{ marginTop: 12, gap: 8 }}>
              {/* Select spell to forget */}
              <Text
                style={{
                  color: colors.accentDanger,
                  fontSize: 12,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: 4,
                }}
              >
                Hechizo a olvidar
              </Text>
              {(magicState?.knownSpellIds ?? ([] as string[]))
                .filter((id: string) => {
                  // Only show non-cantrip spells that can be swapped
                  const sp = getSpellById(id);
                  return sp ? sp.nivel > 0 : true;
                })
                .map((id: string) => {
                  const sp = getSpellById(id);
                  const isSelected = swapOldSpell === id;
                  return (
                    <TouchableOpacity
                      key={`swap-old-${id}`}
                      onPress={() => setSwapOldSpell(isSelected ? "" : id)}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: isSelected
                          ? withAlpha(colors.accentDanger, 0.12)
                          : colors.bgCard,
                        borderRadius: 12,
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected
                          ? colors.accentDanger
                          : colors.borderDefault,
                        padding: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          borderWidth: 2,
                          borderColor: isSelected
                            ? colors.accentDanger
                            : withAlpha(colors.textMuted, 0.27),
                          backgroundColor: isSelected
                            ? colors.accentDanger
                            : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isSelected && (
                          <Ionicons
                            name="close"
                            size={12}
                            color={colors.textInverted}
                          />
                        )}
                      </View>
                      <Text
                        style={{
                          color: isSelected
                            ? colors.accentDanger
                            : colors.textPrimary,
                          fontSize: 14,
                          fontWeight: "600",
                        }}
                      >
                        {sp?.nombre ?? id}
                      </Text>
                      {sp && (
                        <Text
                          style={{
                            color: colors.textMuted,
                            fontSize: 12,
                            fontWeight: "500",
                          }}
                        >
                          {sp.escuela} —{" "}
                          {SPELL_LEVEL_NAMES[sp.nivel as SpellLevel]}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}

              {(magicState?.knownSpellIds ?? ([] as string[])).filter(
                (id: string) => {
                  const sp = getSpellById(id);
                  return sp ? sp.nivel > 0 : true;
                },
              ).length === 0 && (
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 13,
                    textAlign: "center",
                    paddingVertical: 12,
                  }}
                >
                  No tienes hechizos conocidos para intercambiar
                </Text>
              )}

              <View style={{ alignItems: "center", marginVertical: 4 }}>
                <Ionicons
                  name="arrow-down"
                  size={18}
                  color={colors.textMuted}
                />
              </View>

              {/* Select new spell */}
              <Text
                style={{
                  color: colors.accentRed,
                  fontSize: 12,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: 4,
                }}
              >
                Hechizo nuevo
              </Text>
              {availableSpells
                .filter(
                  (s) =>
                    matchesSearch(s) &&
                    !alreadyKnown.has(s.id) &&
                    !allChosenIds.has(s.id),
                )
                .map((spell) => {
                  const isSelected = swapNewSpell === spell.id;
                  return (
                    <TouchableOpacity
                      key={`swap-new-${spell.id}`}
                      onPress={() =>
                        setSwapNewSpell(isSelected ? "" : spell.id)
                      }
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: isSelected
                          ? withAlpha(colors.accentRed, 0.12)
                          : colors.bgCard,
                        borderRadius: 12,
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected
                          ? colors.accentRed
                          : colors.borderDefault,
                        padding: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          borderWidth: 2,
                          borderColor: isSelected
                            ? colors.accentRed
                            : withAlpha(colors.textMuted, 0.27),
                          backgroundColor: isSelected
                            ? colors.accentRed
                            : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color={colors.textInverted}
                          />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: isSelected
                              ? colors.accentRed
                              : colors.textPrimary,
                            fontSize: 14,
                            fontWeight: "600",
                          }}
                        >
                          {spell.nombre}
                        </Text>
                        <Text
                          style={{
                            color: colors.textMuted,
                            fontSize: 12,
                            fontWeight: "500",
                            marginTop: 1,
                          }}
                        >
                          {spell.escuela} —{" "}
                          {SPELL_LEVEL_NAMES[spell.nivel as SpellLevel]}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
