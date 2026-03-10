/**
 * Compendium Screen (HU-13)
 *
 * Browsable SRD 5.1 reference organized by 7 categories:
 * - Razas, Clases, Conjuros, Objetos, Dotes, Subclases, Trasfondos
 *
 * Features:
 * - Global search across all categories
 * - Expandable detail cards (GlowCard based)
 * - Scrollable tab bar for 7 categories
 * - Spell-specific filtering (level, school, class)
 * - Dark D&D-themed styling
 */

import { useState, useMemo, useCallback } from "react";
import { useTheme, useEntranceAnimation } from "@/hooks";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  SearchBar,
  ScreenContainer,
  PageHeader,
  EmptyState,
  ScrollableTabBar,
} from "@/components/ui";
import type { TabItem } from "@/components/ui/SegmentedTabs";
import {
  getRaceList,
  getClassList,
  getBackgroundList,
  SRD_SPELLS,
  getAllSrdItems,
  ALL_FEATS,
  SUBCLASS_OPTIONS,
} from "@/data/srd";
import type { SrdSpell, SrdItemTemplate, SubclassOption } from "@/data/srd";
import type { Feat } from "@/data/srd";
import type { ClassId } from "@/types/character";
import { SPELL_LEVEL_NAMES } from "@/constants/spells";
import type { SpellLevel } from "@/types/spell";

import {
  RaceCard,
  ClassCard,
  BackgroundCard,
  SpellCard,
  ItemCard,
  FeatCard,
  SubclassCard,
} from "@/components/compendium";

// ─── Types ───────────────────────────────────────────────────────────

type TabId =
  | "razas"
  | "clases"
  | "conjuros"
  | "objetos"
  | "dotes"
  | "subclases"
  | "trasfondos";

// Discriminated union for FlatList items
type CompendiumItem =
  | {
      _type: "race";
      _expandKey: string;
      data: ReturnType<typeof getRaceList>[number];
    }
  | {
      _type: "class";
      _expandKey: string;
      data: ReturnType<typeof getClassList>[number];
    }
  | {
      _type: "bg";
      _expandKey: string;
      data: ReturnType<typeof getBackgroundList>[number];
    }
  | { _type: "spell"; _expandKey: string; data: SrdSpell }
  | { _type: "item"; _expandKey: string; data: SrdItemTemplate }
  | { _type: "feat"; _expandKey: string; data: Feat }
  | {
      _type: "subclass";
      _expandKey: string;
      data: SubclassOption & { classId: string };
    };

// ─── Tab definitions ─────────────────────────────────────────────────

function getTabs(colors: import("@/utils/theme").ThemeColors): TabItem[] {
  return [
    {
      id: "razas",
      label: "Razas",
      icon: "people-outline",
      iconActive: "people",
      color: colors.accentAmber,
    },
    {
      id: "clases",
      label: "Clases",
      icon: "shield-outline",
      iconActive: "shield",
      color: colors.accentDanger,
    },
    {
      id: "conjuros",
      label: "Conjuros",
      icon: "sparkles-outline",
      iconActive: "sparkles",
      color: colors.accentPurple,
    },
    {
      id: "objetos",
      label: "Objetos",
      icon: "cube-outline",
      iconActive: "cube",
      color: colors.accentGreen,
    },
    {
      id: "dotes",
      label: "Dotes",
      icon: "star-outline",
      iconActive: "star",
      color: colors.accentBlue,
    },
    {
      id: "subclases",
      label: "Subclases",
      icon: "git-branch-outline",
      iconActive: "git-branch",
      color: colors.accentDeepPurple,
    },
    {
      id: "trasfondos",
      label: "Trasfondos",
      icon: "book-outline",
      iconActive: "book",
      color: colors.accentAmber,
    },
  ];
}

// ─── Spell filter helpers ────────────────────────────────────────────

const SPELL_LEVELS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const SPELL_SCHOOLS: string[] = [
  "Abjuración",
  "Adivinación",
  "Conjuración",
  "Encantamiento",
  "Evocación",
  "Ilusión",
  "Nigromancia",
  "Transmutación",
];

const SPELL_CLASS_FILTERS: { id: ClassId; label: string }[] = [
  { id: "bardo", label: "Bardo" },
  { id: "brujo", label: "Brujo" },
  { id: "clerigo", label: "Clérigo" },
  { id: "druida", label: "Druida" },
  { id: "explorador", label: "Explorador" },
  { id: "hechicero", label: "Hechicero" },
  { id: "mago", label: "Mago" },
  { id: "paladin", label: "Paladín" },
];

// ─── Main Component ──────────────────────────────────────────────────

export default function CompendiumScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const TABS = useMemo(() => getTabs(colors), [colors]);
  const [activeTab, setActiveTab] = useState<TabId>("razas");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Spell filters
  const [spellLevelFilter, setSpellLevelFilter] = useState<number | null>(null);
  const [spellSchoolFilter, setSpellSchoolFilter] = useState<string | null>(
    null,
  );
  const [spellClassFilter, setSpellClassFilter] = useState<ClassId | null>(
    null,
  );

  // ── Data loading (memoized once) ──
  const races = useMemo(() => getRaceList(), []);
  const classes = useMemo(() => getClassList(), []);
  const backgrounds = useMemo(() => getBackgroundList(), []);
  const spells = useMemo(() => SRD_SPELLS, []);
  const items = useMemo(() => getAllSrdItems(), []);
  const feats = useMemo(() => ALL_FEATS, []);
  const subclasses = useMemo(() => {
    const result: (SubclassOption & { classId: string })[] = [];
    for (const classId of Object.keys(SUBCLASS_OPTIONS) as ClassId[]) {
      for (const sc of SUBCLASS_OPTIONS[classId]) {
        result.push({ ...sc, classId });
      }
    }
    return result;
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // ── Search filtering ──
  const query = searchQuery.toLowerCase().trim();

  const filteredRaces = useMemo(() => {
    if (!query) return races;
    return races.filter(
      (r) =>
        r.nombre.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query),
    );
  }, [races, query]);

  const filteredClasses = useMemo(() => {
    if (!query) return classes;
    return classes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query),
    );
  }, [classes, query]);

  const filteredBackgrounds = useMemo(() => {
    if (!query) return backgrounds;
    return backgrounds.filter(
      (b) =>
        b.nombre.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query),
    );
  }, [backgrounds, query]);

  const filteredSpells = useMemo(() => {
    let result = spells;
    if (query) {
      result = result.filter(
        (sp) =>
          sp.nombre.toLowerCase().includes(query) ||
          sp.id.toLowerCase().includes(query) ||
          sp.escuela.toLowerCase().includes(query),
      );
    }
    if (spellLevelFilter !== null) {
      result = result.filter((sp) => sp.nivel === spellLevelFilter);
    }
    if (spellSchoolFilter) {
      result = result.filter((sp) => sp.escuela === spellSchoolFilter);
    }
    if (spellClassFilter) {
      result = result.filter((sp) => sp.clases.includes(spellClassFilter));
    }
    return result;
  }, [spells, query, spellLevelFilter, spellSchoolFilter, spellClassFilter]);

  const filteredItems = useMemo(() => {
    if (!query) return items;
    return items.filter(
      (it) =>
        it.nombre.toLowerCase().includes(query) ||
        it.categoria.toLowerCase().includes(query),
    );
  }, [items, query]);

  const filteredFeats = useMemo(() => {
    if (!query) return feats;
    return feats.filter(
      (f) =>
        f.nombre.toLowerCase().includes(query) ||
        f.id.toLowerCase().includes(query) ||
        f.categoria.toLowerCase().includes(query),
    );
  }, [feats, query]);

  const filteredSubclasses = useMemo(() => {
    if (!query) return subclasses;
    return subclasses.filter(
      (sc) =>
        sc.nombre.toLowerCase().includes(query) ||
        sc.id.toLowerCase().includes(query) ||
        sc.classId.toLowerCase().includes(query),
    );
  }, [subclasses, query]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId as TabId);
    setExpandedId(null);
  }, []);

  // ── Build current data ──
  const currentData: CompendiumItem[] = useMemo(() => {
    switch (activeTab) {
      case "razas":
        return filteredRaces.map((r) => ({
          _type: "race" as const,
          _expandKey: `race_${r.id}`,
          data: r,
        }));
      case "clases":
        return filteredClasses.map((c) => ({
          _type: "class" as const,
          _expandKey: `class_${c.id}`,
          data: c,
        }));
      case "conjuros":
        return filteredSpells.map((sp) => ({
          _type: "spell" as const,
          _expandKey: `spell_${sp.id}`,
          data: sp,
        }));
      case "objetos":
        return filteredItems.map((it) => ({
          _type: "item" as const,
          _expandKey: `item_${it.nombre}`,
          data: it,
        }));
      case "dotes":
        return filteredFeats.map((f) => ({
          _type: "feat" as const,
          _expandKey: `feat_${f.id}`,
          data: f,
        }));
      case "subclases":
        return filteredSubclasses.map((sc) => ({
          _type: "subclass" as const,
          _expandKey: `subclass_${sc.classId}_${sc.id}`,
          data: sc,
        }));
      case "trasfondos":
        return filteredBackgrounds.map((b) => ({
          _type: "bg" as const,
          _expandKey: `bg_${b.id}`,
          data: b,
        }));
    }
  }, [
    activeTab,
    filteredRaces,
    filteredClasses,
    filteredSpells,
    filteredItems,
    filteredFeats,
    filteredSubclasses,
    filteredBackgrounds,
  ]);

  // ── Count label ──
  const countLabel = useMemo(() => {
    const n = currentData.length;
    switch (activeTab) {
      case "razas":
        return `${n} raza${n !== 1 ? "s" : ""}`;
      case "clases":
        return `${n} clase${n !== 1 ? "s" : ""}`;
      case "conjuros":
        return `${n} conjuro${n !== 1 ? "s" : ""}`;
      case "objetos":
        return `${n} objeto${n !== 1 ? "s" : ""}`;
      case "dotes":
        return `${n} dote${n !== 1 ? "s" : ""}`;
      case "subclases":
        return `${n} subclase${n !== 1 ? "s" : ""}`;
      case "trasfondos":
        return `${n} trasfondo${n !== 1 ? "s" : ""}`;
    }
  }, [activeTab, currentData.length]);

  // ── Render item dispatcher ──
  const renderItem = useCallback(
    ({ item }: { item: CompendiumItem }) => {
      const isExpanded = expandedId === item._expandKey;
      const onToggle = () => toggleExpand(item._expandKey);

      switch (item._type) {
        case "race":
          return (
            <RaceCard
              data={item.data}
              isExpanded={isExpanded}
              onToggle={onToggle}
            />
          );
        case "class":
          return (
            <ClassCard
              data={item.data}
              isExpanded={isExpanded}
              onToggle={onToggle}
            />
          );
        case "bg":
          return (
            <BackgroundCard
              data={item.data}
              isExpanded={isExpanded}
              onToggle={onToggle}
            />
          );
        case "spell":
          return (
            <SpellCard
              data={item.data}
              isExpanded={isExpanded}
              onToggle={onToggle}
            />
          );
        case "item":
          return (
            <ItemCard
              data={item.data}
              isExpanded={isExpanded}
              onToggle={onToggle}
            />
          );
        case "feat":
          return (
            <FeatCard
              data={item.data}
              isExpanded={isExpanded}
              onToggle={onToggle}
            />
          );
        case "subclass":
          return (
            <SubclassCard
              data={item.data}
              isExpanded={isExpanded}
              onToggle={onToggle}
            />
          );
      }
    },
    [expandedId, toggleExpand],
  );

  const keyExtractor = useCallback(
    (item: CompendiumItem) => item._expandKey,
    [],
  );

  // ── Spell filter bar ──
  const hasActiveSpellFilters =
    spellLevelFilter !== null ||
    spellSchoolFilter !== null ||
    spellClassFilter !== null;

  const clearSpellFilters = useCallback(() => {
    setSpellLevelFilter(null);
    setSpellSchoolFilter(null);
    setSpellClassFilter(null);
  }, []);

  // ── Entrance animation ──
  const { opacity: contentFade } = useEntranceAnimation({ delay: 120 });

  // ── Main Render ──

  const bookIconBadge = (
    <View
      style={[
        styles.headerIconBadge,
        {
          backgroundColor: colors.headerButtonBg,
          borderColor: colors.headerButtonBorder,
        },
      ]}
    >
      <Ionicons name="book" size={18} color={colors.accentGold} />
    </View>
  );

  const ListHeaderComponent = useMemo(
    () => (
      <View>
        {/* Spell filters (only shown on Conjuros tab) */}
        {activeTab === "conjuros" && (
          <View style={styles.filterContainer}>
            {/* Level filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              <Text style={[styles.filterLabel, { color: colors.textMuted }]}>
                Nivel:
              </Text>
              {SPELL_LEVELS.map((lv) => {
                const isActive = spellLevelFilter === lv;
                return (
                  <TouchableOpacity
                    key={`lv_${lv}`}
                    onPress={() => setSpellLevelFilter(isActive ? null : lv)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isActive
                          ? `${colors.accentPurple}25`
                          : colors.tabBg,
                        borderColor: isActive
                          ? colors.accentPurple
                          : colors.tabBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color: isActive
                            ? colors.accentPurple
                            : colors.textMuted,
                        },
                      ]}
                    >
                      {lv === 0
                        ? "Truco"
                        : (SPELL_LEVEL_NAMES[lv as SpellLevel] ?? `Nv.${lv}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* School filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              <Text style={[styles.filterLabel, { color: colors.textMuted }]}>
                Escuela:
              </Text>
              {SPELL_SCHOOLS.map((school) => {
                const isActive = spellSchoolFilter === school;
                return (
                  <TouchableOpacity
                    key={`sch_${school}`}
                    onPress={() =>
                      setSpellSchoolFilter(isActive ? null : school)
                    }
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isActive
                          ? `${colors.accentPurple}25`
                          : colors.tabBg,
                        borderColor: isActive
                          ? colors.accentPurple
                          : colors.tabBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color: isActive
                            ? colors.accentPurple
                            : colors.textMuted,
                        },
                      ]}
                    >
                      {school}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Class filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              <Text style={[styles.filterLabel, { color: colors.textMuted }]}>
                Clase:
              </Text>
              {SPELL_CLASS_FILTERS.map((cls) => {
                const isActive = spellClassFilter === cls.id;
                return (
                  <TouchableOpacity
                    key={`cls_${cls.id}`}
                    onPress={() =>
                      setSpellClassFilter(isActive ? null : cls.id)
                    }
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isActive
                          ? `${colors.accentPurple}25`
                          : colors.tabBg,
                        borderColor: isActive
                          ? colors.accentPurple
                          : colors.tabBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color: isActive
                            ? colors.accentPurple
                            : colors.textMuted,
                        },
                      ]}
                    >
                      {cls.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Clear all */}
            {hasActiveSpellFilters && (
              <TouchableOpacity
                onPress={clearSpellFilters}
                style={[
                  styles.clearFiltersBtn,
                  {
                    backgroundColor: `${colors.accentDanger}15`,
                    borderColor: `${colors.accentDanger}40`,
                  },
                ]}
              >
                <Ionicons
                  name="close-circle"
                  size={14}
                  color={colors.accentDanger}
                />
                <Text
                  style={[
                    styles.clearFiltersBtnText,
                    { color: colors.accentDanger },
                  ]}
                >
                  Limpiar filtros
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Count label */}
        <Text style={[styles.countText, { color: colors.textMuted }]}>
          {countLabel}
        </Text>
      </View>
    ),
    [
      activeTab,
      countLabel,
      colors,
      spellLevelFilter,
      spellSchoolFilter,
      spellClassFilter,
      hasActiveSpellFilters,
      clearSpellFilters,
    ],
  );

  const ListEmptyComponent = useMemo(
    () => (
      <EmptyState
        icon="search"
        title={
          searchQuery
            ? `No se encontraron resultados con "${searchQuery}"`
            : "No hay elementos en esta categoría"
        }
      />
    ),
    [searchQuery],
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <PageHeader
        title="Compendio"
        onBack={() => router.back()}
        rightAction={bookIconBadge}
      />

      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
          placeholder="Buscar en el compendio..."
          animated={false}
        />
      </View>

      {/* Tab Bar (scrollable for 7 tabs) */}
      <ScrollableTabBar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Content */}
      <Animated.View style={{ flex: 1, opacity: contentFade }}>
        <FlatList
          data={currentData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews
          // Performance: large lists benefit from estimated item size
          getItemLayout={undefined}
          maxToRenderPerBatch={12}
          windowSize={7}
          initialNumToRender={10}
        />
      </Animated.View>
    </ScreenContainer>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  headerIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  countText: {
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 4,
  },
  // ── Spell filters ──
  filterContainer: {
    marginBottom: 8,
    gap: 6,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 8,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginRight: 2,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  clearFiltersBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    marginTop: 2,
  },
  clearFiltersBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
