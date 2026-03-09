/**
 * Compendium Screen (HU-13)
 *
 * Browsable SRD 5.1 reference organized by category:
 * - Razas (Races)
 * - Clases (Classes)
 * - Trasfondos (Backgrounds)
 *
 * Features:
 * - Global search across all categories
 * - Expandable detail cards
 * - Tab-based navigation between categories
 * - Dark D&D-themed styling
 */

import { useState, useMemo, useCallback } from "react";
import { useTheme, useEntranceAnimation } from "@/hooks";
import { View, Text, FlatList, StyleSheet, Animated } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  SearchBar,
  ScreenContainer,
  PageHeader,
  EmptyState,
  SegmentedTabs,
} from "@/components/ui";
import type { TabItem } from "@/components/ui/SegmentedTabs";
import {
  getRaceList,
  getClassList,
  getBackgroundList,
} from "@/data/srd";

import { RaceCard, ClassCard, BackgroundCard } from "@/components/compendium";

// ─── Types ───────────────────────────────────────────────────────────

type TabId = "razas" | "clases" | "trasfondos";

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
      id: "trasfondos",
      label: "Trasfondos",
      icon: "book-outline",
      iconActive: "book",
      color: colors.accentBlue,
    },
  ];
}

// ─── Main Component ──────────────────────────────────────────────────

export default function CompendiumScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const TABS = getTabs(colors);
  const [activeTab, setActiveTab] = useState<TabId>("razas");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Data loading ──
  const races = useMemo(() => getRaceList(), []);
  const classes = useMemo(() => getClassList(), []);
  const backgrounds = useMemo(() => getBackgroundList(), []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // ── Filtered data ──
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

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId as TabId);
    setExpandedId(null);
  }, []);

  // ── Render: Tab Content ──
  const currentData = useMemo(() => {
    switch (activeTab) {
      case "razas":
        return filteredRaces.map((r) => ({ ...r, _type: "race" as const, _expandKey: `race_${r.id}` }));
      case "clases":
        return filteredClasses.map((c) => ({ ...c, _type: "class" as const, _expandKey: `class_${c.id}` }));
      case "trasfondos":
        return filteredBackgrounds.map((b) => ({ ...b, _type: "bg" as const, _expandKey: `bg_${b.id}` }));
    }
  }, [activeTab, filteredRaces, filteredClasses, filteredBackgrounds]);

  const countLabel = useMemo(() => {
    switch (activeTab) {
      case "razas":
        return `${filteredRaces.length} raza${filteredRaces.length !== 1 ? "s" : ""}`;
      case "clases":
        return `${filteredClasses.length} clase${filteredClasses.length !== 1 ? "s" : ""}`;
      case "trasfondos":
        return `${filteredBackgrounds.length} trasfondo${filteredBackgrounds.length !== 1 ? "s" : ""}`;
    }
  }, [activeTab, filteredRaces.length, filteredClasses.length, filteredBackgrounds.length]);

  const renderItem = useCallback(({ item }: { item: (typeof currentData)[number] }) => {
    const isExpanded = expandedId === item._expandKey;
    const onToggle = () => toggleExpand(item._expandKey);

    switch (item._type) {
      case "race":
        return <RaceCard data={item} isExpanded={isExpanded} onToggle={onToggle} />;
      case "class":
        return <ClassCard data={item} isExpanded={isExpanded} onToggle={onToggle} />;
      case "bg":
        return <BackgroundCard data={item} isExpanded={isExpanded} onToggle={onToggle} />;
    }
  }, [expandedId, toggleExpand]);

  const keyExtractor = useCallback((item: (typeof currentData)[number]) => item._expandKey, []);

  const ListHeaderComponent = useMemo(() => (
    <Text style={[styles.countText, { color: colors.textMuted }]}>
      {countLabel}
    </Text>
  ), [countLabel, colors.textMuted]);

  const ListEmptyComponent = useMemo(() => (
    <EmptyState
      icon="search"
      title={`No se encontraron resultados con "${searchQuery}"`}
    />
  ), [searchQuery]);

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

      {/* Tab Bar */}
      <SegmentedTabs
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
});
